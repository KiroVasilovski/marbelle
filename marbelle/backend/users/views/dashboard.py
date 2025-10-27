"""
User dashboard API views for profile and password management.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from core import ResponseHandler

from ..serializers import PasswordChangeSerializer, UserProfileSerializer
from ..services import UserService


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
        profile_data = UserService.get_user_profile(user)

        return ResponseHandler.success(
            data=profile_data,
            message="Profile retrieved successfully.",
        )
    elif request.method == "PUT":
        serializer = UserProfileSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            # Use service to update profile with email enumeration protection
            UserService.update_user_profile(user, serializer.validated_data)
            profile_data = UserService.get_user_profile(user)

            return ResponseHandler.success(
                data=profile_data,
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
        current_password = serializer.validated_data["current_password"]
        new_password = serializer.validated_data["new_password"]

        # Use service to change password
        success = UserService.change_password(request.user, current_password, new_password)

        if success:
            return ResponseHandler.success(message="Password changed successfully.")
        return ResponseHandler.error(message="Password change failed. Current password is incorrect.")

    return ResponseHandler.error(message="Password change failed.", errors=serializer.errors)
