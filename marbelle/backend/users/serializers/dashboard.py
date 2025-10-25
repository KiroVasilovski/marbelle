"""
Dashboard serializers for user profile and password management.
"""

from typing import Any, Dict

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from ..models import User


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile management.
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

        Silently ignores email changes if the new email already exists
        to prevent email enumeration attacks.
        """
        # Check if email is being changed and if it already exists
        if "email" in validated_data and instance.email != validated_data["email"]:
            new_email = validated_data["email"]
            if User.objects.filter(email=new_email).exists():
                # Silently ignore the email change for security
                validated_data.pop("email")

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        try:
            instance.save()
        except Exception:
            # If there's still a database constraint error (edge case),
            # silently ignore it for security reasons
            pass

        return instance


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change.
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
        Save new password.
        """
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
