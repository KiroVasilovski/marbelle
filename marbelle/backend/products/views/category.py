"""
Category ViewSet for catalog API endpoints.
"""

from typing import Any

from django.db.models import QuerySet
from django.http import HttpRequest
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response

from core import Paginator, ResponseHandler

from ..models import Category, Product
from ..serializers import CategoryDetailSerializer, CategoryListSerializer, ProductListSerializer
from .filters import ProductFilter


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Category model.
    Provides list and detail endpoints with product counts.
    Public access - no authentication required.
    """

    permission_classes = [AllowAny]
    pagination_class = Paginator
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    def get_queryset(self) -> QuerySet[Category]:
        """Return only active categories."""
        return Category.objects.filter(is_active=True)

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == "retrieve":
            return CategoryDetailSerializer
        return CategoryListSerializer

    def retrieve(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        Retrieve a single category with standardized response format.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return ResponseHandler.success(
            data=serializer.data,
            message="Category retrieved successfully.",
        )

    @action(detail=True, methods=["get"])
    def products(self, request: HttpRequest, pk: int | None = None) -> Response:
        """
        Custom action to get products for a specific category.
        URL: /api/v1/categories/{id}/products/
        """
        category = self.get_object()
        products = Product.objects.filter(category=category, is_active=True).prefetch_related("images")

        # Apply filtering and search to products
        filterset = ProductFilter(request.GET, queryset=products)
        if filterset.is_valid():
            products = filterset.qs

        # Apply search
        search_query = request.query_params.get("search")
        if search_query:
            products = (
                products.filter(name__icontains=search_query).distinct()
                | products.filter(description__icontains=search_query).distinct()
                | products.filter(sku__icontains=search_query).distinct()
            )

        # Apply pagination
        page = self.paginate_queryset(products)
        if page is not None:
            serializer = ProductListSerializer(page, many=True, context={"request": request})
            paginator = self.paginator
            return ResponseHandler.paginated(
                data=serializer.data,
                count=paginator.page.paginator.count,
                next_url=paginator.get_next_link(),
                previous_url=paginator.get_previous_link(),
                message="Products retrieved successfully.",
            )

        serializer = ProductListSerializer(products, many=True, context={"request": request})
        return ResponseHandler.success(
            data=serializer.data,
            message="Products retrieved successfully.",
        )
