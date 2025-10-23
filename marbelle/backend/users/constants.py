"""
Constants for the users application.
This module contains all configuration values and business rules.
"""

from datetime import timedelta


class RateLimits:
    """Rate limiting configuration for authentication endpoints."""

    AUTH_REQUESTS = "10/m"
    PASSWORD_RESET = "10/m"
    EMAIL_VERIFICATION = "10/m"
    EMAIL_CHANGE = "10/m"


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
