"""
Email change serializers for requesting and confirming email address changes.
"""

from typing import Any, Dict

from django.db import transaction
from rest_framework import serializers

from ..models import EmailChangeToken, User


class EmailChangeRequestSerializer(serializers.Serializer):
    """
    Serializer for email change request.
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
        Create email change token.
        """
        user = self.context["request"].user
        new_email = self.validated_data["new_email"]

        # Delete any existing email change tokens for this user
        EmailChangeToken.objects.filter(user=user).delete()

        # Create new email change token
        email_change_token = EmailChangeToken.objects.create(user=user, new_email=new_email)

        return email_change_token


class EmailChangeConfirmSerializer(serializers.Serializer):
    """
    Serializer for email change confirmation.
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
        Confirm email change and update user email.
        Returns both user and old email for notification purposes.
        """
        email_change_token = self.validated_data["token"]
        user = email_change_token.user
        old_email = user.email

        with transaction.atomic():
            email_change_token.is_used = True
            email_change_token.save()

            user.email = email_change_token.new_email
            user.username = email_change_token.new_email
            user.save()

        return {"user": user, "old_email": old_email, "new_email": email_change_token.new_email}
