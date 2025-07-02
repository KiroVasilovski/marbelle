"""
Base Django settings for marbelle project.
Contains common settings shared across all environments.
"""

import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

# ==============================================================================
# BASE SETUP
# ==============================================================================

# Load environment variables from .env file
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
# This points to the root of your Django project (where manage.py resides).
BASE_DIR = Path(__file__).resolve().parent.parent.parent


# ==============================================================================
# SECURITY SETTINGS
# ==============================================================================

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-change-me-in-production")


# ==============================================================================
# APPLICATION DEFINITION
# ==============================================================================

# Standard Django apps
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

LOCAL_APPS = [
    "users",
    "products",
    "orders",
    "core",  # For common utilities or base models
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
]

INSTALLED_APPS = DJANGO_APPS + LOCAL_APPS + THIRD_PARTY_APPS


# ==============================================================================
# MIDDLEWARE DEFINITION
# ==============================================================================

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ==============================================================================
# URLS & WSGI/ASGI
# ==============================================================================

ROOT_URLCONF = "marbelle.urls"

WSGI_APPLICATION = "marbelle.wsgi.application"


# ==============================================================================
# TEMPLATE CONFIGURATION
# ==============================================================================

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# ==============================================================================
# AUTHENTICATION & USER MODEL
# ==============================================================================

# Custom User model
AUTH_USER_MODEL = "users.User"

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# ==============================================================================
# INTERNATIONALIZATION & TIME
# ==============================================================================

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


# ==============================================================================
# STATIC & MEDIA FILES
# ==============================================================================

# Static files (CSS, JavaScript, Images)
STATIC_URL = "static/"

# Directory where static files will be collected for deployment.
STATIC_ROOT = BASE_DIR / "staticfiles"

# Directories where Django will look for additional static files.
STATICFILES_DIRS = [
    BASE_DIR / "static",
]


# URL to serve media files (user-uploaded content).
MEDIA_URL = "media/"

# Absolute filesystem path to the directory that will hold user-uploaded files.
MEDIA_ROOT = BASE_DIR / "media"


# ==============================================================================
# DATABASE (Default for base.py, overridden in dev.py/prod.py)
# ==============================================================================

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ==============================================================================
# DJANGO REST FRAMEWORK (DRF) SETTINGS
# ==============================================================================

# Django REST Framework
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ("rest_framework_simplejwt.authentication.JWTAuthentication",),
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}


# ==============================================================================
# DJANGO REST FRAMEWORK SIMPLE JWT CONFIGURATION
# ==============================================================================

# JWT Configuration
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "VERIFYING_KEY": None,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
}


# ==============================================================================
# CORS HEADERS CONFIGURATION
# ==============================================================================

# CORS settings for frontend
FRONTEND_URL = os.getenv("FRONTEND_URL")

allowed_origins = os.getenv("CORS_ALLOWED_ORIGINS")

CORS_ALLOWED_ORIGINS = allowed_origins.split(",") if allowed_origins else []

CORS_ALLOW_CREDENTIALS = True

# Additional CORS settings for development
CORS_ALLOW_ALL_ORIGINS = False  # Keep this False for security
CORS_ALLOWED_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]


# ==============================================================================
# EMAIL CONFIGURATION
# ==============================================================================

# Email Configuration (will be configured per environment)
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True").lower() == "true"
EMAIL_USE_SSL = os.getenv("EMAIL_USE_SSL", "False").lower() == "true"
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "info.marbelle.me@gmail.com")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "info.marbelle.me@gmail.com")
