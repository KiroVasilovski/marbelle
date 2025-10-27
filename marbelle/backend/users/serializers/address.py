"""
Address serializer for user address management.
Delegates business logic to AddressService.
"""

from typing import Any, Dict

from rest_framework import serializers

from ..models import Address
from ..services import AddressService


class AddressSerializer(serializers.ModelSerializer):
    """
    Serializer for address management.
    Validates address data, delegates creation/update to AddressService.
    """

    class Meta:
        model = Address
        fields = [
            "id",
            "label",
            "first_name",
            "last_name",
            "company",
            "address_line_1",
            "address_line_2",
            "city",
            "state",
            "postal_code",
            "country",
            "phone",
            "is_primary",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_label(self, value: str) -> str:
        """
        Validate address label uniqueness per user.
        """
        user = self.context["request"].user
        address = self.instance if self.instance else None

        # Use AddressService to validate label uniqueness
        if not AddressService.validate_label_uniqueness(user, value, exclude_address=address):
            raise serializers.ValidationError("An address with this label already exists.")
        return value

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate address count limit (via AddressService).
        """
        # AddressService validation happens in create/update methods
        # This ensures validation is consistent across all usage paths
        return attrs

    def create(self, validated_data: Dict[str, Any]) -> Address:
        """
        Create address via AddressService.
        Service handles:
        - User assignment
        - Address count validation
        - Auto-primary assignment for first address
        """
        user = self.context["request"].user
        return AddressService.create_address(user, validated_data)

    def update(self, instance: Address, validated_data: Dict[str, Any]) -> Address:
        """
        Update address via AddressService.
        Service handles:
        - Data persistence
        - Validation
        """
        return AddressService.update_address(instance, validated_data)
