"""Shopping cart service for managing cart operations and validations."""

from typing import Optional

from django.db import transaction
from rest_framework.request import Request

from core import SessionService
from products.models import Product

from ..models import Cart, CartItem


class CartService:
    """
    Service for managing shopping cart operations.

    Handles:
    - Cart creation and retrieval (for authenticated users and guests)
    - Adding, updating, and removing items
    - Stock and quantity validation
    - Price freezing at add time
    - Response data formatting
    """

    # ====== CART RETRIEVAL ======

    @staticmethod
    def get_or_create_cart(request: Request) -> tuple[Cart, Optional[str]]:
        """
        Get or create a cart for the current request.

        For authenticated users, returns user-based cart.
        For guest users, returns session-based cart with session ID.

        Args:
            request: Django REST Framework request object

        Returns:
            tuple: (cart, session_key)
                - cart: Cart object
                - session_key: None for authenticated users, session ID string for guests
        """
        if SessionService.is_authenticated(request):
            cart, _ = Cart.objects.get_or_create(user=request.user, defaults={"session_key": None})
            return cart, None
        else:
            # Get session ID via hybrid approach (header or cookie)
            session_key = SessionService.get_session_id(request)
            cart, _ = Cart.objects.get_or_create(session_key=session_key, user=None, defaults={})
            return cart, session_key

    # ====== VALIDATION METHODS ======

    @staticmethod
    def validate_product_exists(product_id: int) -> tuple[bool, Optional[str], Optional[Product]]:
        """
        Validate that product exists and is active.

        Args:
            product_id: Product ID to validate

        Returns:
            tuple: (is_valid, error_message, product)
                - is_valid: True if product exists and is active
                - error_message: Error message if invalid, None otherwise
                - product: Product object if valid, None otherwise
        """
        try:
            product = Product.objects.get(id=product_id, is_active=True)
            return True, None, product
        except Product.DoesNotExist:
            return False, "Product not found.", None

    @staticmethod
    def validate_quantity(quantity: int) -> tuple[bool, Optional[str]]:
        """
        Validate quantity is within allowed range (1-99).

        Args:
            quantity: Quantity to validate

        Returns:
            tuple: (is_valid, error_message)
        """
        if isinstance(quantity, str):
            try:
                quantity = int(quantity)
            except (ValueError, TypeError):
                return False, "Invalid quantity value."

        if not isinstance(quantity, int) or quantity < 1 or quantity > 99:
            return False, "Quantity must be between 1 and 99."

        return True, None

    @staticmethod
    def validate_stock_availability(
        product: Product, quantity: int, cart_item: Optional[CartItem] = None
    ) -> tuple[bool, Optional[str]]:
        """
        Validate product stock availability.

        Args:
            product: Product object to check stock for
            quantity: Quantity to validate
            cart_item: Existing cart item (optional, for update scenarios)

        Returns:
            tuple: (is_valid, error_message)
        """
        # Check if product is in stock at all
        if not product.in_stock:
            return False, "Product is out of stock."

        # Check if quantity is available
        if product.stock_quantity < quantity:
            return False, f"Only {product.stock_quantity} items available in stock."

        return True, None

    # ====== CART ITEM OPERATIONS ======

    @staticmethod
    def add_item_to_cart(cart: Cart, product: Product, quantity: int) -> CartItem:
        """
        Add product to cart or update quantity if already exists.

        Freezes unit price at add time (price doesn't change if product price updates).

        Args:
            cart: Cart object
            product: Product to add
            quantity: Quantity to add

        Returns:
            CartItem: Created or updated cart item
        """
        with transaction.atomic():
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart, product=product, defaults={"quantity": quantity, "unit_price": product.price}
            )

            if not created:
                # Update existing item quantity
                new_quantity = cart_item.quantity + quantity

                # Validate new quantity doesn't exceed 99
                if new_quantity > 99:
                    raise ValueError("Maximum quantity per product is 99.")

                # Validate stock for new quantity
                if product.stock_quantity < new_quantity:
                    raise ValueError(f"Only {product.stock_quantity} items available in stock.")

                cart_item.quantity = new_quantity
                cart_item.save()

        return cart_item

    @staticmethod
    def update_cart_item_quantity(cart_item: CartItem, quantity: int) -> CartItem:
        """
        Update quantity of existing cart item.

        Args:
            cart_item: CartItem to update
            quantity: New quantity

        Returns:
            CartItem: Updated cart item

        Raises:
            ValueError: If stock unavailable or quantity exceeds limits
        """
        # Validate stock availability
        if cart_item.product.stock_quantity < quantity:
            raise ValueError(f"Only {cart_item.product.stock_quantity} items available in stock.")

        with transaction.atomic():
            cart_item.quantity = quantity
            cart_item.save()

        return cart_item

    @staticmethod
    def remove_item_from_cart(cart_item: CartItem) -> str:
        """
        Remove item from cart.

        Args:
            cart_item: CartItem to remove

        Returns:
            str: Product name of removed item (for message)
        """
        product_name = cart_item.product.name

        with transaction.atomic():
            cart_item.delete()

        return product_name

    @staticmethod
    def clear_cart(cart: Cart) -> None:
        """
        Remove all items from cart.

        Args:
            cart: Cart to clear
        """
        with transaction.atomic():
            cart.clear()

    # ====== RESPONSE FORMATTING ======

    @staticmethod
    def format_cart_response(cart: Cart) -> dict:
        """
        Format cart data for API response.

        Args:
            cart: Cart object to format

        Returns:
            dict: Formatted cart data with items and totals
        """
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
            item_data = CartService._format_item_response(item)
            cart_data["items"].append(item_data)

        return cart_data

    @staticmethod
    def format_item_response(cart_item: CartItem) -> dict:
        """
        Format individual cart item for API response.

        Args:
            cart_item: CartItem to format

        Returns:
            dict: Formatted item data with product info and subtotal
        """
        return CartService._format_item_response(cart_item)

    @staticmethod
    def _format_item_response(cart_item: CartItem) -> dict:
        """
        Internal method to format cart item data.

        Args:
            cart_item: CartItem to format

        Returns:
            dict: Formatted item data
        """
        image_url = CartService._get_product_image_url(cart_item.product)

        return {
            "id": cart_item.id,
            "product": {
                "id": cart_item.product.id,
                "name": cart_item.product.name,
                "sku": cart_item.product.sku,
                "stock_quantity": cart_item.product.stock_quantity,
                "in_stock": cart_item.product.in_stock,
                "image": image_url,
            },
            "quantity": cart_item.quantity,
            "unit_price": str(cart_item.unit_price),
            "subtotal": str(cart_item.subtotal),
            "created_at": cart_item.created_at.isoformat(),
        }

    @staticmethod
    def format_cart_totals(cart: Cart) -> dict:
        """
        Format cart totals for API response.

        Args:
            cart: Cart object

        Returns:
            dict: Formatted totals (item_count, subtotal, tax_amount, total)
        """
        return {
            "item_count": cart.item_count,
            "subtotal": str(cart.subtotal),
            "tax_amount": str(cart.tax_amount),
            "total": str(cart.total),
        }

    @staticmethod
    def _get_product_image_url(product: Product) -> Optional[str]:
        """
        Get primary or fallback product image URL.

        Args:
            product: Product object

        Returns:
            str: Image URL or None if no images
        """
        primary_image = product.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = product.images.first()
        return primary_image.image.url if primary_image else None
