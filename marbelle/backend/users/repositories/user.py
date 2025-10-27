"""User repository for handling User model data access operations."""

from typing import Optional

from core.repositories import BaseRepository

from ..models import User


class UserRepository(BaseRepository):
    """
    Repository for User model operations.

    Centralizes all user database queries to prevent duplication
    and provide consistent optimization.
    """

    model = User

    @staticmethod
    def get_by_email(email: str) -> Optional[User]:
        """
        Retrieve a user by email address.

        This is a centralized method to replace multiple scattered
        User.objects.filter(email=email) patterns across services.

        Args:
            email: User email address

        Returns:
            User instance if found, None otherwise
        """
        try:
            return User.objects.get(email=email)
        except User.DoesNotExist:
            return None

    @staticmethod
    def get_active_by_email(email: str) -> Optional[User]:
        """
        Retrieve an active user by email address.

        Returns only users with is_active=True to prevent authentication
        with unverified or disabled accounts.

        Args:
            email: User email address

        Returns:
            Active user instance if found, None otherwise
        """
        try:
            return User.objects.get(email=email, is_active=True)
        except User.DoesNotExist:
            return None

    @staticmethod
    def get_by_id(user_id: int) -> Optional[User]:
        """
        Retrieve a user by primary key.

        Args:
            user_id: User ID

        Returns:
            User instance if found, None otherwise
        """
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    @staticmethod
    def email_exists(email: str) -> bool:
        """
        Check if a user with given email already exists.

        Used for validating email uniqueness without exposing
        user existence (security: prevents email enumeration).

        Args:
            email: Email address to check

        Returns:
            True if email exists, False otherwise
        """
        return User.objects.filter(email=email).exists()

    @staticmethod
    def create_user(
        email: str,
        first_name: str,
        last_name: str,
        password: str,
        phone: Optional[str] = None,
        company_name: Optional[str] = None,
        is_active: bool = False,
    ) -> User:
        """
        Create a new user with given credentials and optional fields.

        Args:
            email: User email (becomes username)
            first_name: User first name
            last_name: User last name
            password: User password (will be hashed)
            phone: Optional phone number
            company_name: Optional company name
            is_active: Whether user is active (default: False for unverified users)

        Returns:
            Created User instance
        """
        return User.objects.create_user(
            username=email,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
            phone=phone,
            company_name=company_name,
            is_active=is_active,
        )
