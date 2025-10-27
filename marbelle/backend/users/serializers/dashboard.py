"""
Dashboard serializers for user profile and password management.
"""

from typing import Any, Dict

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from ..models import User
from ..services import UserService


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile management.
    Delegates profile updates to UserService for business logic.
    """

    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "phone", "company_name"]
        extra_kwargs = {
            "email": {"validators": []},  # Remove built-in validators for email
        }

    def validate_email(self, value: str) -> str:
        """
        Validate email format but allow duplicate emails for security.

        Always returns the email as valid to prevent email enumeration attacks.
        The frontend should inform users that if the email is already registered,
        the change will be silently ignored for security reasons.
        """
        return value

    def update(self, instance: User, validated_data: Dict[str, Any]) -> User:
        """
        Update user profile with email change handling.

        Delegates to UserService.update_user_profile() which handles:
        - Email enumeration protection
        - Email duplicate checking
        - Atomic save operations
        """
        return UserService.update_user_profile(instance, validated_data)


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change.
    Validates current password and new password confirmation.
    Delegates password update to UserService for business logic.
    """

    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)

    def validate_current_password(self, value: str) -> str:
        """
        Validate current password.
        """
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate password confirmation.
        """
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError({"new_password_confirm": "Passwords do not match."})
        return attrs

    def save(self) -> None:
        """
        Save new password using UserService.
        Delegates to UserService.change_password() which handles password update.
        """
        user = self.context["request"].user
        current_password = self.validated_data["current_password"]
        new_password = self.validated_data["new_password"]
        UserService.change_password(user, current_password, new_password)
