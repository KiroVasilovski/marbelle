"""
Base Django settings for marbelle project.
Contains common settings shared across all environments.
"""

from datetime import timedelta
from pathlib import Path

from marbelle.env_config import env_config

# ==============================================================================
# BASE SETUP
# ==============================================================================

# Build paths inside the project like this: BASE_DIR / 'subdir'.
# This points to the root of your Django project (where manage.py resides).
BASE_DIR = Path(__file__).resolve().parent.parent.parent


# ==============================================================================
# SECURITY SETTINGS
# ==============================================================================

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env_config.SECRET_KEY


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
    "cloudinary_storage",
    "cloudinary",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",
]

INSTALLED_APPS = DJANGO_APPS + LOCAL_APPS + THIRD_PARTY_APPS


# ==============================================================================
# MIDDLEWARE DEFINITION
# ==============================================================================

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
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
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
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
# SESSION CONFIGURATION
# ==============================================================================

# Session engine - database backend for persistent sessions
SESSION_ENGINE = "django.contrib.sessions.backends.db"

# Session behavior
SESSION_COOKIE_AGE = 60 * 60 * 24 * 28  # 4 weeks (2419200 seconds)
SESSION_COOKIE_NAME = "marbelle_sessionid"
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_SAVE_EVERY_REQUEST = False  # Only save when session is modified
SESSION_EXPIRE_AT_BROWSER_CLOSE = False  # Allow persistent sessions
SESSION_SERIALIZER = "django.contrib.sessions.serializers.JSONSerializer"


# ==============================================================================
# CORS HEADERS CONFIGURATION
# ==============================================================================

# CORS settings for frontend
FRONTEND_URL = env_config.FRONTEND_URL
CORS_ALLOWED_ORIGINS = env_config.CORS_ALLOWED_ORIGINS
CORS_ALLOW_CREDENTIALS = True

# Additional CORS settings for development
CORS_ALLOW_ALL_ORIGINS = False  # Keep this False for security
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
    "x-session-id",
    "X-Session-ID",
]

# Expose session header to frontend (Safari compatibility)
CORS_EXPOSE_HEADERS = [
    "X-Session-ID",
]

CSRF_TRUSTED_ORIGINS = env_config.CSRF_TRUSTED_ORIGINS


# ==============================================================================
# EMAIL CONFIGURATION
# ==============================================================================

# Email Configuration (will be configured per environment)
EMAIL_BACKEND = env_config.EMAIL_BACKEND
EMAIL_HOST = env_config.EMAIL_HOST
EMAIL_PORT = env_config.EMAIL_PORT
EMAIL_USE_TLS = env_config.EMAIL_USE_TLS
EMAIL_USE_SSL = env_config.EMAIL_USE_SSL
EMAIL_HOST_USER = env_config.EMAIL_HOST_USER
EMAIL_HOST_PASSWORD = env_config.EMAIL_HOST_PASSWORD
DEFAULT_FROM_EMAIL = env_config.DEFAULT_FROM_EMAIL


# ==============================================================================
# CLOUDINARY CONFIGURATION
# ==============================================================================

CLOUDINARY_STORAGE = {
    "CLOUD_NAME": env_config.CLOUDINARY_CLOUD_NAME,
    "API_KEY": env_config.CLOUDINARY_API_KEY,
    "API_SECRET": env_config.CLOUDINARY_API_SECRET,
}

# Use Cloudinary only if credentials are configured
USE_CLOUDINARY = env_config.USE_CLOUDINARY

if USE_CLOUDINARY:
    DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
