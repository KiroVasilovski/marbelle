"""
Email change serializers for requesting and confirming email address changes.
Delegates business logic to AuthenticationService.
"""

from typing import Any, Dict

from rest_framework import serializers

from ..models import EmailChangeToken, User
from ..services import AuthenticationService


class EmailChangeRequestSerializer(serializers.Serializer):
    """
    Serializer for email change request.
    Validates credentials and new email, delegates token creation to AuthenticationService.
    Industry-standard approach: requires current password + new email.
    """

    current_password = serializers.CharField(write_only=True)
    new_email = serializers.EmailField()

    def validate_current_password(self, value: str) -> str:
        """
        Validate current password for re-authentication.
        """
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_new_email(self, value: str) -> str:
        """
        Validate new email address.
        """
        user = self.context["request"].user

        # Check if new email is same as current
        if user.email.lower() == value.lower():
            raise serializers.ValidationError("New email must be different from current email.")

        # Check if new email already exists in the system
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("This email address is already registered.")

        return value.lower()

    def save(self) -> EmailChangeToken:
        """
        Create email change token via AuthenticationService.
        Service handles:
        - Token deletion (replaces old tokens)
        - Token creation
        - Verification email sending
        """
        user = self.context["request"].user
        current_password = self.validated_data["current_password"]
        new_email = self.validated_data["new_email"]

        email_change_token = AuthenticationService.request_email_change(user, current_password, new_email)
        if not email_change_token:
            raise serializers.ValidationError("Unable to create email change token.")

        return email_change_token


class EmailChangeConfirmSerializer(serializers.Serializer):
    """
    Serializer for email change confirmation.
    Validates token, delegates email change to AuthenticationService.
    """

    token = serializers.CharField()

    def validate_token(self, value: str) -> EmailChangeToken:
        """
        Validate email change token.
        """
        try:
            email_change_token = EmailChangeToken.objects.get(token=value)
            if not email_change_token.is_valid:
                raise serializers.ValidationError("Invalid or expired email change token.")
            return email_change_token
        except EmailChangeToken.DoesNotExist:
            raise serializers.ValidationError("Invalid email change token.")

    def save(self) -> Dict[str, Any]:
        """
        Confirm email change via AuthenticationService.
        Service handles:
        - Atomic email update
        - Token marking as used
        - Username sync with email
        - Notification email sending
        """
        email_change_token = self.validated_data["token"]

        result = AuthenticationService.confirm_email_change(email_change_token.token)
        if not result:
            raise serializers.ValidationError("Unable to confirm email change.")

        return result
