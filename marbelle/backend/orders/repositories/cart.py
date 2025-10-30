"""Cart repository for handling Cart and CartItem model data access operations."""

from typing import Optional

from django.contrib.auth import get_user_model
from django.db.models import QuerySet

from core.repositories import BaseRepository

from ..models import Cart, CartItem

User = get_user_model()


class CartRepository(BaseRepository):
    """
    Repository for Cart and CartItem model operations.
    """

    model = Cart

    @staticmethod
    def get_user_cart(user: User) -> Cart:  # type: ignore
        """
        Get or create a cart for an authenticated user.
        Each user has exactly one cart (OneToOneField relationship).

        Args:
            user: User instance

        Returns:
            Cart instance for the user (created if didn't exist)
        """
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    @staticmethod
    def get_guest_cart(session_key: str) -> Cart:
        """
        Get or create a cart for a guest user by session key.

        Args:
            session_key: Django session key for guest user

        Returns:
            Cart instance for the session (created if didn't exist)
        """
        cart, _ = Cart.objects.get_or_create(session_key=session_key, user=None)
        return cart

    @staticmethod
    def get_cart_items(cart: Cart) -> QuerySet:
        """
        Get all items in a cart with prefetched product data.

        Prevents N+1 queries by prefetching product data
        needed for cart item responses.

        Args:
            cart: Cart instance

        Returns:
            QuerySet of cart items with product data prefetched
        """
        return CartItem.objects.filter(cart=cart).select_related("product").order_by("created_at")

    @staticmethod
    def get_cart_item(item_id: int, cart: Cart) -> Optional[CartItem]:
        """
        Get a specific cart item with product data prefetched.

        Includes security check to ensure item belongs to cart.

        Args:
            item_id: Cart item ID
            cart: Cart instance (for security check)

        Returns:
            CartItem with product prefetched, or None if not found
        """
        try:
            return CartItem.objects.select_related("product").get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return None

    @staticmethod
    def add_item(cart: Cart, product_id: int, quantity: int) -> CartItem:
        """
        Add or update a product in the cart.

        If product already exists in cart, updates quantity.
        Otherwise creates new cart item.

        Args:
            cart: Cart instance
            product_id: Product ID
            quantity: Quantity to add

        Returns:
            CartItem instance
        """
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, product_id=product_id, defaults={"quantity": quantity}
        )

        if not created:
            cart_item.quantity = quantity
            cart_item.save()

        return cart_item

    @staticmethod
    def update_item(item_id: int, cart: Cart, quantity: int) -> Optional[CartItem]:
        """
        Update the quantity of a cart item.

        Args:
            item_id: Cart item ID
            cart: Cart instance (for security check)
            quantity: New quantity

        Returns:
            Updated CartItem, or None if not found
        """
        try:
            cart_item = CartItem.objects.select_related("product").get(id=item_id, cart=cart)
            cart_item.quantity = quantity
            cart_item.save()

            return cart_item
        except CartItem.DoesNotExist:
            return None

    @staticmethod
    def remove_item(item_id: int, cart: Cart) -> bool:
        """
        Remove an item from the cart.

        Args:
            item_id: Cart item ID
            cart: Cart instance (for security check)

        Returns:
            True if item was deleted, False if not found
        """
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            cart_item.delete()

            return True
        except CartItem.DoesNotExist:
            return False

    @staticmethod
    def clear_cart(cart: Cart) -> None:
        """
        Remove all items from a cart.

        Args:
            cart: Cart instance
        """
        cart.items.all().delete()

    @staticmethod
    def cart_item_exists(product_id: int, cart: Cart) -> bool:
        """
        Check if a product already exists in the cart.

        Args:
            product_id: Product ID
            cart: Cart instance

        Returns:
            True if product exists in cart, False otherwise
        """
        return CartItem.objects.filter(cart=cart, product_id=product_id).exists()
