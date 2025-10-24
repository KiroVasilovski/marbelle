from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response

from core import ResponseHandler
from products.models import Product

from ..models import Cart, CartItem


def get_or_create_cart(request: Request) -> tuple[Cart, str | None]:
    """
    Get or create a cart for the current request.

    For authenticated users, get/create cart associated with user.
    For guest users, get/create cart associated with session key.

    Returns:
        tuple: (cart, session_key) - session_key is None for authenticated users,
               or the session ID for guest users (to be sent back to client)
    """
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user, defaults={"session_key": None})
        return cart, None
    else:
        # PRIORITY 1: Check if client sent session ID via header (Safari or returning user)
        # This allows Safari and other cookie-blocked browsers to maintain sessions
        session_key = request.headers.get("X-Session-ID")

        # PRIORITY 2: If no header, try cookie-based session (Chrome, Firefox, Edge)
        # This is more secure (HttpOnly) and happens automatically for first-time visitors
        if not session_key:
            if not request.session.session_key:
                request.session.create()
            session_key = request.session.session_key

            # If session_key is still None, it means session creation failed
            if not session_key:
                # Force session save and get key
                request.session.save()
                session_key = request.session.session_key

        cart, _ = Cart.objects.get_or_create(session_key=session_key, user=None, defaults={})
        return cart, session_key


@api_view(["GET"])
@permission_classes([AllowAny])
def get_cart(request: Request) -> Response:
    """
    Get current cart contents with items and totals.

    Returns cart with all items, quantities, prices, and calculated totals.
    Creates empty cart if none exists.
    """
    try:
        cart, session_key = get_or_create_cart(request)

        # Serialize cart data
        cart_data = {
            "id": cart.id,
            "item_count": cart.item_count,
            "subtotal": str(cart.subtotal),
            "tax_amount": str(cart.tax_amount),
            "total": str(cart.total),
            "items": [],
        }

        # Add cart items
        for item in cart.items.select_related("product").all():
            # Get primary image for product, fallback to any image
            primary_image = item.product.images.filter(is_primary=True).first()
            if not primary_image:
                primary_image = item.product.images.first()
            image_url = primary_image.image.url if primary_image else None

            cart_data["items"].append(
                {
                    "id": item.id,
                    "product": {
                        "id": item.product.id,
                        "name": item.product.name,
                        "sku": item.product.sku,
                        "stock_quantity": item.product.stock_quantity,
                        "in_stock": item.product.in_stock,
                        "image": image_url,
                    },
                    "quantity": item.quantity,
                    "unit_price": str(item.unit_price),
                    "subtotal": str(item.subtotal),
                    "created_at": item.created_at.isoformat(),
                }
            )

        response = ResponseHandler.success(
            data=cart_data,
            message="Cart retrieved successfully.",
        )

        # Add session ID to response header for Safari compatibility
        if session_key:
            response["X-Session-ID"] = session_key

        return response

    except Exception as e:
        return ResponseHandler.error(
            message=f"Error retrieving cart: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


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
    try:
        data = request.data
        product_id = data.get("product_id")
        quantity = data.get("quantity", 1)

        # Validation
        if not product_id:
            return ResponseHandler.error(message="Product ID is required.")

        try:
            quantity = int(quantity)
            if quantity < 1 or quantity > 99:
                return ResponseHandler.error(message="Quantity must be between 1 and 99.")
        except (ValueError, TypeError):
            return ResponseHandler.error(message="Invalid quantity value.")

        # Get product and validate
        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return ResponseHandler.error(
                message="Product not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        # Check stock availability
        if not product.in_stock:
            return ResponseHandler.error(message="Product is out of stock.")

        if product.stock_quantity < quantity:
            return ResponseHandler.error(message=f"Only {product.stock_quantity} items available in stock.")

        # Get or create cart
        cart, session_key = get_or_create_cart(request)

        # Add or update cart item
        with transaction.atomic():
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart, product=product, defaults={"quantity": quantity, "unit_price": product.price}
            )

            if not created:
                # Update existing item quantity
                new_quantity = cart_item.quantity + quantity
                if new_quantity > 99:
                    return ResponseHandler.error(message="Maximum quantity per product is 99.")

                if product.stock_quantity < new_quantity:
                    return ResponseHandler.error(message=f"Only {product.stock_quantity} items available in stock.")

                cart_item.quantity = new_quantity
                cart_item.save()

        # Return updated cart item data
        primary_image = product.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = product.images.first()
        image_url = primary_image.image.url if primary_image else None

        item_data = {
            "item": {
                "id": cart_item.id,
                "product": {
                    "id": product.id,
                    "name": product.name,
                    "sku": product.sku,
                    "image": image_url,
                },
                "quantity": cart_item.quantity,
                "unit_price": str(cart_item.unit_price),
                "subtotal": str(cart_item.subtotal),
            },
            "cart_totals": {
                "item_count": cart.item_count,
                "subtotal": str(cart.subtotal),
                "tax_amount": str(cart.tax_amount),
                "total": str(cart.total),
            },
        }

        response = ResponseHandler.success(
            data=item_data,
            message=f"Added {quantity} x {product.name} to cart.",
            status_code=status.HTTP_200_OK,
        )

        # Add session ID to response header for Safari compatibility
        if session_key:
            response["X-Session-ID"] = session_key

        return response

    except Product.DoesNotExist:
        return ResponseHandler.error(
            message="Product not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        return ResponseHandler.error(
            message=f"Error adding item to cart: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


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
    try:
        data = request.data
        quantity = data.get("quantity")

        # Validation
        if quantity is None:
            return ResponseHandler.error(message="Quantity is required.")

        try:
            quantity = int(quantity)
            if quantity < 1 or quantity > 99:
                return ResponseHandler.error(message="Quantity must be between 1 and 99.")
        except (ValueError, TypeError):
            return ResponseHandler.error(message="Invalid quantity value.")

        # Get cart and item
        cart, session_key = get_or_create_cart(request)
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return ResponseHandler.error(
                message="Cart item not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        # Check stock availability
        if cart_item.product.stock_quantity < quantity:
            return ResponseHandler.error(message=f"Only {cart_item.product.stock_quantity} items available in stock.")

        # Update quantity
        with transaction.atomic():
            cart_item.quantity = quantity
            cart_item.save()

        # Return updated item data
        primary_image = cart_item.product.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = cart_item.product.images.first()
        image_url = primary_image.image.url if primary_image else None

        item_data = {
            "item": {
                "id": cart_item.id,
                "product": {
                    "id": cart_item.product.id,
                    "name": cart_item.product.name,
                    "sku": cart_item.product.sku,
                    "image": image_url,
                },
                "quantity": cart_item.quantity,
                "unit_price": str(cart_item.unit_price),
                "subtotal": str(cart_item.subtotal),
            },
            "cart_totals": {
                "item_count": cart.item_count,
                "subtotal": str(cart.subtotal),
                "tax_amount": str(cart.tax_amount),
                "total": str(cart.total),
            },
        }

        response = ResponseHandler.success(
            data=item_data,
            message="Cart item updated successfully.",
        )

        # Add session ID to response header for Safari compatibility
        if session_key:
            response["X-Session-ID"] = session_key

        return response

    except CartItem.DoesNotExist:
        return ResponseHandler.error(
            message="Cart item not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        return ResponseHandler.error(
            message=f"Error updating cart item: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["DELETE"])
@permission_classes([AllowAny])
def remove_cart_item(request: Request, item_id: int) -> Response:
    """
    Remove a specific item from the cart.
    """
    try:
        # Get cart and item
        cart, session_key = get_or_create_cart(request)
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return ResponseHandler.error(
                message="Cart item not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        product_name = cart_item.product.name

        # Remove item
        with transaction.atomic():
            cart_item.delete()

        cart_totals_data = {
            "cart_totals": {
                "item_count": cart.item_count,
                "subtotal": str(cart.subtotal),
                "tax_amount": str(cart.tax_amount),
                "total": str(cart.total),
            }
        }

        response = ResponseHandler.success(
            data=cart_totals_data,
            message=f"Removed {product_name} from cart.",
        )

        # Add session ID to response header for Safari compatibility
        if session_key:
            response["X-Session-ID"] = session_key

        return response

    except CartItem.DoesNotExist:
        return ResponseHandler.error(
            message="Cart item not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        return ResponseHandler.error(
            message=f"Error removing cart item: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["DELETE"])
@permission_classes([AllowAny])
def clear_cart(request: Request) -> Response:
    """
    Remove all items from the cart.
    """
    try:
        cart, session_key = get_or_create_cart(request)

        with transaction.atomic():
            cart.clear()

        cart_totals_data = {
            "cart_totals": {
                "item_count": 0,
                "subtotal": "0.00",
                "tax_amount": "0.00",
                "total": "0.00",
            }
        }

        response = ResponseHandler.success(
            data=cart_totals_data,
            message="Cart cleared successfully.",
        )

        # Add session ID to response header for Safari compatibility
        if session_key:
            response["X-Session-ID"] = session_key

        return response

    except Exception as e:
        return ResponseHandler.error(
            message=f"Error clearing cart: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
