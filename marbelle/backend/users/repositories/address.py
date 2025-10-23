"""Address repository for handling Address model data access operations."""

from typing import Any, Optional

from django.db.models import QuerySet

from core.repositories import BaseRepository

from ..models import Address, User


class AddressRepository(BaseRepository):
    """Repository for Address model operations."""

    model = Address

    @staticmethod
    def get_user_addresses(user: User) -> QuerySet:
        """
        Get all addresses for a user.
        Returns addresses ordered by primary status and creation date
        for consistent ordering in API responses.

        Args:
            user: User object

        Returns:
            QuerySet of user's addresses
        """
        return Address.objects.filter(user=user).order_by("-is_primary", "created_at")

    @staticmethod
    def get_primary_address(user: User) -> Optional[Address]:
        """
        Get the primary address for a user.

        Args:
            user: User object

        Returns:
            Primary address if exists, None otherwise
        """
        return Address.objects.filter(user=user, is_primary=True).first()

    @staticmethod
    def get_user_address(address_id: int, user: User) -> Optional[Address]:
        """
        Get a specific address for a user.
        Includes security check to ensure the address belongs to the user.

        Args:
            address_id: Address ID
            user: User object (for security check)

        Returns:
            Address if found and belongs to user, None otherwise
        """
        try:
            return Address.objects.get(id=address_id, user=user)
        except Address.DoesNotExist:
            return None

    @staticmethod
    def user_has_address_label(user: User, label: str) -> bool:
        """
        Check if user already has an address with the given label.
        Used for validating label uniqueness per user (addresses
        can have the same label across different users).

        Args:
            user: User object
            label: Address label to check

        Returns:
            True if address with label exists for user, False otherwise
        """
        return Address.objects.filter(user=user, label=label).exists()

    @staticmethod
    def count_user_addresses(user: User) -> int:
        """
        Count total addresses for a user.

        Args:
            user: User object

        Returns:
            Number of addresses for user
        """
        return Address.objects.filter(user=user).count()

    @staticmethod
    def create_address(user: User, **kwargs: Any) -> Address:
        """
        Create a new address for a user.
        The Address model's save() method automatically handles
        setting the first address as primary and ensuring only
        one primary address per user.

        Args:
            user: User object
            **kwargs: Address fields (label, first_name, last_name, etc.)

        Returns:
            Created Address instance
        """
        return Address.objects.create(user=user, **kwargs)

    @staticmethod
    def update_address(address: Address, **kwargs: Any) -> Address:
        """
        Update an address's fields.

        Args:
            address: Address instance to update
            **kwargs: Fields to update

        Returns:
            Updated Address instance
        """
        for attr, value in kwargs.items():
            setattr(address, attr, value)

        address.save()

        return address

    @staticmethod
    def set_primary_address(address: Address) -> None:
        """
        Set an address as the primary address for its user.
        Automatically unsets any other primary addresses for the user.

        Args:
            address: Address to set as primary
        """
        # Unset other primary addresses for this user
        Address.objects.filter(user=address.user, is_primary=True).update(is_primary=False)
        # Set this address as primary
        address.is_primary = True
        address.save()

    @staticmethod
    def delete_address(address: Address) -> None:
        """
        Delete an address.

        Args:
            address: Address to delete
        """
        address.delete()
