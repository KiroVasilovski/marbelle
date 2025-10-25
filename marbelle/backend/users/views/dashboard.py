"""
User dashboard API views for profile and password management.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from core import ResponseHandler

from ..serializers import PasswordChangeSerializer, UserProfileSerializer


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def user_profile(request: Request) -> Response:
    """
    User profile management endpoint.
    GET: Retrieve current user profile
    PUT: Update user profile
    """
    user = request.user

    if request.method == "GET":
        serializer = UserProfileSerializer(user)
        return ResponseHandler.success(
            data=serializer.data,
            message="Profile retrieved successfully.",
        )

    elif request.method == "PUT":
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return ResponseHandler.success(
                data=serializer.data,
                message="Profile updated successfully.",
            )

        return ResponseHandler.error(message="Profile update failed.", errors=serializer.errors)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request: Request) -> Response:
    """
    Password change endpoint.
    """
    serializer = PasswordChangeSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save()
        return ResponseHandler.success(message="Password changed successfully.")

    return ResponseHandler.error(message="Password change failed.", errors=serializer.errors)
