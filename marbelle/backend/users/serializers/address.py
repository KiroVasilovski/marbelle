"""
Address serializer for user address management.
"""

from typing import Any, Dict

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

    def validate_label(self, value: str) -> str:
        """
        Validate address label uniqueness per user.
        """
        user = self.context["request"].user
        address_id = self.instance.id if self.instance else None

        existing = Address.objects.filter(user=user, label=value)
        if address_id:
            existing = existing.exclude(id=address_id)

        if existing.exists():
            raise serializers.ValidationError("An address with this label already exists.")
        return value

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate address count limit.
        """
        user = self.context["request"].user

        # Check address count limit for new addresses
        if not self.instance and Address.objects.filter(user=user).count() >= 10:
            raise serializers.ValidationError("Maximum 10 addresses allowed per user.")

        return attrs

    def create(self, validated_data: Dict[str, Any]) -> Address:
        """
        Create address with user assignment.
        """
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
