"""
Order serializers for order management endpoints.
"""

from rest_framework import serializers

from ..models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer for OrderItem model.
    Displays order line items with product details and pricing.
    """

    class Meta:
        model = OrderItem
        fields = ["id", "order", "product", "quantity", "unit_price", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer for Order model.
    Includes order items and status information.
    """

    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ["id", "user", "status", "total_amount", "items", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
