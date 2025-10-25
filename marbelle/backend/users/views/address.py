"""
Address API ViewSet for user address management.
"""

from typing import Any

from django.db import transaction
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from core import ResponseHandler

from ..models import Address
from ..serializers import AddressSerializer


class AddressViewSet(ModelViewSet):
    """
    ViewSet for address management.
    Provides CRUD operations for user addresses.
    """

    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Return addresses for current user only.
        """
        return Address.objects.filter(user=self.request.user).order_by("-is_primary", "created_at")

    def perform_destroy(self, instance: Address) -> None:
        """
        Custom deletion logic - prevent deletion if it's the only address or used in recent orders.
        """
        user = self.request.user
        address_count = Address.objects.filter(user=user).count()

        if address_count == 1:
            raise ValidationError("Cannot delete the only address. Please add another address first.")

        # TODO: Add check for recent orders using this address when orders app is available
        # For now, just delete the address
        super().perform_destroy(instance)

    @action(detail=True, methods=["patch"])
    def set_primary(self, request: Request, pk: int | None = None) -> Response:
        """
        Set address as primary.
        """
        with transaction.atomic():
            address = self.get_object()

            # Lock rows for update
            Address.objects.filter(user=request.user, is_primary=True).select_for_update().update(is_primary=False)

            address.is_primary = True
            address.save()

        serializer = self.get_serializer(address)
        return ResponseHandler.success(
            data=serializer.data,
            message="Primary address updated successfully.",
        )

    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        List all addresses for the authenticated user.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return ResponseHandler.success(
            data=serializer.data,
            message="Addresses retrieved successfully.",
        )

    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        Custom create response format.
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return ResponseHandler.success(
                data=serializer.data,
                message="Address created successfully.",
                status_code=status.HTTP_201_CREATED,
            )

        return ResponseHandler.error(
            message="Address creation failed.",
            errors=serializer.errors,
        )

    def update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        Custom update response format.
        """
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if serializer.is_valid():
            serializer.save()
            return ResponseHandler.success(
                data=serializer.data,
                message="Address updated successfully.",
            )

        return ResponseHandler.error(
            message="Address update failed.",
            errors=serializer.errors,
        )

    def destroy(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        Custom delete response format.
        """
        try:
            self.perform_destroy(self.get_object())
            return ResponseHandler.success(message="Address deleted successfully.")
        except Exception as e:
            return ResponseHandler.error(message=str(e))
