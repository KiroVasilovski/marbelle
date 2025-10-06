from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response

from products.models import Product

from ..models import Cart, CartItem


def get_or_create_cart(request: Request) -> Cart:
    """
    Get or create a cart for the current request.

    For authenticated users, get/create cart associated with user.
    For guest users, get/create cart associated with session key.
    """
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user, defaults={"session_key": None})
        return cart
    else:
        # Ensure session is created for guest users
        if not request.session.session_key:
            request.session.create()

        session_key = request.session.session_key

        # If session_key is still None, it means session creation failed
        if not session_key:
            # Force session save and get key
            request.session.save()
            session_key = request.session.session_key

        cart, _ = Cart.objects.get_or_create(session_key=session_key, user=None, defaults={})
        return cart


@api_view(["GET"])
@permission_classes([AllowAny])
def get_cart(request: Request) -> Response:
    """
    Get current cart contents with items and totals.

    Returns cart with all items, quantities, prices, and calculated totals.
    Creates empty cart if none exists.
    """
    try:
        cart = get_or_create_cart(request)

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

        return Response({"success": True, "message": "Cart retrieved successfully.", "data": cart_data})

    except Exception as e:
        return Response({"success": False, "message": f"Error retrieving cart: {str(e)}"}, status=500)


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
            return Response({"success": False, "message": "Product ID is required."}, status=400)

        try:
            quantity = int(quantity)
            if quantity < 1 or quantity > 99:
                return Response({"success": False, "message": "Quantity must be between 1 and 99."}, status=400)
        except (ValueError, TypeError):
            return Response({"success": False, "message": "Invalid quantity value."}, status=400)

        # Get product and validate
        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({"success": False, "message": "Product not found."}, status=404)

        # Check stock availability
        if not product.in_stock:
            return Response({"success": False, "message": "Product is out of stock."}, status=400)

        if product.stock_quantity < quantity:
            return Response(
                {"success": False, "message": f"Only {product.stock_quantity} items available in stock."}, status=400
            )

        # Get or create cart
        cart = get_or_create_cart(request)

        # Add or update cart item
        with transaction.atomic():
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart, product=product, defaults={"quantity": quantity, "unit_price": product.price}
            )

            if not created:
                # Update existing item quantity
                new_quantity = cart_item.quantity + quantity
                if new_quantity > 99:
                    return Response({"success": False, "message": "Maximum quantity per product is 99."}, status=400)

                if product.stock_quantity < new_quantity:
                    return Response(
                        {"success": False, "message": f"Only {product.stock_quantity} items available in stock."},
                        status=400,
                    )

                cart_item.quantity = new_quantity
                cart_item.save()

        # Return updated cart item data
        primary_image = product.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = product.images.first()
        image_url = primary_image.image.url if primary_image else None

        return Response(
            {
                "success": True,
                "message": f"Added {quantity} x {product.name} to cart.",
                "data": {
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
                },
            }
        )

    except Product.DoesNotExist:
        return Response({"success": False, "message": "Product not found."}, status=404)
    except Exception as e:
        return Response({"success": False, "message": f"Error adding item to cart: {str(e)}"}, status=500)


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
            return Response({"success": False, "message": "Quantity is required."}, status=400)

        try:
            quantity = int(quantity)
            if quantity < 1 or quantity > 99:
                return Response({"success": False, "message": "Quantity must be between 1 and 99."}, status=400)
        except (ValueError, TypeError):
            return Response({"success": False, "message": "Invalid quantity value."}, status=400)

        # Get cart and item
        cart = get_or_create_cart(request)
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return Response({"success": False, "message": "Cart item not found."}, status=404)

        # Check stock availability
        if cart_item.product.stock_quantity < quantity:
            return Response(
                {"success": False, "message": f"Only {cart_item.product.stock_quantity} items available in stock."},
                status=400,
            )

        # Update quantity
        with transaction.atomic():
            cart_item.quantity = quantity
            cart_item.save()

        # Return updated item data
        primary_image = cart_item.product.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = cart_item.product.images.first()
        image_url = primary_image.image.url if primary_image else None

        return Response(
            {
                "success": True,
                "message": "Cart item updated successfully.",
                "data": {
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
                },
            }
        )

    except CartItem.DoesNotExist:
        return Response({"success": False, "message": "Cart item not found."}, status=404)
    except Exception as e:
        return Response({"success": False, "message": f"Error updating cart item: {str(e)}"}, status=500)


@api_view(["DELETE"])
@permission_classes([AllowAny])
def remove_cart_item(request: Request, item_id: int) -> Response:
    """
    Remove a specific item from the cart.
    """
    try:
        # Get cart and item
        cart = get_or_create_cart(request)
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return Response({"success": False, "message": "Cart item not found."}, status=404)

        product_name = cart_item.product.name

        # Remove item
        with transaction.atomic():
            cart_item.delete()

        return Response(
            {
                "success": True,
                "message": f"Removed {product_name} from cart.",
                "data": {
                    "cart_totals": {
                        "item_count": cart.item_count,
                        "subtotal": str(cart.subtotal),
                        "tax_amount": str(cart.tax_amount),
                        "total": str(cart.total),
                    }
                },
            }
        )

    except CartItem.DoesNotExist:
        return Response({"success": False, "message": "Cart item not found."}, status=404)
    except Exception as e:
        return Response({"success": False, "message": f"Error removing cart item: {str(e)}"}, status=500)


@api_view(["DELETE"])
@permission_classes([AllowAny])
def clear_cart(request: Request) -> Response:
    """
    Remove all items from the cart.
    """
    try:
        cart = get_or_create_cart(request)

        with transaction.atomic():
            cart.clear()

        return Response(
            {
                "success": True,
                "message": "Cart cleared successfully.",
                "data": {
                    "cart_totals": {
                        "item_count": 0,
                        "subtotal": "0.00",
                        "tax_amount": "0.00",
                        "total": "0.00",
                    }
                },
            }
        )

    except Exception as e:
        return Response({"success": False, "message": f"Error clearing cart: {str(e)}"}, status=500)
