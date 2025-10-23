"""Token management service for email verification, password reset, and email change."""

from typing import Optional

from ..models import EmailChangeToken, EmailVerificationToken, PasswordResetToken, User
from ..repositories import TokenRepository


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
        return TokenRepository.get_or_create_email_verification_token(user)

    @staticmethod
    def verify_email_token(token: str) -> Optional[EmailVerificationToken]:
        """
        Verify email token and return if valid.

        Args:
            token: Token string to verify

        Returns:
            EmailVerificationToken if valid, None otherwise
        """
        return TokenRepository.verify_email_token(token)

    @staticmethod
    def mark_email_verification_used(token: EmailVerificationToken) -> None:
        """
        Mark email verification token as used.

        Args:
            token: Token object to mark as used
        """
        TokenRepository.mark_token_used(token)

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
        return TokenRepository.create_password_reset_token(user)

    @staticmethod
    def verify_password_reset_token(token: str) -> Optional[PasswordResetToken]:
        """
        Verify password reset token and return if valid.

        Args:
            token: Token string to verify

        Returns:
            PasswordResetToken if valid, None otherwise
        """
        return TokenRepository.verify_password_reset_token(token)

    @staticmethod
    def mark_password_reset_used(token: PasswordResetToken) -> None:
        """
        Mark password reset token as used.

        Args:
            token: Token object to mark as used
        """
        TokenRepository.mark_token_used(token)

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
        return TokenRepository.create_email_change_token(user, new_email)

    @staticmethod
    def verify_email_change_token(token: str) -> Optional[EmailChangeToken]:
        """
        Verify email change token and return if valid.

        Args:
            token: Token string to verify

        Returns:
            EmailChangeToken if valid, None otherwise
        """
        return TokenRepository.verify_email_change_token(token)

    @staticmethod
    def mark_email_change_used(token: EmailChangeToken) -> None:
        """
        Mark email change token as used.

        Args:
            token: Token object to mark as used
        """
        TokenRepository.mark_token_used(token)

    # ====== CLEANUP METHODS ======

    @staticmethod
    def cleanup_expired_tokens() -> None:
        """
        Delete all expired tokens from database.

        This is an optional maintenance task. Can be called periodically via management command.
        """
        TokenRepository.cleanup_expired_tokens()
