from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django_ratelimit.decorators import ratelimit
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import EmailVerificationToken, PasswordResetToken, User
from .serializers import (
    EmailVerificationSerializer,
    PasswordResetConfirmSerializer,
    TokenSerializer,
    UserLoginSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)


@api_view(["POST"])
@permission_classes([AllowAny])
@ratelimit(key="ip", rate="5/m", method="POST")
def register_user(request: Request) -> Response:
    """
    User registration endpoint.
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()

        # Create email verification token
        verification_token = EmailVerificationToken.objects.create(user=user)

        # Send verification email
        send_verification_email(user, verification_token.token)

        return Response(
            {
                "success": True,
                "message": "Registration successful. Please check your email for verification instructions.",
                "data": {"user_id": user.id},
            },
            status=status.HTTP_201_CREATED,
        )

    return Response(
        {"success": False, "message": "Registration failed.", "errors": serializer.errors},
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
@ratelimit(key="ip", rate="5/m", method="POST")
def login_user(request: Request) -> Response:
    """
    User login endpoint.
    """
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data["user"]
        token_data = TokenSerializer.get_token_for_user(user)

        return Response(
            {"success": True, "message": "Login successful.", "data": token_data}, status=status.HTTP_200_OK
        )

    return Response(
        {"success": False, "message": "Login failed.", "errors": serializer.errors},
        status=status.HTTP_400_BAD_REQUEST,
    )


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

        return Response({"success": True, "message": "Logout successful."}, status=status.HTTP_200_OK)
    except Exception:
        return Response({"success": False, "message": "Logout failed."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
@ratelimit(key="ip", rate="3/m", method="POST")
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

        return Response(
            {"success": True, "message": "Email verification successful. Your account is now active."},
            status=status.HTTP_200_OK,
        )

    return Response(
        {"success": False, "message": "Email verification failed.", "errors": serializer.errors},
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
@ratelimit(key="ip", rate="3/m", method="POST")
def request_password_reset(request: Request) -> Response:
    """
    Password reset request endpoint.
    Always returns success to prevent email enumeration attacks.
    """
    email = request.data.get("email", "").strip().lower()

    # Validate email format
    if not email or "@" not in email:
        return Response(
            {
                "success": True,
                "message": "If this email is registered, you will receive password reset instructions.",
            },
            status=status.HTTP_200_OK,
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
    return Response(
        {
            "success": True,
            "message": "If this email is registered, you will receive password reset instructions.",
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
@ratelimit(key="ip", rate="3/m", method="POST")
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

        return Response(
            {"success": True, "message": "Password reset successful. You can now login with your new password."},
            status=status.HTTP_200_OK,
        )

    return Response(
        {"success": False, "message": "Password reset failed.", "errors": serializer.errors},
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def verify_token(request: Request) -> Response:
    """
    Token verification endpoint.
    """
    user = request.user
    return Response(
        {"success": True, "message": "Token is valid.", "data": UserSerializer(user).data},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
@ratelimit(key="ip", rate="3/m", method="POST")
def resend_verification_email(request: Request) -> Response:
    """
    Resend email verification endpoint.
    """
    email = request.data.get("email")
    if not email:
        return Response({"success": False, "message": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
        if user.is_active:
            return Response(
                {"success": False, "message": "Account is already activated."}, status=status.HTTP_400_BAD_REQUEST
            )

        # Create new verification token
        verification_token = EmailVerificationToken.objects.create(user=user)

        # Send verification email
        send_verification_email(user, verification_token.token)

        return Response({"success": True, "message": "Verification email sent."}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"success": False, "message": "Email not found."}, status=status.HTTP_404_NOT_FOUND)


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
