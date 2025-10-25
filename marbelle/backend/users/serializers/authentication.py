"""
Authentication serializers for user registration and login.
"""

from typing import Any, Dict

from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
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
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data: Dict[str, Any]) -> User:
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")

        # Create user with inactive status
        user = User.objects.create_user(
            username=validated_data["email"],  # Use email as username
            is_active=False,  # Account remains inactive until email verification
            **validated_data,
        )
        user.set_password(password)
        user.save()

        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    """

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
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

            # Authenticate user
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError("Invalid email or password.")

            # Update last_login field
            user.last_login = timezone.now()
            user.save(update_fields=["last_login"])

            attrs["user"] = user
        else:
            raise serializers.ValidationError("Email and password are required.")

        return attrs
