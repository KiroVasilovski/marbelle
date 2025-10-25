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
from .email_service import send_email_change_notification, send_email_change_verification


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
