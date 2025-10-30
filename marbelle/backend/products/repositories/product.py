"""Product repository for handling Product model data access operations."""

from typing import Optional

from django.db.models import QuerySet

from core.repositories import BaseRepository

from ..models import Product


class ProductRepository(BaseRepository):
    """
    Repository for Product model operations.
    """

    model = Product

    @staticmethod
    def get_all_active() -> QuerySet:
        """
        Get all active products with prefetched images and category.

        Returns:
            QuerySet of active products with related data prefetched
        """
        return (
            Product.objects.filter(is_active=True)
            .select_related("category")
            .prefetch_related("images")
            .order_by("name")
        )

    @staticmethod
    def get_by_id(product_id: int) -> Optional[Product]:
        """
        Retrieve a product by ID with prefetched related data.

        Args:
            product_id: Product ID

        Returns:
            Product instance if found, None otherwise
        """
        try:
            return Product.objects.select_related("category").prefetch_related("images").get(id=product_id)
        except Product.DoesNotExist:
            return None

    @staticmethod
    def get_by_sku(sku: str) -> Optional[Product]:
        """
        Retrieve a product by SKU with prefetched related data.

        Args:
            sku: Product SKU

        Returns:
            Product instance if found, None otherwise
        """
        try:
            return Product.objects.select_related("category").prefetch_related("images").get(sku=sku)
        except Product.DoesNotExist:
            return None

    @staticmethod
    def get_active_in_category(category_id: int) -> QuerySet:
        """
        Get all active products in a specific category.

        Args:
            category_id: Category ID

        Returns:
            QuerySet of active products in category
        """
        return (
            Product.objects.filter(is_active=True, category_id=category_id)
            .select_related("category")
            .prefetch_related("images")
            .order_by("name")
        )

    @staticmethod
    def product_exists(product_id: int) -> bool:
        """
        Check if a product exists (active or inactive).

        Args:
            product_id: Product ID

        Returns:
            True if product exists, False otherwise
        """
        return Product.objects.filter(id=product_id).exists()

    @staticmethod
    def active_product_exists(product_id: int) -> bool:
        """
        Check if an active product exists.

        Args:
            product_id: Product ID

        Returns:
            True if active product exists, False otherwise
        """
        return Product.objects.filter(id=product_id, is_active=True).exists()
