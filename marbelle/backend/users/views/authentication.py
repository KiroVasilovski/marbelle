"""
Authentication API views for user registration, login, logout, and email verification.
"""

from django.utils import timezone
from django_ratelimit.decorators import ratelimit
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from core import ResponseHandler

from ..constants import RateLimits, TokenExpiry
from ..models import EmailVerificationToken, User
from ..serializers import EmailVerificationSerializer, UserLoginSerializer, UserRegistrationSerializer, UserSerializer
from .email_service import send_verification_email


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
    from ..serializers import TokenSerializer

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
