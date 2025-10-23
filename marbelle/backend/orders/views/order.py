"""
Order API views for order management endpoints.
Note: Order endpoints not yet fully implemented. This module is a placeholder
for future order management endpoints (list orders, retrieve order details, etc.)
"""

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from ..models import Order
from ..serializers import OrderSerializer


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Order model.
    Provides read-only endpoints for users to view their orders.
    """

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Return only orders for the authenticated user.
        """
        return Order.objects.filter(user=self.request.user).prefetch_related("items__product").order_by("-created_at")
