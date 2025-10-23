"""Category ViewSet for catalog API endpoints."""

from typing import Any

from django.db.models import QuerySet
from django.http import HttpRequest
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response

from core import Paginator, ResponseHandler

from ..models import Category
from ..serializers import CategoryDetailSerializer, CategoryListSerializer, ProductListSerializer
from ..services import CategoryService, ProductService
from .filters import ProductFilter


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Category model.
    Provides list and detail endpoints with product counts.
    """

    permission_classes = [AllowAny]
    pagination_class = Paginator
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    def get_queryset(self) -> QuerySet[Category]:
        """
        Return only active categories with product count annotation.
        """
        return CategoryService.get_all_active_categories_with_count()

    def get_serializer_class(self):
        """
        Return appropriate serializer based on action.
        """
        if self.action == "retrieve":
            return CategoryDetailSerializer
        return CategoryListSerializer

    def retrieve(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        Retrieve a single category.
        """
        category_id = self.kwargs.get("pk")
        instance = CategoryService.get_category_by_id_with_count(category_id)

        if not instance:
            return ResponseHandler.error(
                message="Category not found.",
                status_code=404,
            )

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
        Supports filtering, search, and pagination via query parameters.
        """
        category = self.get_object()

        products = ProductService.get_category_products(category.id)

        filterset = ProductFilter(request.GET, queryset=products)
        if filterset.is_valid():
            products = filterset.qs

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
