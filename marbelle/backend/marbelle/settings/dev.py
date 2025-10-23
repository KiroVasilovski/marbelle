"""
Development settings for marbelle project.
"""

from marbelle.env_config import env_config

from .base import *  # noqa: F403,F405

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = env_config.ALLOWED_HOSTS
CORS_ALLOWED_ORIGINS = env_config.CORS_ALLOWED_ORIGINS

CORS_ALLOW_CREDENTIALS = True

# Database for development - PostgreSQL
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env_config.DB_NAME,
        "USER": env_config.DB_USER,
        "PASSWORD": env_config.DB_PASSWORD,
        "HOST": env_config.DB_HOST,
        "PORT": env_config.DB_PORT,
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
SESSION_COOKIE_DOMAIN = None  # Use default for localhost

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
