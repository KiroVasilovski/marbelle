"""
Cart serializers for shopping cart endpoints.
"""

from rest_framework import serializers

from ..models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    """
    Serializer for CartItem model.
    Displays cart items with product details and pricing.
    """

    class Meta:
        model = CartItem
        fields = ["id", "cart", "product", "quantity", "unit_price", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class CartSerializer(serializers.ModelSerializer):
    """
    Serializer for Cart model.
    Includes cart items and calculated totals.
    """

    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "user", "session_key", "items", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
