"""
Product ViewSet for catalog API endpoints.
"""

from typing import Any

from django.db.models import QuerySet
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response

from core import Paginator, ResponseHandler

from ..models import Product
from ..serializers import ProductDetailSerializer, ProductListSerializer
from ..services import ProductService
from .filters import ProductFilter


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Product model.
    Provides list and detail endpoints with filtering and search capabilities.
    """

    permission_classes = [AllowAny]
    pagination_class = Paginator
    filterset_class = ProductFilter
    search_fields = ["name", "description", "sku"]
    ordering_fields = ["name", "price", "created_at", "stock_quantity"]
    ordering = ["name"]

    def get_queryset(self) -> QuerySet[Product]:
        """
        Return only active products with prefetched images via ProductService.
        """
        return ProductService.get_all_active_products()

    def get_serializer_class(self):
        """
        Return appropriate serializer based on action.
        """
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer

    def retrieve(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        Retrieve a single product with standardized response format.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)

        return ResponseHandler.success(
            data=serializer.data,
            message="Product retrieved successfully.",
        )
