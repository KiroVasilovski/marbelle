from typing import Any

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags
from django_ratelimit.decorators import ratelimit
from rest_framework import status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.tokens import RefreshToken

from core import ResponseHandler

# Note: Response is imported for type hints in function signatures
from .constants import RateLimits, TokenExpiry
from .models import Address, EmailVerificationToken, PasswordResetToken, User
from .serializers import (
    AddressSerializer,
    EmailChangeConfirmSerializer,
    EmailChangeRequestSerializer,
    EmailVerificationSerializer,
    PasswordChangeSerializer,
    PasswordResetConfirmSerializer,
    TokenSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)


@api_view(["POST"])
@permission_classes([AllowAny])
@ratelimit(key="ip", rate=RateLimits.AUTH_REQUESTS, method="POST")
def register_user(request: Request) -> Response:
    """
    User registration endpoint.
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()

        # Get or create email verification token
        verification_token, created = EmailVerificationToken.objects.get_or_create(
            user=user,
            is_used=False,
            defaults={
                "expires_at": timezone.now() + TokenExpiry.get_verification_expiry(),
            },
        )

        # If token already exists and is not expired, reuse it
        if not created and verification_token.is_valid:
            # Token already exists and is valid, use it as-is
            pass
        elif not created and not verification_token.is_valid:
            # Token exists but is expired, create a new one
            verification_token = EmailVerificationToken.objects.create(user=user)

        # Send verification email
        send_verification_email(user, verification_token.token)

        return ResponseHandler.success(
            data={"user_id": user.id},
            message="Registration successful. Please check your email for verification instructions.",
            status_code=status.HTTP_201_CREATED,
        )

    return ResponseHandler.error(message="Registration failed.", errors=serializer.errors)


@api_view(["POST"])
@permission_classes([AllowAny])
@ratelimit(key="ip", rate=RateLimits.AUTH_REQUESTS, method="POST")
def login_user(request: Request) -> Response:
    """
    User login endpoint.
    """
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data["user"]
        token_data = TokenSerializer.get_token_for_user(user)

        return ResponseHandler.success(data=token_data, message="Login successful.")

    return ResponseHandler.error(message="Login failed.", errors=serializer.errors)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_user(request: Request) -> Response:
    """
    User logout endpoint (blacklist refresh token).
    """
    try:
        refresh_token = request.data.get("refresh")
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()

        return ResponseHandler.success(message="Logout successful.")
    except Exception:
        return ResponseHandler.error(message="Logout failed.")


@api_view(["POST"])
@permission_classes([AllowAny])
@ratelimit(key="ip", rate=RateLimits.EMAIL_VERIFICATION, method="POST")
def verify_email(request: Request) -> Response:
    """
    Email verification endpoint.
    """
    serializer = EmailVerificationSerializer(data=request.data)
    if serializer.is_valid():
        verification_token = serializer.validated_data["token"]
        user = verification_token.user

        # Activate user account
        user.is_active = True
        user.save()

        # Mark token as used
        verification_token.is_used = True
        verification_token.save()

        return ResponseHandler.success(message="Email verification successful. Your account is now active.")

    return ResponseHandler.error(message="Email verification failed.", errors=serializer.errors)


@api_view(["POST"])
@permission_classes([AllowAny])
@ratelimit(key="ip", rate=RateLimits.PASSWORD_RESET, method="POST")
def request_password_reset(request: Request) -> Response:
    """
    Password reset request endpoint.
    Always returns success to prevent email enumeration attacks.
    """
    email = request.data.get("email", "").strip().lower()

    # Validate email format
    if not email or "@" not in email:
        return ResponseHandler.success(
            message="If this email is registered, you will receive password reset instructions."
        )

    # Try to find user, but don't reveal if they exist
    try:
        user = User.objects.get(email=email, is_active=True)

        # Create password reset token and send email only if user exists
        reset_token = PasswordResetToken.objects.create(user=user)
        send_password_reset_email(user, reset_token.token)

    except User.DoesNotExist:
        # User doesn't exist, but we still return success
        pass

    # Always return the same success response regardless of whether email exists
    return ResponseHandler.success(message="If this email is registered, you will receive password reset instructions.")


@api_view(["POST"])
@permission_classes([AllowAny])
@ratelimit(key="ip", rate=RateLimits.PASSWORD_RESET, method="POST")
def confirm_password_reset(request: Request) -> Response:
    """
    Password reset confirmation endpoint.
    """
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if serializer.is_valid():
        reset_token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]
        user = reset_token.user

        # Update user password
        user.set_password(new_password)
        user.save()

        # Mark token as used
        reset_token.is_used = True
        reset_token.save()

        return ResponseHandler.success(message="Password reset successful. You can now login with your new password.")

    return ResponseHandler.error(message="Password reset failed.", errors=serializer.errors)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def verify_token(request: Request) -> Response:
    """
    Token verification endpoint.
    """
    user = request.user
    return ResponseHandler.success(
        data=UserSerializer(user).data,
        message="Token is valid.",
    )


@api_view(["POST"])
@permission_classes([AllowAny])
@ratelimit(key="ip", rate=RateLimits.EMAIL_VERIFICATION, method="POST")
def resend_verification_email(request: Request) -> Response:
    """
    Resend email verification endpoint.
    """
    email = request.data.get("email")
    if not email:
        return ResponseHandler.error(message="Email is required.")

    try:
        user = User.objects.get(email=email)
        if user.is_active:
            return ResponseHandler.error(message="Account is already activated.")

        # Create new verification token
        verification_token = EmailVerificationToken.objects.create(user=user)

        # Send verification email
        send_verification_email(user, verification_token.token)

        return ResponseHandler.success(message="Verification email sent.")
    except User.DoesNotExist:
        # Return success to prevent email enumeration
        return ResponseHandler.success(message="If this email is registered, a verification email has been sent.")


def send_verification_email(user: User, token: str) -> None:
    """
    Send email verification email.
    """
    subject = "Verify your Marbelle account"
    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"

    html_message = render_to_string(
        "users/email_verification.html",
        {"user": user, "verification_url": verification_url},
    )
    plain_message = strip_tags(html_message)

    send_mail(
        subject=subject,
        message=plain_message,
        html_message=html_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )


def send_password_reset_email(user: User, token: str) -> None:
    """
    Send password reset email.
    """
    subject = "Reset your Marbelle password"
    reset_url = f"{settings.FRONTEND_URL}/password-reset?token={token}"

    html_message = render_to_string(
        "users/password_reset.html",
        {"user": user, "reset_url": reset_url},
    )
    plain_message = strip_tags(html_message)

    send_mail(
        subject=subject,
        message=plain_message,
        html_message=html_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )


# Email Change API Views


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@ratelimit(key="user", rate="1000/m", method="POST")
def request_email_change(request: Request) -> Response:
    """
    Email change request endpoint.
    Industry-standard: requires current password + new email.
    """
    serializer = EmailChangeRequestSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        email_change_token = serializer.save()

        # Send verification email to new email address
        send_email_change_verification(email_change_token.user, email_change_token.new_email, email_change_token.token)

        return ResponseHandler.success(
            message="Email change verification sent. Please check your new email to confirm the change."
        )

    return ResponseHandler.error(message="Email change request failed.", errors=serializer.errors)


@api_view(["POST"])
@permission_classes([AllowAny])
@ratelimit(key="ip", rate="1000/m", method="POST")
def confirm_email_change(request: Request) -> Response:
    """
    Email change confirmation endpoint.
    """
    serializer = EmailChangeConfirmSerializer(data=request.data)
    if serializer.is_valid():
        result = serializer.save()
        user = result["user"]
        old_email = result["old_email"]
        new_email = result["new_email"]

        # Send notification to old email about the change
        send_email_change_notification(user, old_email, new_email)

        return ResponseHandler.success(
            data=UserSerializer(user).data,
            message="Email address changed successfully. You can now use your new email to login.",
        )

    return ResponseHandler.error(message="Email change confirmation failed.", errors=serializer.errors)


def send_email_change_verification(user: User, new_email: str, token: str) -> None:
    """
    Send email change verification to new email address.
    """
    subject = "Verify your new Marbelle email address"
    verification_url = f"{settings.FRONTEND_URL}/confirm-email-change?token={token}"

    html_message = render_to_string(
        "users/email_change_verification.html",
        {
            "user": user,
            "new_email": new_email,
            "verification_url": verification_url,
        },
    )
    plain_message = strip_tags(html_message)

    send_mail(
        subject=subject,
        message=plain_message,
        html_message=html_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[new_email],
        fail_silently=False,
    )


def send_email_change_notification(user: User, old_email: str, new_email: str) -> None:
    """
    Send security notification to old email address about the change.
    """
    subject = "Marbelle email address changed"

    html_message = render_to_string(
        "users/email_change_notification.html",
        {
            "user": user,
            "old_email": old_email,
            "new_email": new_email,
        },
    )
    plain_message = strip_tags(html_message)

    send_mail(
        subject=subject,
        message=plain_message,
        html_message=html_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[old_email],
        fail_silently=False,
    )


# Dashboard API Views


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def user_profile(request: Request) -> Response:
    """
    User profile management endpoint.
    GET: Retrieve current user profile
    PUT: Update user profile
    """
    user = request.user

    if request.method == "GET":
        serializer = UserProfileSerializer(user)
        return ResponseHandler.success(
            data=serializer.data,
            message="Profile retrieved successfully.",
        )

    elif request.method == "PUT":
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return ResponseHandler.success(
                data=serializer.data,
                message="Profile updated successfully.",
            )

        return ResponseHandler.error(message="Profile update failed.", errors=serializer.errors)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request: Request) -> Response:
    """
    Password change endpoint.
    """
    serializer = PasswordChangeSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save()
        return ResponseHandler.success(message="Password changed successfully.")

    return ResponseHandler.error(message="Password change failed.", errors=serializer.errors)


class AddressViewSet(ModelViewSet):
    """
    ViewSet for address management.
    Provides CRUD operations for user addresses.
    """

    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Return addresses for current user only.
        """
        return Address.objects.filter(user=self.request.user).order_by("-is_primary", "created_at")

    def perform_destroy(self, instance: Address) -> None:
        """
        Custom deletion logic - prevent deletion if it's the only address or used in recent orders.
        """
        user = self.request.user
        address_count = Address.objects.filter(user=user).count()

        if address_count == 1:
            from rest_framework.exceptions import ValidationError

            raise ValidationError("Cannot delete the only address. Please add another address first.")

        # TODO: Add check for recent orders using this address when orders app is available
        # For now, just delete the address
        super().perform_destroy(instance)

    @action(detail=True, methods=["patch"])
    def set_primary(self, request: Request, pk: int | None = None) -> Response:
        """
        Set address as primary.
        """
        with transaction.atomic():
            address = self.get_object()

            # Lock rows for update
            Address.objects.filter(user=request.user, is_primary=True).select_for_update().update(is_primary=False)

            address.is_primary = True
            address.save()

        serializer = self.get_serializer(address)
        return ResponseHandler.success(
            data=serializer.data,
            message="Primary address updated successfully.",
        )

    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        List all addresses for the authenticated user.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return ResponseHandler.success(
            data=serializer.data,
            message="Addresses retrieved successfully.",
        )

    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        Custom create response format.
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return ResponseHandler.success(
                data=serializer.data,
                message="Address created successfully.",
                status_code=status.HTTP_201_CREATED,
            )

        return ResponseHandler.error(
            message="Address creation failed.",
            errors=serializer.errors,
        )

    def update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        Custom update response format.
        """
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if serializer.is_valid():
            serializer.save()
            return ResponseHandler.success(
                data=serializer.data,
                message="Address updated successfully.",
            )

        return ResponseHandler.error(
            message="Address update failed.",
            errors=serializer.errors,
        )

    def destroy(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        Custom delete response format.
        """
        try:
            self.perform_destroy(self.get_object())
            return ResponseHandler.success(message="Address deleted successfully.")
        except Exception as e:
            return ResponseHandler.error(message=str(e))
