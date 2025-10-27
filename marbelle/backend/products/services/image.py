"""Product image service for retrieving and formatting product images."""

from typing import Optional

from ..models import Product


class ProductImageService:
    """
    Service for managing product images.

    Handles:
    - Retrieving primary or fallback product images
    - Formatting image data for API responses
    """

    @staticmethod
    def get_product_image_url(product: Product) -> Optional[str]:
        """
        Get primary or fallback product image URL.

        Returns primary image if available, otherwise returns any available image.
        Returns None if product has no images.

        Args:
            product: Product object

        Returns:
            str: Image URL or None if no images
        """
        primary_image = product.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = product.images.first()
        return primary_image.image.url if primary_image else None

    @staticmethod
    def format_image_data(product: Product) -> dict:
        """
        Format product image data for API response.

        Args:
            product: Product object

        Returns:
            dict: Formatted image data with id, url, and other metadata
        """
        image_url = ProductImageService.get_product_image_url(product)

        return {
            "url": image_url,
            "is_available": image_url is not None,
        }
