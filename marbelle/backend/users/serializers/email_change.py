"""Email change serializers for requesting and confirming email address changes."""

from rest_framework import serializers


class EmailChangeRequestSerializer(serializers.Serializer):
    """
    Serializer for email change request.
    Validates credentials and new email.
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
        Validate new email is different from current email.
        """
        user = self.context["request"].user

        if user.email.lower() == value.lower():
            raise serializers.ValidationError("New email must be different from current email.")

        return value.lower()


class EmailChangeConfirmSerializer(serializers.Serializer):
    """
    Serializer for email change confirmation.
    """

    token = serializers.CharField()
