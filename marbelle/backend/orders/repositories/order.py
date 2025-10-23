"""Order repository for handling Order model data access operations."""

from typing import Any, Optional

from django.contrib.auth import get_user_model
from django.db.models import QuerySet

from core.repositories import BaseRepository

from ..models import Order

User = get_user_model()


class OrderRepository(BaseRepository):
    """
    Repository for Order model operations.

    Centralizes all order database queries with optimized prefetching
    to prevent N+1 query problems when loading order items and products.
    """

    model = Order

    @staticmethod
    def get_user_orders(user: User) -> QuerySet:  # type: ignore
        """
        Get all orders for a user with prefetched items and products.

        Prevents N+1 queries by prefetching order items and related products.

        Args:
            user: User instance

        Returns:
            QuerySet of user's orders ordered by creation date (newest first)
        """
        return Order.objects.filter(user=user).prefetch_related("items__product").order_by("-created_at")

    @staticmethod
    def get_order(order_id: int, user: User) -> Optional[Order]:  # type: ignore
        """
        Get a specific order for a user with prefetched data.

        Includes security check to ensure order belongs to user.

        Args:
            order_id: Order ID
            user: User instance (for security check)

        Returns:
            Order with items and products prefetched, or None if not found
        """
        try:
            return Order.objects.prefetch_related("items__product").get(id=order_id, user=user)
        except Order.DoesNotExist:
            return None

    @staticmethod
    def create_order(user: User, **kwargs: Any) -> Order:  # type: ignore
        """
        Create a new order for a user.

        Args:
            user: User instance
            **kwargs: Additional order fields (status, total_amount, etc.)

        Returns:
            Created Order instance
        """
        return Order.objects.create(user=user, **kwargs)

    @staticmethod
    def user_has_orders(user: User) -> bool:  # type: ignore
        """
        Check if a user has any orders.

        Args:
            user: User instance

        Returns:
            True if user has orders, False otherwise
        """
        return Order.objects.filter(user=user).exists()

    @staticmethod
    def count_user_orders(user: User) -> int:  # type: ignore
        """
        Count total orders for a user.

        Args:
            user: User instance

        Returns:
            Number of orders for the user
        """
        return Order.objects.filter(user=user).count()

    @staticmethod
    def update_order(order: Order, **kwargs: Any) -> Order:
        """
        Update order fields.

        Args:
            order: Order instance
            **kwargs: Fields to update

        Returns:
            Updated Order instance
        """
        for attr, value in kwargs.items():
            setattr(order, attr, value)
        order.save()
        return order
