"""
Password reset API views for requesting and confirming password resets.
"""

from django_ratelimit.decorators import ratelimit
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response

from core import ResponseHandler

from ..constants import RateLimits
from ..serializers import PasswordResetConfirmSerializer
from ..services import AuthenticationService


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

    # Service handles email enumeration protection internally
    AuthenticationService.request_password_reset(email)

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
        new_password = serializer.validated_data["new_password"]
        token = serializer.validated_data["token"]

        # Use service to confirm password reset
        user = AuthenticationService.confirm_password_reset(token.token, new_password)

        if user:
            return ResponseHandler.success(
                message="Password reset successful. You can now login with your new password."
            )
        return ResponseHandler.error(message="Password reset failed. Token invalid or expired.")

    return ResponseHandler.error(message="Password reset failed.", errors=serializer.errors)
