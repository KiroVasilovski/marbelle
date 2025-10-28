"""Address serializer for user address management."""

from rest_framework import serializers

from ..models import Address


class AddressSerializer(serializers.ModelSerializer):
    """
    Serializer for address management.
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
