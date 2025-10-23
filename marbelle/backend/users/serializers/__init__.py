"""
User serializers for authentication, profile management, and address management.
"""

from .address import AddressSerializer
from .authentication import UserLoginSerializer, UserRegistrationSerializer
from .dashboard import PasswordChangeSerializer, UserProfileSerializer
from .email_change import EmailChangeConfirmSerializer, EmailChangeRequestSerializer
from .tokens import EmailVerificationSerializer, PasswordResetConfirmSerializer, TokenSerializer, UserSerializer

__all__ = [
    # Authentication
    "UserRegistrationSerializer",
    "UserLoginSerializer",
    # Tokens and User Info
    "UserSerializer",
    "TokenSerializer",
    "EmailVerificationSerializer",
    "PasswordResetConfirmSerializer",
    # Dashboard
    "UserProfileSerializer",
    "PasswordChangeSerializer",
    # Email Change
    "EmailChangeRequestSerializer",
    "EmailChangeConfirmSerializer",
    # Address
    "AddressSerializer",
]
