"""Address service for managing user addresses."""

from typing import Optional

from django.db import transaction

from ..constants import UserLimits
from ..models import Address, User
from ..repositories import AddressRepository


class AddressService:
    """Service for managing user addresses."""

    @staticmethod
    def get_user_addresses(user: User) -> list[Address]:
        """
        Get all addresses for a user.

        Args:
            user: User object

        Returns:
            list: Address objects for user
        """
        return list(AddressRepository.get_user_addresses(user))

    @staticmethod
    def get_user_address(address_id: int, user: User) -> Address:
        """
        Get a specific address for a user with security check.

        Args:
            address_id: Address ID
            user: User object

        Returns:
            Address: The address object

        Raises:
            ValueError: If address not found or doesn't belong to user
        """
        address = AddressRepository.get_user_address(address_id, user)
        if not address:
            raise ValueError("Address not found.")
        return address

    @staticmethod
    def create_address(user: User, address_data: dict) -> Address:
        """
        Create new address for user.
        First address is automatically set as primary.
        Enforces maximum addresses per user limit and label uniqueness.

        Args:
            user: User object
            address_data: Dictionary with address fields

        Returns:
            Address: Created address object

        Raises:
            ValueError: If user has reached max address limit or label already exists
        """
        # Check address limit
        if AddressRepository.count_user_addresses(user) >= UserLimits.MAX_ADDRESSES_PER_USER:
            raise ValueError(f"Maximum {UserLimits.MAX_ADDRESSES_PER_USER} addresses allowed per user.")

        label = address_data.get("label")

        # Check label uniqueness
        if label and not AddressService.validate_label_uniqueness(user, label):
            raise ValueError("An address with this label already exists.")

        return AddressRepository.create_address(user, **address_data)

    @staticmethod
    def update_address(address: Address, address_data: dict) -> Address:
        """
        Update address fields.
        Enforces label uniqueness per user.

        Args:
            address: Address object to update
            address_data: Dictionary of fields to update

        Returns:
            Address: Updated address object

        Raises:
            ValueError: If new label already exists for this user
        """
        label = address_data.get("label")

        # Check label uniqueness
        if label and label != address.label:
            if not AddressService.validate_label_uniqueness(address.user, label, exclude_address=address):
                raise ValueError("An address with this label already exists.")

        return AddressRepository.update_address(address, **address_data)

    @staticmethod
    def delete_address(address: Address) -> None:
        """
        Delete address with constraint checking.
        Prevents deletion of last remaining address.

        Args:
            address: Address to delete

        Raises:
            ValueError: If trying to delete only address
        """
        if AddressRepository.count_user_addresses(address.user) <= 1:
            raise ValueError("Cannot delete the only address. Users must have at least one address.")

        AddressRepository.delete_address(address)

    @staticmethod
    def set_primary_address(address: Address) -> Address:
        """
        Set address as primary for user.
        Ensures only one primary address per user.

        Args:
            address: Address to set as primary

        Returns:
            Address: Updated address object
        """
        with transaction.atomic():
            AddressRepository.set_primary_address(address)

        return address

    @staticmethod
    def validate_label_uniqueness(user: User, label: str, exclude_address: Optional[Address] = None) -> bool:
        """
        Validate address label is unique for user.

        Args:
            user: User object
            label: Label to check
            exclude_address: Address to exclude from check (for updates)

        Returns:
            bool: True if unique, False if duplicate
        """
        if exclude_address:
            # For updates, check if any other address has this label
            query = AddressRepository.get_user_addresses(user).filter(label=label).exclude(id=exclude_address.id)
            return not query.exists()
        # For new addresses, use repository's label check
        return not AddressRepository.user_has_address_label(user, label)
