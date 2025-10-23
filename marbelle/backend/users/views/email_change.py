"""Email change API views for requesting and confirming email address changes."""

from django_ratelimit.decorators import ratelimit
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from core import ResponseHandler
from users.constants import RateLimits

from ..serializers import EmailChangeConfirmSerializer, EmailChangeRequestSerializer, UserSerializer
from ..services import AuthenticationService


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@ratelimit(key="user", rate=RateLimits.EMAIL_CHANGE, method="POST")
def request_email_change(request: Request) -> Response:
    """Email change request endpoint."""

    serializer = EmailChangeRequestSerializer(data=request.data, context={"request": request})

    if not serializer.is_valid():
        return ResponseHandler.error(message="Email change request failed.", errors=serializer.errors)

    current_password = serializer.validated_data["current_password"]
    new_email = serializer.validated_data["new_email"]

    try:
        AuthenticationService.request_email_change(request.user, current_password, new_email)
        return ResponseHandler.success(
            message="Email change verification sent. Please check your new email to confirm the change."
        )
    except ValueError as e:
        return ResponseHandler.error(message="Email change request failed.", errors={"new_email": [str(e)]})


@api_view(["POST"])
@permission_classes([AllowAny])
@ratelimit(key="ip", rate=RateLimits.EMAIL_CHANGE, method="POST")
def confirm_email_change(request: Request) -> Response:
    """Email change confirmation endpoint."""

    serializer = EmailChangeConfirmSerializer(data=request.data)

    if not serializer.is_valid():
        return ResponseHandler.error(message="Email change confirmation failed.", errors=serializer.errors)

    token = serializer.validated_data["token"]

    try:
        result = AuthenticationService.confirm_email_change(token)

        user = result["user"]
        return ResponseHandler.success(
            data=UserSerializer(user).data,
            message="Email address changed successfully. You can now use your new email to login.",
        )
    except ValueError as e:
        return ResponseHandler.error(message="Email change confirmation failed.", errors={"token": [str(e)]})
