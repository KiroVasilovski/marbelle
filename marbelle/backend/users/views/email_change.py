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

    if serializer.is_valid():
        current_password = serializer.validated_data["current_password"]
        new_email = serializer.validated_data["new_email"]

        # Use service to request email change
        email_change_token = AuthenticationService.request_email_change(request.user, current_password, new_email)

        if email_change_token:
            return ResponseHandler.success(
                message="Email change verification sent. Please check your new email to confirm the change."
            )
        return ResponseHandler.error(message="Email change request failed. Invalid password or email already in use.")

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
        token = serializer.validated_data["token"]

        # Use service to confirm email change
        result = AuthenticationService.confirm_email_change(token.token)

        if result:
            user = result["user"]
            return ResponseHandler.success(
                data=UserSerializer(user).data,
                message="Email address changed successfully. You can now use your new email to login.",
            )
        return ResponseHandler.error(message="Email change confirmation failed. Token invalid or expired.")

    return ResponseHandler.error(message="Email change confirmation failed.", errors=serializer.errors)
