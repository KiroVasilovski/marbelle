"""
Filters for product catalog APIs.
"""

from django.db.models import QuerySet
from django_filters import rest_framework as filters

from ..models import Product


class ProductFilter(filters.FilterSet):
    """
    Filter class for Product model.
    Supports filtering by category, price range, and stock availability.
    """

    category = filters.NumberFilter(field_name="category__id")
    min_price = filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = filters.NumberFilter(field_name="price", lookup_expr="lte")
    in_stock = filters.BooleanFilter(method="filter_in_stock")

    class Meta:
        model = Product
        fields = ["category", "min_price", "max_price", "in_stock"]

    def filter_in_stock(self, queryset: QuerySet[Product], name: str, value: bool) -> QuerySet[Product]:
        """
        Filter products based on stock availability.
        """
        if value is True:
            return queryset.filter(stock_quantity__gt=0)
        elif value is False:
            return queryset.filter(stock_quantity=0)
        return queryset
