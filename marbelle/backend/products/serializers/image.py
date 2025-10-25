"""
Product image serializer for returning image URLs and metadata.
"""

from rest_framework import serializers

from ..models import ProductImage


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
