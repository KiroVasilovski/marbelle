from rest_framework import serializers

from .models import Category, Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    """
    Serializer for ProductImage model.
    Returns image URLs for frontend consumption.
    """

    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt_text", "is_primary", "display_order"]

    def get_image(self, obj: ProductImage) -> str:
        """Return full URL for the image."""
        if obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return ""


class ProductListSerializer(serializers.ModelSerializer):
    """
    Serializer for Product model in list views.
    Includes basic product information and images for catalog display.
    """

    images = ProductImageSerializer(many=True, read_only=True)
    in_stock = serializers.SerializerMethodField()

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

    def get_in_stock(self, obj: Product) -> bool:
        """Return stock availability as boolean."""
        return obj.stock_quantity > 0


class ProductDetailSerializer(ProductListSerializer):
    """
    Serializer for Product model in detail views.
    Inherits from ProductListSerializer - same fields for now.
    Can be extended later with additional detail-specific fields.
    """

    pass


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