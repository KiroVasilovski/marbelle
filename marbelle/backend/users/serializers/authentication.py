"""
Authentication serializers for user registration and login.
Delegates business logic to AuthenticationService.
"""

from typing import Any, Dict

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from ..models import User
from ..services import AuthenticationService


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    Validates input data, delegates user creation to AuthenticationService.
    """

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "first_name", "last_name", "company_name", "phone", "password", "password_confirm"]

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        """Validate password confirmation."""
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data: Dict[str, Any]) -> User:
        """
        Create user via AuthenticationService.
        Service handles:
        - User creation with inactive status
        - Email verification token generation
        - Verification email sending
        """
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")

        user, _ = AuthenticationService.register_user(
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            password=password,
            phone=validated_data.get("phone"),
            company_name=validated_data.get("company_name"),
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    Validates credentials and returns authenticated user.
    Delegates authentication and last_login update to AuthenticationService.
    """

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        """Validate email and password, authenticate user via service."""
        email = attrs.get("email")
        password = attrs.get("password")

        if email and password:
            # Check if user exists and is active
            try:
                user = User.objects.get(email=email)
                if not user.is_active:
                    raise serializers.ValidationError(
                        "Account is not activated. Please check your email for verification instructions."
                    )
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid email or password.")

            # Authenticate user via AuthenticationService (handles last_login update)
            user = AuthenticationService.authenticate_user(email, password)
            if not user:
                raise serializers.ValidationError("Invalid email or password.")

            attrs["user"] = user
        else:
            raise serializers.ValidationError("Email and password are required.")

        return attrs
