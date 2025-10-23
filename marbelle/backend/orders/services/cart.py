"""Shopping cart service for managing cart operations and validations."""

from typing import Optional

from django.db import transaction
from rest_framework.request import Request

from core import SessionService
from products.models import Product
from products.repositories import ProductRepository

from ..models import Cart, CartItem
from ..repositories import CartRepository


class CartService:
    """
    Service for managing shopping cart operations.

    Handles all business logic:
    - Cart creation and retrieval (for authenticated users and guests)
    - Adding, updating, and removing items with full validation
    - Stock and quantity validation
    - Price freezing at add time
    - Cart item retrieval with access control
    - Response data formatting
    """

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

    @staticmethod
    def get_cart_item(item_id: int, cart: Cart) -> tuple[bool, Optional[str], Optional[CartItem]]:
        """
        Retrieve a cart item with access control and validation.
        Ensures the item belongs to the specified cart (security check).

        Args:
            item_id: Cart item ID
            cart: Cart instance (for security/access control)

        Returns:
            tuple: (is_valid, error_message, cart_item)
                - is_valid: True if item found and belongs to cart
                - error_message: Error message if invalid, None otherwise
                - cart_item: CartItem object if found, None otherwise
        """
        cart_item = CartRepository.get_cart_item(item_id, cart)

        if not cart_item:
            return False, "Cart item not found.", None

        return True, None, cart_item

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
        product = ProductRepository.get_by_id(product_id)

        if not product:
            return False, "Product not found.", None
        return True, None, product

    @staticmethod
    def validate_stock_availability(
        product: Product, quantity: int, cart_item: Optional[CartItem] = None
    ) -> tuple[bool, Optional[str]]:
        """
        Validate product stock availability for adding/updating cart items.

        Args:
            product: Product object to check stock for
            quantity: Quantity to validate
            cart_item: Existing cart item (optional, for update scenarios)

        Returns:
            tuple: (is_valid, error_message)
        """
        if not product.in_stock:
            return False, "Product is out of stock."

        if product.stock_quantity < quantity:
            return False, f"Only {product.stock_quantity} items available in stock."

        return True, None

    @staticmethod
    def add_item_to_cart(cart: Cart, product_id: int, quantity: int) -> tuple[bool, Optional[str], Optional[CartItem]]:
        """
        Add product to cart or update quantity if already exists.

        Args:
            cart: Cart object
            product_id: Product ID to add
            quantity: Quantity to add

        Returns:
            tuple: (success, error_message, cart_item)
                - success: True if item added successfully
                - error_message: Error description if failed, None if successful
                - cart_item: CartItem object if successful, None if failed
        """
        is_valid, error_msg, product = CartService.validate_product_exists(product_id)

        if not is_valid:
            return False, error_msg, None

        is_valid, error_msg = CartService.validate_stock_availability(product, quantity)
        if not is_valid:
            return False, error_msg, None

        try:
            with transaction.atomic():
                if CartRepository.cart_item_exists(product.id, cart):
                    # Update existing item
                    existing_items = CartRepository.get_cart_items(cart).filter(product=product)
                    cart_item = existing_items.first()

                    new_quantity = cart_item.quantity + quantity

                    # Validate new total quantity
                    if new_quantity > 99:
                        return False, "Maximum quantity per product is 99.", None

                    # Validate stock for new quantity
                    if product.stock_quantity < new_quantity:
                        return False, f"Only {product.stock_quantity} items available in stock.", None

                    cart_item = CartRepository.update_item(cart_item.id, cart, new_quantity)
                else:
                    # Create new item
                    cart_item = CartRepository.add_item(cart, product.id, quantity)

            return True, None, cart_item

        except Exception as e:
            return False, f"Error adding item to cart: {str(e)}", None

    @staticmethod
    def update_cart_item_quantity(
        item_id: int, cart: Cart, quantity: int
    ) -> tuple[bool, Optional[str], Optional[CartItem]]:
        """
        Update quantity of an existing cart item with validation.

        Args:
            item_id: Cart item ID
            cart: Cart instance (for access control)
            quantity: New quantity

        Returns:
            tuple: (success, error_message, cart_item)
                - success: True if updated successfully
                - error_message: Error description if failed, None if successful
                - cart_item: Updated CartItem if successful, None if failed
        """
        is_valid, error_msg, cart_item = CartService.get_cart_item(item_id, cart)

        if not is_valid:
            return False, error_msg, None

        is_valid, error_msg = CartService.validate_stock_availability(cart_item.product, quantity)

        if not is_valid:
            return False, error_msg, None

        try:
            with transaction.atomic():
                updated_item = CartRepository.update_item(item_id, cart, quantity)

            return True, None, updated_item

        except Exception as e:
            return False, f"Error updating cart item: {str(e)}", None

    @staticmethod
    def remove_item_from_cart(item_id: int, cart: Cart) -> tuple[bool, Optional[str], Optional[str]]:
        """
        Remove item from cart with access control.

        Args:
            item_id: Cart item ID
            cart: Cart instance (for access control)

        Returns:
            tuple: (success, error_message, product_name)
                - success: True if removed successfully
                - error_message: Error description if failed, None if successful
                - product_name: Name of removed product if successful, None if failed
        """
        is_valid, error_msg, cart_item = CartService.get_cart_item(item_id, cart)

        if not is_valid:
            return False, error_msg, None

        try:
            product_name = cart_item.product.name

            with transaction.atomic():
                CartRepository.remove_item(item_id, cart)

            return True, None, product_name

        except Exception as e:
            return False, f"Error removing cart item: {str(e)}", None

    @staticmethod
    def clear_cart(cart: Cart) -> tuple[bool, Optional[str]]:
        """
        Remove all items from cart.

        Args:
            cart: Cart to clear

        Returns:
            tuple: (success, error_message)
                - success: True if cleared successfully
                - error_message: Error description if failed, None if successful
        """
        try:
            with transaction.atomic():
                CartRepository.clear_cart(cart)

            return True, None

        except Exception as e:
            return False, f"Error clearing cart: {str(e)}"

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

        items = CartRepository.get_cart_items(cart)

        for item in items:
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
