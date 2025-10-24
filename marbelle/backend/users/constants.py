"""
Constants for the users application.

This module contains all configuration values and business rules for user management,
including rate limits, token expiry, address limits, and session configuration.
"""

from datetime import timedelta


class RateLimits:
    """Rate limiting configuration for authentication endpoints."""

    AUTH_REQUESTS = "5/m"  # Login, register, logout
    PASSWORD_RESET = "5/m"  # Password reset, email verification
    EMAIL_VERIFICATION = "5/m"  # Email verification resend
    EMAIL_CHANGE = "5/m"  # Higher limit for authenticated users


class UserLimits:
    """Business rules for user accounts."""

    MAX_ADDRESSES_PER_USER = 10


class TokenExpiry:
    """Token expiration timeframes."""

    EMAIL_VERIFICATION_HOURS = 24
    PASSWORD_RESET_HOURS = 24
    EMAIL_CHANGE_HOURS = 24

    @classmethod
    def get_verification_expiry(cls: type) -> timedelta:
        """Get email verification token expiry duration."""
        return timedelta(hours=cls.EMAIL_VERIFICATION_HOURS)

    @classmethod
    def get_reset_expiry(cls: type) -> timedelta:
        """Get password reset token expiry duration."""
        return timedelta(hours=cls.PASSWORD_RESET_HOURS)

    @classmethod
    def get_email_change_expiry(cls: type) -> timedelta:
        """Get email change token expiry duration."""
        return timedelta(hours=cls.EMAIL_CHANGE_HOURS)


class SessionConfig:
    """Session management configuration."""

    COOKIE_AGE = timedelta(weeks=4)
    COOKIE_NAME = "marbelle_sessionid"
