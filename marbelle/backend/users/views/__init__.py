"""
User API views for authentication, profile management, and address management.
"""

from .address import AddressViewSet
from .authentication import (
    login_user,
    logout_user,
    register_user,
    resend_verification_email,
    verify_email,
    verify_token,
)
from .dashboard import change_password, user_profile
from .email_change import confirm_email_change, request_email_change
from .password_reset import confirm_password_reset, request_password_reset

__all__ = [
    # Authentication
    "register_user",
    "login_user",
    "logout_user",
    "verify_email",
    "resend_verification_email",
    "verify_token",
    # Password Reset
    "request_password_reset",
    "confirm_password_reset",
    # Email Change
    "request_email_change",
    "confirm_email_change",
    # Dashboard
    "user_profile",
    "change_password",
    # Address
    "AddressViewSet",
]
