"""Category repository for handling Category model data access operations."""

from typing import Optional

from django.db import models
from django.db.models import Count, QuerySet

from core.repositories import BaseRepository

from ..models import Category


class CategoryRepository(BaseRepository):
    """
    Repository for Category model operations.
    """

    model = Category

    @staticmethod
    def get_all_active() -> QuerySet:
        """
        Get all active categories ordered by name.

        Returns:
            QuerySet of active categories
        """
        return Category.objects.filter(is_active=True).order_by("name")

    @staticmethod
    def get_all_active_with_product_count() -> QuerySet:
        """
        Get all active categories with product count annotation.
        Optimized to avoid N+1 queries.

        Returns:
            QuerySet of active categories with product_count field
        """
        return (
            Category.objects.filter(is_active=True)
            .annotate(product_count=Count("products", filter=models.Q(products__is_active=True)))
            .order_by("name")
        )

    @staticmethod
    def get_by_id(category_id: int) -> Optional[Category]:
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
    def get_by_id_with_product_count(category_id: int) -> Optional[Category]:
        """
        Retrieve a category with product count annotation.
        Optimized to avoid N+1 queries.

        Args:
            category_id: Category ID

        Returns:
            Category instance with product_count field, or None if not found
        """
        return (
            Category.objects.filter(id=category_id, is_active=True)
            .annotate(product_count=Count("products", filter=models.Q(products__is_active=True)))
            .first()
        )

    @staticmethod
    def category_exists(category_id: int) -> bool:
        """
        Check if an active category exists.

        Args:
            category_id: Category ID

        Returns:
            True if category exists, False otherwise
        """
        return Category.objects.filter(id=category_id, is_active=True).exists()
