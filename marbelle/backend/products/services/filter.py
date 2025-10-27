"""Product filter service for search, filtering, and pagination operations."""

from typing import Optional

from django.db.models import QuerySet

from ..models import Category, Product
from ..views.filters import ProductFilter


class ProductFilterService:
    """
    Service for managing product search, filtering, and pagination.

    Handles:
    - Applying filters to product queries
    - Searching across multiple fields
    - Sorting results
    - Category product filtering
    """

    @staticmethod
    def get_all_active_products() -> QuerySet:
        """
        Get all active products with optimizations.

        Returns:
            QuerySet: Products with prefetched related data
        """
        return Product.objects.filter(is_active=True).prefetch_related("images", "category").order_by("-created_at")

    @staticmethod
    def get_category_products(category: Category) -> QuerySet:
        """
        Get all active products in a category.

        Args:
            category: Category object

        Returns:
            QuerySet: Products in category with prefetched data
        """
        return category.products.filter(is_active=True).prefetch_related("images").order_by("-created_at")

    @staticmethod
    def apply_filters(queryset: QuerySet, filters: dict) -> QuerySet:
        """
        Apply ProductFilter to queryset.

        Supports filtering by:
        - category: Category ID
        - min_price: Minimum price
        - max_price: Maximum price
        - in_stock: Boolean for stock availability
        - search: Search query
        - ordering: Sort field

        Args:
            queryset: QuerySet to filter
            filters: Filter parameters dictionary

        Returns:
            QuerySet: Filtered queryset
        """
        filter_backend = ProductFilter()
        return filter_backend.filter_queryset(queryset, filters)

    @staticmethod
    def search_products(queryset: QuerySet, search_query: str) -> QuerySet:
        """
        Search products across multiple fields.

        Searches by:
        - name (case-insensitive partial match)
        - description (case-insensitive partial match)
        - SKU (case-insensitive partial match)

        Args:
            queryset: QuerySet to search
            search_query: Search term

        Returns:
            QuerySet: Filtered queryset matching search
        """
        from django.db.models import Q

        if not search_query:
            return queryset

        search_query = search_query.strip()
        return queryset.filter(
            Q(name__icontains=search_query) | Q(description__icontains=search_query) | Q(sku__icontains=search_query)
        )

    @staticmethod
    def order_products(queryset: QuerySet, ordering: Optional[str] = None) -> QuerySet:
        """
        Sort products by specified field.

        Valid fields:
        - name: Product name
        - price: Product price
        - created_at: Creation date
        - stock_quantity: Stock quantity
        Prefix with '-' for descending order (e.g., '-price')

        Args:
            queryset: QuerySet to order
            ordering: Ordering field

        Returns:
            QuerySet: Ordered queryset
        """
        if not ordering:
            return queryset

        # Whitelist valid ordering fields
        valid_fields = ["name", "price", "created_at", "stock_quantity"]

        # Handle descending order
        if ordering.startswith("-"):
            field = ordering[1:]
        else:
            field = ordering

        # Only apply if field is valid
        if field in valid_fields:
            return queryset.order_by(ordering)

        return queryset
