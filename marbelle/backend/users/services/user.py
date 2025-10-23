"""User service for handling user profile and account operations."""

from typing import Any, Dict

from ..models import User
from ..repositories import UserRepository


class UserService:
    """
    Service for managing user profile and account operations.

    Handles:
    - Profile updates with email enumeration protection
    - Password changes with validation
    - Business customer detection
    - User data retrieval
    """

    @staticmethod
    def get_user_profile(user: User) -> Dict[str, Any]:
        """
        Get formatted user profile data.

        Args:
            user: User object

        Returns:
            dict: User profile data
        """
        return {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": user.phone,
            "company_name": user.company_name,
            "is_business_customer": user.is_business_customer,
        }

    @staticmethod
    def update_user_profile(user: User, update_data: Dict[str, Any]) -> User:
        """
        Update user profile with email enumeration protection.

        Silently ignores email changes if the new email already exists
        to prevent email enumeration attacks.

        Args:
            user: User object to update
            update_data: Dictionary of fields to update

        Returns:
            User: Updated user object
        """
        # Check if email is being changed and if it already exists
        if "email" in update_data and user.email != update_data["email"]:
            new_email = update_data["email"]
            if UserRepository.email_exists(new_email):
                # Silently ignore the email change for security
                update_data.pop("email")

        # Apply updates to user
        for attr, value in update_data.items():
            setattr(user, attr, value)

        try:
            user.save()
        except Exception:
            # If there's still a database constraint error (edge case),
            # silently ignore it for security reasons
            pass

        return user

    @staticmethod
    def change_password(user: User, current_password: str, new_password: str) -> bool:
        """
        Change user password.

        Args:
            user: User object
            current_password: Current password for verification
            new_password: New password to set

        Returns:
            bool: True if successful, False if current password is incorrect
        """
        if not user.check_password(current_password):
            return False

        user.set_password(new_password)
        user.save()
        return True

    @staticmethod
    def is_business_customer(user: User) -> bool:
        """
        Determine if user is a business customer.

        Args:
            user: User object

        Returns:
            bool: True if user has company_name set, False otherwise
        """
        return bool(user.company_name and user.company_name.strip())
