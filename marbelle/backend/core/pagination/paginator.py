"""
Standardized pagination class for consistent paginated responses.

Integrates with DRF's pagination system to automatically format responses
using the centralized ResponseHandler.
"""

from typing import Any

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from ..responses import ResponseHandler


class Paginator(PageNumberPagination):
    """
    Custom pagination class that formats all paginated responses using ResponseHandler.

    This ensures consistent pagination structure across all endpoints:
    - data: List of results for current page
    - pagination.count: Total number of results
    - pagination.next: URL to next page (or null)
    - pagination.previous: URL to previous page (or null)

    Configuration:
    - page_size: Default items per page (20)
    - page_size_query_param: Query parameter for custom page size ("page_size")
    - max_page_size: Maximum items per page (100)

    Can be subclassed to customize pagination per endpoint.
    """

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_paginated_response(self, data: Any) -> Response:
        """
        Format paginated response using ResponseHandler.

        This method is called automatically by DRF when paginating results.

        Args:
            data: Serialized data for current page

        Returns:
            Response object with standardized pagination format

        Raises:
            AttributeError: If pagination metadata is not available
            TypeError: If data is not JSON serializable
        """
        try:
            count = self.page.paginator.count
            next_url = self.get_next_link()
            previous_url = self.get_previous_link()
        except AttributeError as e:
            raise AttributeError(
                f"Pagination metadata not available. Ensure paginate_queryset() was called first. Error: {e}"
            )

        return ResponseHandler.paginated(
            data=data,
            count=count,
            next_url=next_url,
            previous_url=previous_url,
            message=self.get_pagination_message(),
        )

    def get_pagination_message(self) -> str:
        """
        Get the pagination response message.

        Can be overridden in subclasses for custom messages.

        Returns:
            Message string for paginated response
        """
        return "Results retrieved successfully."


class CustomPageSizePaginator(Paginator):
    """
    Paginator that allows custom page size via query parameter.

    Inherits from Paginator with same settings but explicitly
    allows overriding page_size_query_param per subclass.

    Usage:
        class ProductPaginator(CustomPageSizePaginator):
            page_size = 50
            max_page_size = 200
    """

    pass
