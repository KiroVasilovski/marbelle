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
from ..models import PasswordResetToken, User
from ..serializers import PasswordResetConfirmSerializer
from .email_service import send_password_reset_email


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
