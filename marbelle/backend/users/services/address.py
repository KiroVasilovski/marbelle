"""Address service for managing user addresses."""

from typing import Optional

from django.db import transaction

from ..constants import UserLimits
from ..models import Address, User
from ..repositories import AddressRepository


class AddressService:
    """
    Service for managing user addresses.

    Handles:
    - Creating addresses with auto-primary logic
    - Updating addresses
    - Deleting with constraints
    - Setting primary address
    - Validation of address limits and constraints
    """

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
    def create_address(user: User, address_data: dict) -> Address:
        """
        Create new address for user.

        First address is automatically set as primary.
        Enforces maximum addresses per user limit.

        Args:
            user: User object
            address_data: Dictionary with address fields

        Returns:
            Address: Created address object

        Raises:
            ValueError: If user has reached max address limit
        """
        # Check address limit via repository
        if AddressRepository.count_user_addresses(user) >= UserLimits.MAX_ADDRESSES_PER_USER:
            raise ValueError(f"Maximum {UserLimits.MAX_ADDRESSES_PER_USER} addresses allowed per user.")

        # Create address via repository (save() will handle auto-primary)
        address = AddressRepository.create_address(user, **address_data)

        return address

    @staticmethod
    def update_address(address: Address, address_data: dict) -> Address:
        """
        Update address fields.

        Args:
            address: Address object to update
            address_data: Dictionary of fields to update

        Returns:
            Address: Updated address object
        """
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
        # Check if this is user's only address via repository
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
