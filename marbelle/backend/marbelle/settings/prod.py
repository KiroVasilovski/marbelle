"""
Production settings for marbelle project.
"""

from marbelle.env_config import env_config

from .base import *  # noqa: F403,F405

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = env_config.ALLOWED_HOSTS

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Database for production (PostgreSQL)
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

# Security settings for production
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_HSTS_SECONDS = 31536000
X_FRAME_OPTIONS = "DENY"

# Session settings for production (HTTPS required)
SESSION_COOKIE_SECURE = True  # HTTPS only
CSRF_COOKIE_SECURE = True  # CSRF protection

# Cookie domain configuration for cross-subdomain support
# Set SESSION_COOKIE_DOMAIN=.onrender.com to share cookies between subdomains
# Leave empty (None) if frontend and backend are on same domain
SESSION_COOKIE_DOMAIN = env_config.SESSION_COOKIE_DOMAIN

# SameSite=None required for cross-site requests (different subdomains)
# Only use None when SESSION_COOKIE_SECURE=True (HTTPS)
if env_config.ENABLE_CROSS_SITE_COOKIES:
    SESSION_COOKIE_SAMESITE = "None"
    CSRF_COOKIE_SAMESITE = "None"
else:
    SESSION_COOKIE_SAMESITE = "Lax"  # Default from base.py
    CSRF_COOKIE_SAMESITE = "Lax"

# Email backend for production
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = env_config.EMAIL_HOST
EMAIL_PORT = env_config.EMAIL_PORT
EMAIL_USE_TLS = True
EMAIL_HOST_USER = env_config.EMAIL_HOST_USER
EMAIL_HOST_PASSWORD = env_config.EMAIL_HOST_PASSWORD

# Logging configuration for production
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "file": {
            "level": "ERROR",
            "class": "logging.FileHandler",
            "filename": BASE_DIR / "logs" / "django.log",  # noqa: F405
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["file"],
        "level": "ERROR",
    },
}
