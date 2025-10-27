"""Token repository for handling token model data access operations."""

from typing import Optional, Type, TypeVar

from django.db import models
from django.utils import timezone

from core.repositories import BaseRepository

from ..constants import TokenExpiry
from ..models import EmailChangeToken, EmailVerificationToken, PasswordResetToken, User

# Generic token type for flexible token handling
T = TypeVar("T", EmailVerificationToken, PasswordResetToken, EmailChangeToken)


class TokenRepository(BaseRepository):
    """
    Repository for token model operations.

    Centralizes all token database queries and eliminates duplicate
    verification logic across email verification, password reset,
    and email change tokens.

    This repository provides generic methods that work with any token type,
    replacing 3x identical verification methods with single parametrized approach.
    """

    # ====== GENERIC TOKEN METHODS ======

    @staticmethod
    def get_token_by_string(token_str: str, token_model: Type[T]) -> Optional[T]:
        """
        Retrieve a token instance by token string.

        Works with any token model type (EmailVerificationToken,
        PasswordResetToken, EmailChangeToken).

        Args:
            token_str: Token string to look up
            token_model: Token model class (EmailVerificationToken, etc.)

        Returns:
            Token instance if found, None otherwise
        """
        try:
            return token_model.objects.get(token=token_str)
        except token_model.DoesNotExist:
            return None

    @staticmethod
    def get_valid_token(token_str: str, token_model: Type[T]) -> Optional[T]:
        """
        Retrieve a token if it's valid (not expired, not used).

        This is a single method that replaces 3x identical verification
        patterns in the codebase.

        Args:
            token_str: Token string to verify
            token_model: Token model class (EmailVerificationToken, etc.)

        Returns:
            Token instance if valid, None otherwise
        """
        token = TokenRepository.get_token_by_string(token_str, token_model)
        if token and token.is_valid:
            return token
        return None

    @staticmethod
    def mark_token_used(token: models.Model) -> None:
        """
        Mark a token as used.

        Args:
            token: Token instance to mark as used
        """
        token.is_used = True
        token.save()

    # ====== EMAIL VERIFICATION TOKEN METHODS ======

    @staticmethod
    def get_or_create_email_verification_token(user: User) -> EmailVerificationToken:
        """
        Get or create email verification token for user.

        Implements smart reuse:
        - Returns existing token if valid (not expired, not used)
        - Creates new token if existing is invalid

        Args:
            user: User object

        Returns:
            Valid EmailVerificationToken
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
        return TokenRepository.get_valid_token(token, EmailVerificationToken)

    # ====== PASSWORD RESET TOKEN METHODS ======

    @staticmethod
    def create_password_reset_token(user: User) -> PasswordResetToken:
        """
        Create password reset token for user.

        Deletes any existing password reset tokens for this user
        to prevent token spam.

        Args:
            user: User object

        Returns:
            New PasswordResetToken
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
        return TokenRepository.get_valid_token(token, PasswordResetToken)

    # ====== EMAIL CHANGE TOKEN METHODS ======

    @staticmethod
    def create_email_change_token(user: User, new_email: str) -> EmailChangeToken:
        """
        Create email change token for user.

        Deletes any existing email change tokens for this user
        to prevent token spam.

        Args:
            user: User object
            new_email: New email address for verification

        Returns:
            New EmailChangeToken
        """
        # Delete any existing email change tokens for this user
        EmailChangeToken.objects.filter(user=user).delete()
        return EmailChangeToken.objects.create(user=user, new_email=new_email)

    @staticmethod
    def get_user_email_change_token(user: User) -> Optional[EmailChangeToken]:
        """
        Retrieve pending email change token for user.

        Returns the most recent unused email change token.

        Args:
            user: User object

        Returns:
            EmailChangeToken if one exists, None otherwise
        """
        try:
            return EmailChangeToken.objects.filter(
                user=user,
                is_used=False,
            ).latest("created_at")
        except EmailChangeToken.DoesNotExist:
            return None

    @staticmethod
    def verify_email_change_token(token: str) -> Optional[EmailChangeToken]:
        """
        Verify email change token and return if valid.

        Args:
            token: Token string to verify

        Returns:
            EmailChangeToken if valid, None otherwise
        """
        return TokenRepository.get_valid_token(token, EmailChangeToken)

    # ====== CLEANUP METHODS ======

    @staticmethod
    def cleanup_expired_tokens() -> None:
        """
        Delete all expired tokens from database.

        This is an optional maintenance task that can be called
        periodically via management command.
        """
        now = timezone.now()

        # Delete expired email verification tokens
        EmailVerificationToken.objects.filter(expires_at__lt=now).delete()

        # Delete expired password reset tokens
        PasswordResetToken.objects.filter(expires_at__lt=now).delete()

        # Delete expired email change tokens
        EmailChangeToken.objects.filter(expires_at__lt=now).delete()
