import secrets
from datetime import timedelta
from typing import Any

from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    """

    # Make email required and unique
    email = models.EmailField(unique=True, blank=False)

    # Business-specific fields
    company_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Company name for business customers (optional for individual customers)",
    )

    phone_regex = RegexValidator(
        regex=r"^\+?1?\d{9,15}$",
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.",
    )
    phone = models.CharField(
        validators=[phone_regex],
        max_length=20,
        blank=True,
        null=True,
        help_text="Phone number for order communication (optional but recommended)",
    )

    def __str__(self) -> str:
        """String representation showing user type and name."""
        if self.company_name:
            return f"{self.get_full_name()} ({self.company_name})"
        return self.get_full_name() or self.username

    @property
    def is_business_customer(self):
        """
        Determine if user is a business customer based on company_name.

        Returns:
            bool: True if company_name is filled, False otherwise
        """
        return bool(self.company_name and self.company_name.strip())

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        db_table = "users"


class EmailVerificationToken(models.Model):
    """
    Model for email verification tokens.
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="email_verification_tokens")
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def save(self, *args: Any, **kwargs: Any):
        if not self.token:
            self.token = secrets.token_urlsafe(32)
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=24)
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    @property
    def is_valid(self):
        return not self.is_used and not self.is_expired

    def __str__(self) -> str:
        return f"Email verification for {self.user.email}"

    class Meta:
        verbose_name = "Email Verification Token"
        verbose_name_plural = "Email Verification Tokens"
        db_table = "email_verification_tokens"


class PasswordResetToken(models.Model):
    """
    Model for password reset tokens.
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="password_reset_tokens")
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def save(self, *args: Any, **kwargs: Any):
        if not self.token:
            self.token = secrets.token_urlsafe(32)
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=24)
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    @property
    def is_valid(self):
        return not self.is_used and not self.is_expired

    def __str__(self) -> str:
        return f"Password reset for {self.user.email}"

    class Meta:
        verbose_name = "Password Reset Token"
        verbose_name_plural = "Password Reset Tokens"
        db_table = "password_reset_tokens"
