"""Product repository for handling Product model data access operations."""

from typing import Optional

from django.db import models
from django.db.models import QuerySet

from core.repositories import BaseRepository

from ..models import Category, Product


class ProductRepository(BaseRepository):
    """
    Repository for Product model operations.

    Centralizes all product database queries with optimized prefetching
    to prevent N+1 query problems and ensure consistent performance.
    """

    model = Product

    @staticmethod
    def get_all_active() -> QuerySet:
        """
        Get all active products with prefetched images and category.

        Returns products optimized with:
        - prefetch_related for images (many-to-one)
        - select_related for category (one-to-one)

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

        Returns products with prefetched images and optimized queries.

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
    def filter_products(
        search_query: Optional[str] = None,
        category_id: Optional[int] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        in_stock: Optional[bool] = None,
    ) -> QuerySet:
        """
        Filter products by multiple criteria with optimized queries.

        Returns filtered products with prefetched images and category.

        Args:
            search_query: Search in name, description, SKU (case-insensitive)
            category_id: Filter by category ID
            min_price: Minimum price filter
            max_price: Maximum price filter
            in_stock: Filter by stock availability (None = all)

        Returns:
            QuerySet of filtered products
        """
        from django.db.models import Q

        queryset = Product.objects.filter(is_active=True)

        # Search across name, description, and SKU
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query)
                | Q(description__icontains=search_query)
                | Q(sku__icontains=search_query)
            )

        # Category filter
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        # Price range filters
        if min_price is not None:
            queryset = queryset.filter(price__gte=min_price)
        if max_price is not None:
            queryset = queryset.filter(price__lte=max_price)

        # Stock availability filter
        if in_stock is True:
            queryset = queryset.filter(stock_quantity__gt=0)
        elif in_stock is False:
            queryset = queryset.filter(stock_quantity__lte=0)

        # Optimize with prefetch_related and select_related
        return queryset.select_related("category").prefetch_related("images").order_by("name")

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

    @staticmethod
    def get_category(category_id: int) -> Optional[Category]:
        """
        Retrieve a category by ID.

        Args:
            category_id: Category ID

        Returns:
            Category instance if found, None otherwise
        """
        try:
            return Category.objects.get(id=category_id, is_active=True)
        except Category.DoesNotExist:
            return None

    @staticmethod
    def get_all_active_categories() -> QuerySet:
        """
        Get all active categories.

        Returns:
            QuerySet of active categories ordered by name
        """
        return Category.objects.filter(is_active=True).order_by("name")

    @staticmethod
    def get_category_with_product_count(category_id: int) -> Optional[Category]:
        """
        Retrieve a category with product count annotation.

        Args:
            category_id: Category ID

        Returns:
            Category instance with product_count field, or None if not found
        """
        from django.db.models import Count

        try:
            return (
                Category.objects.annotate(product_count=Count("products", filter=models.Q(products__is_active=True)))
                .filter(id=category_id, is_active=True)
                .first()
            )
        except Exception:
            return None
