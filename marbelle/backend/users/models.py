from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models


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
