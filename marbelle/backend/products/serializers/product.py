"""Product serializers for listing and detail views."""

from rest_framework import serializers

from ..models import Product
from .image import ProductImageSerializer


class ProductListSerializer(serializers.ModelSerializer):
    """
    Serializer for Product model in list views.
    Includes basic product information and images for catalog display.
    """

    images = ProductImageSerializer(many=True, read_only=True)
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "unit_of_measure",
            "category",
            "stock_quantity",
            "in_stock",
            "sku",
            "images",
            "created_at",
            "updated_at",
        ]


class ProductDetailSerializer(ProductListSerializer):
    """
    Serializer for Product model in detail views.
    Inherits from ProductListSerializer - same fields for now.
    Can be extended later with additional detail-specific fields.
    """

    pass
