"""
Email change API views for requesting and confirming email address changes.
"""

from django_ratelimit.decorators import ratelimit
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from core import ResponseHandler

from ..serializers import EmailChangeConfirmSerializer, EmailChangeRequestSerializer, UserSerializer
from ..services import AuthenticationService


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@ratelimit(key="user", rate="1000/m", method="POST")
def request_email_change(request: Request) -> Response:
    """
    Email change request endpoint.
    Industry-standard: requires current password + new email.
    """
    serializer = EmailChangeRequestSerializer(data=request.data, context={"request": request})

    if not serializer.is_valid():
        return ResponseHandler.error(message="Email change request failed.", errors=serializer.errors)

    current_password = serializer.validated_data["current_password"]
    new_email = serializer.validated_data["new_email"]

    if AuthenticationService.request_email_change(request.user, current_password, new_email):
        return ResponseHandler.success(
            message="Email change verification sent. Please check your new email to confirm the change."
        )

    return ResponseHandler.error(message="Email change request failed. Invalid password or email already in use.")


@api_view(["POST"])
@permission_classes([AllowAny])
@ratelimit(key="ip", rate="1000/m", method="POST")
def confirm_email_change(request: Request) -> Response:
    """
    Email change confirmation endpoint.
    """
    serializer = EmailChangeConfirmSerializer(data=request.data)

    if not serializer.is_valid():
        return ResponseHandler.error(message="Email change confirmation failed.", errors=serializer.errors)

    token = serializer.validated_data["token"]
    result = AuthenticationService.confirm_email_change(token.token)

    if result:
        user = result["user"]
        return ResponseHandler.success(
            data=UserSerializer(user).data,
            message="Email address changed successfully. You can now use your new email to login.",
        )

    return ResponseHandler.error(message="Email change confirmation failed. Token invalid or expired.")
