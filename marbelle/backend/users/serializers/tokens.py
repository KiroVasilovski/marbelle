"""Token-related serializers for email verification, password reset, and JWT tokens."""

from typing import Any, Dict

from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from ..models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user information (without sensitive data).
    """

    is_business_customer = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "company_name", "phone", "is_business_customer"]
        read_only_fields = ["id"]


class EmailVerificationSerializer(serializers.Serializer):
    """
    Serializer for email verification.
    """

    token = serializers.CharField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for password reset confirmation.
    """

    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, validators=[])
    new_password_confirm = serializers.CharField(write_only=True)

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        # Import validate_password here to avoid circular imports
        from django.contrib.auth.password_validation import validate_password

        self.fields["new_password"].validators = [validate_password]

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError({"new_password_confirm": "Passwords do not match."})
        return attrs


class TokenSerializer(serializers.Serializer):
    """
    Serializer for JWT token response.
    """

    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()

    @classmethod
    def get_token_for_user(cls, user: User) -> Dict[str, Any]:
        """
        Generate JWT tokens for user.
        """
        refresh = RefreshToken.for_user(user)

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        }
