"""Token management service for email verification, password reset, and email change."""

from typing import Optional

from django.utils import timezone

from ..constants import TokenExpiry
from ..models import EmailChangeToken, EmailVerificationToken, PasswordResetToken, User


class TokenService:
    """
    Service for managing token lifecycle including creation, validation, reuse, and cleanup.

    Handles three types of tokens:
    - Email verification: Verify email during registration
    - Password reset: Reset forgotten passwords
    - Email change: Change email address

    Implements smart token reuse logic:
    - Reuses valid existing tokens to avoid token spam
    - Creates new tokens when existing ones are expired or used
    - Cleans up invalid tokens automatically
    """

    # ====== EMAIL VERIFICATION TOKEN METHODS ======

    @staticmethod
    def get_or_create_email_verification_token(user: User) -> EmailVerificationToken:
        """
        Get or create email verification token for user.

        Implements smart reuse:
        - Returns existing token if valid (not expired, not used)
        - Creates new token if existing is invalid
        - Replaces expired token with new one

        Args:
            user: User object to create token for

        Returns:
            EmailVerificationToken: Valid token for user
        """
        verification_token, created = EmailVerificationToken.objects.get_or_create(
            user=user,
            is_used=False,
            defaults={
                "expires_at": timezone.now() + TokenExpiry.get_verification_expiry(),
            },
        )

        # If token already exists and is not expired, reuse it
        if not created and verification_token.is_valid:
            # Token already exists and is valid, use it as-is
            return verification_token
        elif not created and not verification_token.is_valid:
            # Token exists but is expired, create a new one
            verification_token = EmailVerificationToken.objects.create(user=user)

        return verification_token

    @staticmethod
    def verify_email_token(token: str) -> Optional[EmailVerificationToken]:
        """
        Verify email token and return if valid.

        Args:
            token: Token string to verify

        Returns:
            EmailVerificationToken if valid, None otherwise
        """
        try:
            token_obj = EmailVerificationToken.objects.get(token=token)
            if token_obj.is_valid:
                return token_obj
        except EmailVerificationToken.DoesNotExist:
            pass
        return None

    @staticmethod
    def mark_email_verification_used(token: EmailVerificationToken) -> None:
        """
        Mark email verification token as used.

        Args:
            token: Token object to mark as used
        """
        token.is_used = True
        token.save()

    # ====== PASSWORD RESET TOKEN METHODS ======

    @staticmethod
    def create_password_reset_token(user: User) -> PasswordResetToken:
        """
        Create password reset token for user.

        Always creates a new token (deletes any existing ones).
        Previous password reset tokens become invalid.

        Args:
            user: User object to create token for

        Returns:
            PasswordResetToken: New reset token
        """
        # Delete any existing password reset tokens for this user
        PasswordResetToken.objects.filter(user=user).delete()

        return PasswordResetToken.objects.create(user=user)

    @staticmethod
    def verify_password_reset_token(token: str) -> Optional[PasswordResetToken]:
        """
        Verify password reset token and return if valid.

        Args:
            token: Token string to verify

        Returns:
            PasswordResetToken if valid, None otherwise
        """
        try:
            token_obj = PasswordResetToken.objects.get(token=token)
            if token_obj.is_valid:
                return token_obj
        except PasswordResetToken.DoesNotExist:
            pass
        return None

    @staticmethod
    def mark_password_reset_used(token: PasswordResetToken) -> None:
        """
        Mark password reset token as used.

        Args:
            token: Token object to mark as used
        """
        token.is_used = True
        token.save()

    # ====== EMAIL CHANGE TOKEN METHODS ======

    @staticmethod
    def create_email_change_token(user: User, new_email: str) -> EmailChangeToken:
        """
        Create email change token for user.

        Deletes any existing email change tokens for this user.

        Args:
            user: User object to create token for
            new_email: New email address to change to

        Returns:
            EmailChangeToken: New email change token
        """
        # Delete any existing email change tokens for this user
        EmailChangeToken.objects.filter(user=user).delete()

        return EmailChangeToken.objects.create(user=user, new_email=new_email)

    @staticmethod
    def verify_email_change_token(token: str) -> Optional[EmailChangeToken]:
        """
        Verify email change token and return if valid.

        Args:
            token: Token string to verify

        Returns:
            EmailChangeToken if valid, None otherwise
        """
        try:
            token_obj = EmailChangeToken.objects.get(token=token)
            if token_obj.is_valid:
                return token_obj
        except EmailChangeToken.DoesNotExist:
            pass
        return None

    @staticmethod
    def mark_email_change_used(token: EmailChangeToken) -> None:
        """
        Mark email change token as used.

        Args:
            token: Token object to mark as used
        """
        token.is_used = True
        token.save()

    # ====== CLEANUP METHODS ======

    @staticmethod
    def cleanup_expired_tokens() -> None:
        """
        Delete all expired tokens from database.

        This is an optional maintenance task. Can be called periodically via management command.
        """
        now = timezone.now()

        # Delete expired email verification tokens
        EmailVerificationToken.objects.filter(expires_at__lt=now).delete()

        # Delete expired password reset tokens
        PasswordResetToken.objects.filter(expires_at__lt=now).delete()

        # Delete expired email change tokens
        EmailChangeToken.objects.filter(expires_at__lt=now).delete()
