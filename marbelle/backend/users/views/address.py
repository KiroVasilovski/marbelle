"""Address API ViewSet for user address management."""

from typing import Any

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from core import ResponseHandler

from ..serializers import AddressSerializer
from ..services import AddressService


class AddressViewSet(ModelViewSet):
    """
    ViewSet for address management.
    Provides CRUD operations for user addresses.
    """

    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["patch"])
    def set_primary(self, request: Request, pk: int | None = None) -> Response:
        """
        Set address as primary address for user.
        """
        try:
            address = AddressService.get_user_address(pk, request.user)
            AddressService.set_primary_address(address)

            return ResponseHandler.success(
                data=self.get_serializer(address).data,
                message="Primary address updated successfully.",
            )
        except ValueError as e:
            return ResponseHandler.error(message=str(e))

    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        List all addresses for the authenticated user.
        """
        try:
            addresses = AddressService.get_user_addresses(request.user)
            serializer = self.get_serializer(addresses, many=True)

            return ResponseHandler.success(
                data=serializer.data,
                message="Addresses retrieved successfully.",
            )
        except Exception as e:
            return ResponseHandler.error(message=str(e))

    def retrieve(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        Retrieve a specific address by ID.
        """
        try:
            address = AddressService.get_user_address(kwargs.get("pk"), request.user)
            serializer = self.get_serializer(address)

            return ResponseHandler.success(
                data=serializer.data,
                message="Address retrieved successfully.",
            )
        except ValueError as e:
            return ResponseHandler.error(message=str(e))

    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        Create a new address for authenticated user.
        """
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            return ResponseHandler.error(
                message="Address creation failed.",
                errors=serializer.errors,
            )

        try:
            address = AddressService.create_address(request.user, serializer.validated_data)

            return ResponseHandler.success(
                data=self.get_serializer(address).data,
                message="Address created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except ValueError as e:
            return ResponseHandler.error(message=str(e))

    def update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        Update address fields.
        """
        partial = kwargs.pop("partial", False)

        try:
            instance = AddressService.get_user_address(kwargs.get("pk"), request.user)
        except ValueError as e:
            return ResponseHandler.error(message=str(e))

        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if not serializer.is_valid():
            return ResponseHandler.error(
                message="Address update failed.",
                errors=serializer.errors,
            )

        try:
            address = AddressService.update_address(instance, serializer.validated_data)

            return ResponseHandler.success(
                data=self.get_serializer(address).data,
                message="Address updated successfully.",
            )
        except ValueError as e:
            return ResponseHandler.error(message=str(e))

    def destroy(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        Delete an address.
        """
        try:
            address = AddressService.get_user_address(kwargs.get("pk"), request.user)
            AddressService.delete_address(address)

            return ResponseHandler.success(message="Address deleted successfully.")
        except ValueError as e:
            return ResponseHandler.error(message=str(e))
