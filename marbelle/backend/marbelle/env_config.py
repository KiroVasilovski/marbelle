"""
Environment configuration management for Marbelle project.

Singleton class that loads all environment variables once at startup
and provides them as simple class attributes.

Usage:
    from marbelle.env_config import env_config

    secret_key = env_config.SECRET_KEY
    debug = env_config.DEBUG
    allowed_hosts = env_config.ALLOWED_HOSTS
"""

import os
from typing import List

from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv


class EnvConfig:
    """
    Singleton environment configuration.
    Loads all environment variables once and stores them as class attributes.
    """

    _instance = None

    def __new__(cls) -> "EnvConfig":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self) -> None:
        """Load environment variables only once."""
        if self._initialized:
            return

        # Load .env file
        load_dotenv()

        # ============================================================================
        # REQUIRED VARIABLES
        # ============================================================================

        self.SECRET_KEY = self._get_env("SECRET_KEY")

        # ============================================================================
        # DATABASE CONFIGURATION
        # ============================================================================

        self.DB_NAME = self._get_env("DB_NAME")
        self.DB_USER = self._get_env("DB_USER")
        self.DB_PASSWORD = self._get_env("DB_PASSWORD")
        self.DB_HOST = self._get_env("DB_HOST")
        self.DB_PORT = self._get_env("DB_PORT")

        # ============================================================================
        # FRONTEND & CORS
        # ============================================================================

        self.FRONTEND_URL = self._get_env("FRONTEND_URL")
        self.CORS_ALLOWED_ORIGINS = self._get_list("CORS_ALLOWED_ORIGINS")
        self.CSRF_TRUSTED_ORIGINS = self._get_list("CSRF_TRUSTED_ORIGINS")
        self.ALLOWED_HOSTS = self._get_list("ALLOWED_HOSTS")

        # ============================================================================
        # EMAIL CONFIGURATION
        # ============================================================================

        self.EMAIL_BACKEND = self._get_env("EMAIL_BACKEND")
        self.EMAIL_HOST = self._get_env("EMAIL_HOST")
        self.EMAIL_PORT = self._get_int("EMAIL_PORT")
        self.EMAIL_USE_TLS = self._get_bool("EMAIL_USE_TLS")
        self.EMAIL_USE_SSL = self._get_bool("EMAIL_USE_SSL")
        self.EMAIL_HOST_USER = self._get_env("EMAIL_HOST_USER")
        self.EMAIL_HOST_PASSWORD = self._get_env("EMAIL_HOST_PASSWORD")
        self.DEFAULT_FROM_EMAIL = self._get_env("DEFAULT_FROM_EMAIL")

        # ============================================================================
        # CLOUDINARY CONFIGURATION
        # ============================================================================

        self.CLOUDINARY_CLOUD_NAME = self._get_env("CLOUDINARY_CLOUD_NAME")
        self.CLOUDINARY_API_KEY = self._get_env("CLOUDINARY_API_KEY")
        self.CLOUDINARY_API_SECRET = self._get_env("CLOUDINARY_API_SECRET")

        # Check if Cloudinary is fully configured
        self.USE_CLOUDINARY = all([self.CLOUDINARY_CLOUD_NAME, self.CLOUDINARY_API_KEY, self.CLOUDINARY_API_SECRET])

        # ============================================================================
        # ENVIRONMENT TYPE
        # ============================================================================

        self.DEBUG = self._get_bool("DEBUG")

        # ============================================================================
        # PRODUCTION SESSION/COOKIE CONFIGURATION
        # ============================================================================

        self.SESSION_COOKIE_DOMAIN = self._get_env("SESSION_COOKIE_DOMAIN")
        self.ENABLE_CROSS_SITE_COOKIES = self._get_bool("ENABLE_CROSS_SITE_COOKIES")

        # Mark as initialized
        self._initialized = True

    # ============================================================================
    # PRIVATE HELPER METHODS
    # ============================================================================

    def _get_env(self, key: str) -> str:
        """Get a required environment variable or raise error."""
        value = os.getenv(key)

        if not value:
            raise ImproperlyConfigured(
                f"Required environment variable '{key}' is not set. Please set it in your .env file or environment."
            )
        return value

    def _get_bool(self, key: str) -> bool:
        """Get a boolean environment variable."""
        value = os.getenv(key)

        if value is None:
            raise ImproperlyConfigured(
                f"Required environment variable '{key}' is not set. Please set it in your .env file or environment."
            )
        return value.lower() in ("true", "1", "yes")

    def _get_int(self, key: str) -> int:
        """Get an integer environment variable."""
        value = os.getenv(key)

        if value is None:
            raise ImproperlyConfigured(
                f"Required environment variable '{key}' is not set. Please set it in your .env file or environment."
            )
        try:
            return int(value)
        except ValueError:
            raise ImproperlyConfigured(f"Environment variable '{key}' must be an integer, got: '{value}'")

    def _get_list(self, key: str, separator: str = ",") -> List[str]:
        """Get a list from a comma-separated environment variable."""
        value = os.getenv(key)

        if not value:
            raise ImproperlyConfigured(
                f"Required environment variable '{key}' is not set. Please set it in your .env file or environment."
            )
        return [item.strip() for item in value.split(separator) if item.strip()]


# Create singleton instance
env_config = EnvConfig()
