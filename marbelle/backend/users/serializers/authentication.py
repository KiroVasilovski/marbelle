"""Authentication serializers for user registration and login."""

from typing import Any, Dict

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from ..models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    """

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "first_name", "last_name", "company_name", "phone", "password", "password_confirm"]

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate password confirmation.
        """
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    Validates email and password format only.
    """

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
