"""Category service for handling category business logic."""

from typing import Optional

from django.db.models import QuerySet

from ..models import Category
from ..repositories import CategoryRepository


class CategoryService:
    """
    Service for managing category business logic.
    All category operations should go through this service.
    """

    @staticmethod
    def get_all_active_categories() -> QuerySet:
        """
        Get all active categories.

        Returns:
            QuerySet: Active categories ordered by name
        """
        return CategoryRepository.get_all_active()

    @staticmethod
    def get_all_active_categories_with_count() -> QuerySet:
        """
        Get all active categories with product count annotation.
        Optimized to avoid N+1 queries.

        Returns:
            QuerySet: Active categories with product_count field
        """
        return CategoryRepository.get_all_active_with_product_count()

    @staticmethod
    def get_category_by_id(category_id: int) -> Optional[Category]:
        """
        Get a single category by ID.

        Args:
            category_id: Category ID

        Returns:
            Category instance if found, None otherwise
        """
        return CategoryRepository.get_by_id(category_id)

    @staticmethod
    def get_category_by_id_with_count(category_id: int) -> Optional[Category]:
        """
        Get a single category by ID with product count annotation.
        Optimized to avoid N+1 queries.

        Args:
            category_id: Category ID

        Returns:
            Category instance with product_count field, or None if not found
        """
        return CategoryRepository.get_by_id_with_product_count(category_id)

    @staticmethod
    def category_exists(category_id: int) -> bool:
        """
        Check if a category exists.

        Args:
            category_id: Category ID

        Returns:
            True if category exists, False otherwise
        """
        return CategoryRepository.category_exists(category_id)
