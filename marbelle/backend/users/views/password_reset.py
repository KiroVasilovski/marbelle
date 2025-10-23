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

    if not email or "@" not in email:
        return ResponseHandler.error(message="Please provide a valid email address.")

    AuthenticationService.request_password_reset(email)

    return ResponseHandler.success(message="If this email is registered, you will receive password reset instructions.")


@api_view(["POST"])
@permission_classes([AllowAny])
@ratelimit(key="ip", rate=RateLimits.PASSWORD_RESET, method="POST")
def confirm_password_reset(request: Request) -> Response:
    """Password reset confirmation endpoint."""

    serializer = PasswordResetConfirmSerializer(data=request.data)

    if not serializer.is_valid():
        return ResponseHandler.error(message="Password reset failed.", errors=serializer.errors)

    new_password = serializer.validated_data["new_password"]
    token = serializer.validated_data["token"]

    try:
        if AuthenticationService.confirm_password_reset(token, new_password):
            return ResponseHandler.success(
                message="Password reset successful. You can now login with your new password."
            )
        return ResponseHandler.error(message="Password reset failed. Token invalid or expired.")
    except ValueError as e:
        return ResponseHandler.error(message=str(e))
