"""
Authentication API views for user registration, login, logout, and email verification.
"""

from django_ratelimit.decorators import ratelimit
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from core import ResponseHandler

from ..constants import RateLimits
from ..serializers import (
    EmailVerificationSerializer,
    TokenSerializer,
    UserLoginSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)
from ..services import AuthenticationService


@api_view(["POST"])
@permission_classes([AllowAny])
@ratelimit(key="ip", rate=RateLimits.AUTH_REQUESTS, method="POST")
def register_user(request: Request) -> Response:
    """
    User registration endpoint.
    """
    serializer = UserRegistrationSerializer(data=request.data)

    if serializer.is_valid():
        try:
            user, _ = AuthenticationService.register_user(
                email=serializer.validated_data["email"],
                first_name=serializer.validated_data["first_name"],
                last_name=serializer.validated_data["last_name"],
                password=serializer.validated_data["password"],
                phone=serializer.validated_data.get("phone"),
                company_name=serializer.validated_data.get("company_name"),
            )

            return ResponseHandler.success(
                data={"user_id": user.id},
                message="Registration successful. Please check your email for verification instructions.",
                status_code=status.HTTP_201_CREATED,
            )
        except Exception as e:
            return ResponseHandler.error(message=f"Registration failed: {str(e)}")

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
        user = AuthenticationService.verify_user_email(serializer.validated_data["token"].token)

        if user:
            return ResponseHandler.success(message="Email verification successful. Your account is now active.")

        return ResponseHandler.error(message="Email verification failed. Token invalid or expired.")

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

    # Service handles email enumeration protection internally
    AuthenticationService.resend_verification_email(email)

    # Always return success to prevent email enumeration
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
