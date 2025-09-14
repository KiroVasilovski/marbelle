"""
Development settings for marbelle project.
"""

import os

from .base import *  # noqa: F403,F405

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

allowed_hosts = os.getenv("ALLOWED_HOSTS")
allowed_origins = os.getenv("CORS_ALLOWED_ORIGINS")

ALLOWED_HOSTS = allowed_hosts.split(",") if allowed_hosts else []

CORS_ALLOWED_ORIGINS = allowed_origins.split(",") if allowed_origins else []

CORS_ALLOW_CREDENTIALS = True

# Database for development - PostgreSQL
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME", "marbelle_db"),
        "USER": os.getenv("DB_USER", "marbelle_user"),
        "PASSWORD": os.getenv("DB_PASSWORD", "marbelle_password"),
        "HOST": os.getenv("DB_HOST", "localhost"),
        "PORT": os.getenv("DB_PORT", "5432"),
    }
}

# Development-specific middleware
MIDDLEWARE += [  # noqa: F405
    # Add development middleware here if needed
]

# Email backend for development
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Session settings for development
SESSION_COOKIE_SECURE = False  # HTTP allowed in development
SESSION_COOKIE_DOMAIN = None   # Use default for localhost

# Logging configuration for development
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}
