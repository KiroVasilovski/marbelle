"""Central response handler for creating DRF Response objects with standardized formats."""

from typing import Any, Dict, Optional

from rest_framework import status
from rest_framework.response import Response

from .builder import build_error_payload, build_success_payload
from .validators import validate_json_serializable


class ResponseHandler:
    """
    Central response handler that wraps payload dictionaries in Response objects.

    This is the single source of truth for all Response object creation.

    Public methods:
    - success(): Returns success response with data
    - error(): Returns error response with validation details
    - paginated(): Returns paginated response with pagination metadata

    All methods validate data is JSON-serializable and provide type safety.
    """

    @staticmethod
    def success(
        data: Any = None,
        message: str = "Success",
        status_code: int = status.HTTP_200_OK,
    ) -> Response:
        """
        Build and return a success response.

        Args:
            data: Response data (can be None, dict, list, or any serializable object)
            message: Human-readable success message
            status_code: HTTP status code (default: 200 OK)

        Returns:
            DRF Response object with success payload and status code

        Raises:
            TypeError: If data is not JSON serializable
        """
        if data is not None:
            validate_json_serializable(data)

        payload = build_success_payload(data=data, message=message)
        return Response(payload, status=status_code)

    @staticmethod
    def error(
        message: str = "Error",
        errors: Optional[Dict[str, Any]] = None,
        status_code: int = status.HTTP_400_BAD_REQUEST,
    ) -> Response:
        """
        Build and return an error response.

        Args:
            message: Human-readable error message
            errors: Optional error details (validation errors, field errors, etc.)
            status_code: HTTP status code (default: 400 Bad Request)

        Returns:
            DRF Response object with error payload and status code

        Raises:
            TypeError: If errors is not JSON serializable
        """
        if errors is not None:
            validate_json_serializable(errors)

        payload = build_error_payload(message=message, errors=errors)
        return Response(payload, status=status_code)

    @staticmethod
    def paginated(
        data: list,
        count: int,
        next_url: Optional[str] = None,
        previous_url: Optional[str] = None,
        message: str = "Results retrieved successfully.",
        status_code: int = status.HTTP_200_OK,
    ) -> Response:
        """
        Build and return a paginated response.

        Args:
            data: List of serialized results for current page
            count: Total number of results across all pages
            next_url: URL to next page (or None if last page)
            previous_url: URL to previous page (or None if first page)
            message: Human-readable message
            status_code: HTTP status code (default: 200 OK)

        Returns:
            DRF Response object with paginated payload and status code

        Raises:
            TypeError: If data is not JSON serializable or not a list
            ValueError: If count is not a non-negative integer
        """
        if not isinstance(data, list):
            raise TypeError(f"Paginated data must be a list, got {type(data)}")
        if not isinstance(count, int) or count < 0:
            raise ValueError(f"Count must be a non-negative integer, got {count}")

        validate_json_serializable(data)

        payload = {
            "success": True,
            "message": message,
            "data": data,
            "pagination": {
                "count": count,
                "next": next_url,
                "previous": previous_url,
            },
        }
        return Response(payload, status=status_code)
