"""Dashboard serializers for user profile and password management."""

from typing import Any, Dict

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from ..models import User


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile management.
    Email updates must go through dedicated email change endpoints with verification.
    """

    class Meta:
        model = User
        fields = ["first_name", "last_name", "phone", "company_name"]


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change.
    Validates current password and new password confirmation.
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
        new_password = attrs.get("new_password")
        new_password_confirm = attrs.get("new_password_confirm")

        if new_password != new_password_confirm:
            raise serializers.ValidationError("Passwords do not match.")
        return attrs
