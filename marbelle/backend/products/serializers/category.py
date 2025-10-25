"""
Category serializers for listing and detail views.
"""

from rest_framework import serializers

from ..models import Category


class CategoryListSerializer(serializers.ModelSerializer):
    """
    Serializer for Category model in list views.
    Includes product count for active products.
    """

    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "description", "product_count", "created_at"]

    def get_product_count(self, obj: Category) -> int:
        """Return count of active products in this category."""
        return obj.products.filter(is_active=True).count()


class CategoryDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for Category model in detail views.
    """

    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "description", "product_count", "created_at", "updated_at"]

    def get_product_count(self, obj: Category) -> int:
        """Return count of active products in this category."""
        return obj.products.filter(is_active=True).count()
