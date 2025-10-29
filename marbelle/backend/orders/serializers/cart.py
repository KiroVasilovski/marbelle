"""Cart serializers for shopping cart endpoints."""

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


class AddToCartSerializer(serializers.Serializer):
    """
    Serializer for adding items to cart.
    Validates product_id and quantity.
    """

    product_id = serializers.IntegerField(required=True)
    quantity = serializers.IntegerField(required=False, default=1)

    def validate_product_id(self, value: int) -> int:
        """
        Validate that product_id is a positive integer.
        """
        if value <= 0:
            raise serializers.ValidationError("Product ID must be a positive integer.")
        return value

    def validate_quantity(self, value: int) -> int:
        """
        Validate that quantity is within allowed range (1-99).
        """
        if isinstance(value, str):
            try:
                value = int(value)
            except (ValueError, TypeError):
                raise serializers.ValidationError("Invalid quantity value.")

        if not isinstance(value, int) or value < 1 or value > 99:
            raise serializers.ValidationError("Quantity must be between 1 and 99.")

        return value


class UpdateCartItemSerializer(serializers.Serializer):
    """
    Serializer for updating cart item quantity.
    Validates quantity is within allowed range and required.
    """

    quantity = serializers.IntegerField(required=True)

    def validate_quantity(self, value: int) -> int:
        """
        Validate that quantity is within allowed range (1-99).
        """
        if isinstance(value, str):
            try:
                value = int(value)
            except (ValueError, TypeError):
                raise serializers.ValidationError("Invalid quantity value.")

        if not isinstance(value, int) or value < 1 or value > 99:
            raise serializers.ValidationError("Quantity must be between 1 and 99.")

        return value
