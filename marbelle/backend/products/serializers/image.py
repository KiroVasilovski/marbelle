"""Product image serializer for returning image URLs and metadata."""

from rest_framework import serializers

from ..models import ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    """
    Serializer for ProductImage model.
    """

    image = serializers.ImageField(use_url=True, read_only=True)

    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt_text", "is_primary", "display_order"]
