"""Product service for handling product business logic."""

from typing import Optional

from django.db.models import QuerySet

from ..models import Product
from ..repositories import ProductRepository


class ProductService:
    """
    Service for managing product business logic.
    All product operations should go through this service.
    """

    @staticmethod
    def get_all_active_products() -> QuerySet:
        """
        Get all active products with optimized queries.

        Returns:
            QuerySet: Active products with prefetched images and category
        """
        return ProductRepository.get_all_active()

    @staticmethod
    def get_product_by_id(product_id: int) -> Optional[Product]:
        """
        Get a single product by ID.

        Args:
            product_id: Product ID

        Returns:
            Product instance if found, None otherwise
        """
        return ProductRepository.get_by_id(product_id)

    @staticmethod
    def get_product_by_sku(sku: str) -> Optional[Product]:
        """
        Get a single product by SKU.

        Args:
            sku: Product SKU

        Returns:
            Product instance if found, None otherwise
        """
        return ProductRepository.get_by_sku(sku)

    @staticmethod
    def get_category_products(category_id: int) -> QuerySet:
        """
        Get all active products in a specific category.

        Args:
            category_id: Category ID

        Returns:
            QuerySet: Products in category with prefetched data
        """
        return ProductRepository.get_active_in_category(category_id)

    @staticmethod
    def product_exists(product_id: int) -> bool:
        """
        Check if a product exists.

        Args:
            product_id: Product ID

        Returns:
            True if product exists, False otherwise
        """
        return ProductRepository.product_exists(product_id)

    @staticmethod
    def active_product_exists(product_id: int) -> bool:
        """
        Check if an active product exists.

        Args:
            product_id: Product ID

        Returns:
            True if active product exists, False otherwise
        """
        return ProductRepository.active_product_exists(product_id)

    @staticmethod
    def get_product_primary_image_url(product: Product) -> Optional[str]:
        """
        Get primary or fallback product image URL.
        Returns primary image if available, otherwise returns first available image.

        Args:
            product: Product instance

        Returns:
            Image URL or None if no images exist
        """
        primary_image = product.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = product.images.first()
        return primary_image.image.url if primary_image else None
