"""Category serializers for listing and detail views."""

from rest_framework import serializers

from ..models import Category


class CategoryListSerializer(serializers.ModelSerializer):
    """
    Serializer for Category model in list views.
    Includes product count for active products.
    """

    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "description", "product_count", "created_at"]


class CategoryDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for Category model in detail views.
    """

    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "description", "product_count", "created_at", "updated_at"]
