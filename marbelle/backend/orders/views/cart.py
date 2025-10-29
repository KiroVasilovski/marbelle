"""Shopping cart API views."""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response

from core import ResponseHandler

from ..serializers import AddToCartSerializer, UpdateCartItemSerializer
from ..services import CartService


@api_view(["GET"])
@permission_classes([AllowAny])
def get_cart(request: Request) -> Response:
    """
    Get current cart contents with items and totals.

    Returns cart with all items, quantities, prices, and calculated totals.
    Creates empty cart if none exists.
    """
    cart, session_key = CartService.get_or_create_cart(request)

    cart_data = CartService.format_cart_response(cart)

    response = ResponseHandler.success(
        data=cart_data,
        message="Cart retrieved successfully.",
    )

    # Add session ID to response header for Safari compatibility
    if session_key:
        response["X-Session-ID"] = session_key

    return response


@api_view(["POST"])
@permission_classes([AllowAny])
def add_to_cart(request: Request) -> Response:
    """
    Add a product to the cart or update quantity if already exists.

    Expected payload:
    {
        "product_id": 1,
        "quantity": 2
    }
    """
    serializer = AddToCartSerializer(data=request.data)

    if not serializer.is_valid():
        return ResponseHandler.error(message="Invalid input.", errors=serializer.errors)

    product_id = serializer.validated_data["product_id"]
    quantity = serializer.validated_data["quantity"]

    cart, session_key = CartService.get_or_create_cart(request)

    success, error_msg, cart_item = CartService.add_item_to_cart(cart, product_id, quantity)

    if not success:
        status_code = status.HTTP_404_NOT_FOUND if "not found" in error_msg.lower() else status.HTTP_400_BAD_REQUEST
        return ResponseHandler.error(
            message=error_msg,
            status_code=status_code,
        )

    item_data = {
        "item": CartService.format_item_response(cart_item),
        "cart_totals": CartService.format_cart_totals(cart),
    }

    response = ResponseHandler.success(
        data=item_data,
        message=f"Added {quantity} x {cart_item.product.name} to cart.",
    )

    # Add session ID to response header for Safari compatibility
    if session_key:
        response["X-Session-ID"] = session_key

    return response


@api_view(["PUT"])
@permission_classes([AllowAny])
def update_cart_item(request: Request, item_id: int) -> Response:
    """
    Update quantity of a specific cart item.

    Expected payload:
    {
        "quantity": 3
    }
    """
    serializer = UpdateCartItemSerializer(data=request.data)

    if not serializer.is_valid():
        return ResponseHandler.error(message="Invalid input.", errors=serializer.errors)

    quantity = serializer.validated_data["quantity"]

    cart, session_key = CartService.get_or_create_cart(request)

    success, error_msg, cart_item = CartService.update_cart_item_quantity(item_id, cart, quantity)

    if not success:
        status_code = status.HTTP_404_NOT_FOUND if "not found" in error_msg.lower() else status.HTTP_400_BAD_REQUEST
        return ResponseHandler.error(
            message=error_msg,
            status_code=status_code,
        )

    item_data = {
        "item": CartService.format_item_response(cart_item),
        "cart_totals": CartService.format_cart_totals(cart),
    }

    response = ResponseHandler.success(
        data=item_data,
        message="Cart item updated successfully.",
    )

    # Add session ID to response header for Safari compatibility
    if session_key:
        response["X-Session-ID"] = session_key

    return response


@api_view(["DELETE"])
@permission_classes([AllowAny])
def remove_cart_item(request: Request, item_id: int) -> Response:
    """
    Remove a specific item from the cart.
    """
    cart, session_key = CartService.get_or_create_cart(request)

    success, error_msg, product_name = CartService.remove_item_from_cart(item_id, cart)

    if not success:
        status_code = status.HTTP_404_NOT_FOUND if "not found" in error_msg.lower() else status.HTTP_400_BAD_REQUEST
        return ResponseHandler.error(
            message=error_msg,
            status_code=status_code,
        )

    cart_totals_data = {"cart_totals": CartService.format_cart_totals(cart)}

    response = ResponseHandler.success(
        data=cart_totals_data,
        message=f"Removed {product_name} from cart.",
    )

    # Add session ID to response header for Safari compatibility
    if session_key:
        response["X-Session-ID"] = session_key

    return response


@api_view(["DELETE"])
@permission_classes([AllowAny])
def clear_cart(request: Request) -> Response:
    """
    Remove all items from the cart.
    """
    cart, session_key = CartService.get_or_create_cart(request)

    success, error_msg = CartService.clear_cart(cart)

    if not success:
        return ResponseHandler.error(
            message=error_msg,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    cart_totals_data = {"cart_totals": CartService.format_cart_totals(cart)}

    response = ResponseHandler.success(
        data=cart_totals_data,
        message="Cart cleared successfully.",
    )

    # Add session ID to response header for Safari compatibility
    if session_key:
        response["X-Session-ID"] = session_key

    return response
