"""Comprehensive tests for order and cart repositories."""

from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase

from products.models import Category, Product

from .models import CartItem, Order, OrderItem
from .repositories import CartRepository, OrderRepository

User = get_user_model()


class CartRepositoryTest(TestCase):
    """Test CartRepository data access methods."""

    def setUp(self) -> None:
        """Set up test fixtures."""
        self.user = User.objects.create_user(
            email="test@example.com",
            username="test@example.com",
            password="TestPassword123",
        )

        self.category = Category.objects.create(
            name="Slabs",
            description="Stone slabs",
            is_active=True,
        )

        self.product = Product.objects.create(
            name="White Marble",
            description="Premium marble",
            price="150.00",
            unit_of_measure="sqm",
            category=self.category,
            stock_quantity=100,
            sku="WM-001",
            is_active=True,
        )

    def test_get_user_cart(self) -> None:
        """Test getting or creating user cart."""
        cart = CartRepository.get_user_cart(self.user)
        self.assertIsNotNone(cart)
        self.assertEqual(cart.user_id, self.user.id)
        self.assertIsNone(cart.session_key)

    def test_get_user_cart_returns_same_cart(self) -> None:
        """Test get_user_cart returns same cart on multiple calls."""
        cart1 = CartRepository.get_user_cart(self.user)
        cart2 = CartRepository.get_user_cart(self.user)
        self.assertEqual(cart1.id, cart2.id)

    def test_get_guest_cart(self) -> None:
        """Test getting or creating guest cart."""
        session_key = "test_session_abc123"
        cart = CartRepository.get_guest_cart(session_key)
        self.assertIsNotNone(cart)
        self.assertIsNone(cart.user)
        self.assertEqual(cart.session_key, session_key)

    def test_get_guest_cart_returns_same_cart(self) -> None:
        """Test get_guest_cart returns same cart on multiple calls."""
        session_key = "test_session_xyz789"
        cart1 = CartRepository.get_guest_cart(session_key)
        cart2 = CartRepository.get_guest_cart(session_key)
        self.assertEqual(cart1.id, cart2.id)

    def test_get_cart_items_empty(self) -> None:
        """Test getting items from empty cart."""
        cart = CartRepository.get_user_cart(self.user)
        items = list(CartRepository.get_cart_items(cart))
        self.assertEqual(len(items), 0)

    def test_get_cart_items_with_items(self) -> None:
        """Test getting items from cart with items."""
        cart = CartRepository.get_user_cart(self.user)
        CartItem.objects.create(
            cart=cart,
            product=self.product,
            quantity=2,
            unit_price=self.product.price,
        )

        items = list(CartRepository.get_cart_items(cart))
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0].quantity, 2)
        self.assertEqual(items[0].product.id, self.product.id)

    def test_get_cart_item_success(self) -> None:
        """Test getting specific cart item."""
        cart = CartRepository.get_user_cart(self.user)
        item = CartItem.objects.create(
            cart=cart,
            product=self.product,
            quantity=3,
            unit_price=self.product.price,
        )

        found = CartRepository.get_cart_item(item.id, cart)
        self.assertIsNotNone(found)
        self.assertEqual(found.id, item.id)
        self.assertEqual(found.quantity, 3)

    def test_get_cart_item_not_found(self) -> None:
        """Test get_cart_item returns None for non-existent item."""
        cart = CartRepository.get_user_cart(self.user)
        found = CartRepository.get_cart_item(99999, cart)
        self.assertIsNone(found)

    def test_get_cart_item_security_check(self) -> None:
        """Test get_cart_item doesn't return items from other carts."""
        cart1 = CartRepository.get_user_cart(self.user)
        item = CartItem.objects.create(
            cart=cart1,
            product=self.product,
            quantity=1,
            unit_price=self.product.price,
        )

        # Create second user and cart
        user2 = User.objects.create_user(
            email="user2@example.com",
            username="user2@example.com",
            password="Password123",
        )
        cart2 = CartRepository.get_user_cart(user2)

        # Should not find item from cart1 in cart2
        found = CartRepository.get_cart_item(item.id, cart2)
        self.assertIsNone(found)

    def test_add_item(self) -> None:
        """Test adding item to cart."""
        cart = CartRepository.get_user_cart(self.user)
        item = CartRepository.add_item(cart, self.product.id, 5)

        self.assertIsNotNone(item)
        self.assertEqual(item.cart_id, cart.id)
        self.assertEqual(item.product_id, self.product.id)
        self.assertEqual(item.quantity, 5)

    def test_add_item_duplicate_updates(self) -> None:
        """Test adding duplicate item updates quantity."""
        cart = CartRepository.get_user_cart(self.user)
        CartRepository.add_item(cart, self.product.id, 3)
        item = CartRepository.add_item(cart, self.product.id, 2)

        self.assertEqual(item.quantity, 2)  # Updated, not accumulated

    def test_update_item(self) -> None:
        """Test updating cart item quantity."""
        cart = CartRepository.get_user_cart(self.user)
        item = CartRepository.add_item(cart, self.product.id, 1)
        updated = CartRepository.update_item(item.id, cart, 10)

        self.assertIsNotNone(updated)
        self.assertEqual(updated.quantity, 10)

    def test_update_item_not_found(self) -> None:
        """Test update_item returns None for non-existent item."""
        cart = CartRepository.get_user_cart(self.user)
        updated = CartRepository.update_item(99999, cart, 5)
        self.assertIsNone(updated)

    def test_remove_item(self) -> None:
        """Test removing item from cart."""
        cart = CartRepository.get_user_cart(self.user)
        item = CartRepository.add_item(cart, self.product.id, 1)
        item_id = item.id

        removed = CartRepository.remove_item(item.id, cart)
        self.assertTrue(removed)

        # Verify item is deleted
        self.assertFalse(CartItem.objects.filter(id=item_id).exists())

    def test_remove_item_not_found(self) -> None:
        """Test remove_item returns False for non-existent item."""
        cart = CartRepository.get_user_cart(self.user)
        removed = CartRepository.remove_item(99999, cart)
        self.assertFalse(removed)

    def test_clear_cart(self) -> None:
        """Test clearing all items from cart."""
        cart = CartRepository.get_user_cart(self.user)
        CartRepository.add_item(cart, self.product.id, 1)

        # Add second product
        product2 = Product.objects.create(
            name="Black Granite",
            description="Granite slab",
            price="200.00",
            unit_of_measure="sqm",
            category=self.category,
            stock_quantity=50,
            sku="BG-001",
            is_active=True,
        )
        CartRepository.add_item(cart, product2.id, 2)

        # Clear cart
        CartRepository.clear_cart(cart)

        items = list(CartRepository.get_cart_items(cart))
        self.assertEqual(len(items), 0)

    def test_cart_item_exists(self) -> None:
        """Test checking if product exists in cart."""
        cart = CartRepository.get_user_cart(self.user)
        self.assertFalse(CartRepository.cart_item_exists(self.product.id, cart))

        CartRepository.add_item(cart, self.product.id, 1)
        self.assertTrue(CartRepository.cart_item_exists(self.product.id, cart))


class OrderRepositoryTest(TestCase):
    """Test OrderRepository data access methods."""

    def setUp(self) -> None:
        """Set up test fixtures."""
        self.user = User.objects.create_user(
            email="test@example.com",
            username="test@example.com",
            password="TestPassword123",
        )

        self.category = Category.objects.create(
            name="Slabs",
            description="Stone slabs",
            is_active=True,
        )

        self.product = Product.objects.create(
            name="White Marble",
            description="Premium marble",
            price="150.00",
            unit_of_measure="sqm",
            category=self.category,
            stock_quantity=100,
            sku="WM-001",
            is_active=True,
        )

    def test_get_user_orders_empty(self) -> None:
        """Test getting orders for user with no orders."""
        orders = list(OrderRepository.get_user_orders(self.user))
        self.assertEqual(len(orders), 0)

    def test_get_user_orders_with_orders(self) -> None:
        """Test getting orders for user with orders."""
        order1 = Order.objects.create(user=self.user, status="pending")
        order2 = Order.objects.create(user=self.user, status="processing")

        orders = list(OrderRepository.get_user_orders(self.user))
        self.assertEqual(len(orders), 2)
        order_ids = {o.id for o in orders}
        self.assertIn(order1.id, order_ids)
        self.assertIn(order2.id, order_ids)

    def test_get_user_orders_ordered(self) -> None:
        """Test orders are returned newest first."""
        order1 = Order.objects.create(user=self.user)
        order2 = Order.objects.create(user=self.user)

        orders = list(OrderRepository.get_user_orders(self.user))
        # order2 created after order1, should be first
        self.assertEqual(orders[0].id, order2.id)
        self.assertEqual(orders[1].id, order1.id)

    def test_get_order_success(self) -> None:
        """Test retrieving specific order."""
        order = Order.objects.create(user=self.user, status="pending")
        OrderItem.objects.create(
            order=order,
            product=self.product,
            quantity=2,
            unit_price=self.product.price,
        )

        found = OrderRepository.get_order(order.id, self.user)
        self.assertIsNotNone(found)
        self.assertEqual(found.id, order.id)
        self.assertEqual(found.status, "pending")

    def test_get_order_not_found(self) -> None:
        """Test get_order returns None for non-existent order."""
        found = OrderRepository.get_order(99999, self.user)
        self.assertIsNone(found)

    def test_get_order_security_check(self) -> None:
        """Test get_order doesn't return other user's orders."""
        user2 = User.objects.create_user(
            email="user2@example.com",
            username="user2@example.com",
            password="Password123",
        )
        order = Order.objects.create(user=self.user)

        # user2 shouldn't be able to get user1's order
        found = OrderRepository.get_order(order.id, user2)
        self.assertIsNone(found)

    def test_create_order(self) -> None:
        """Test creating an order."""
        order = OrderRepository.create_order(self.user, status="pending", total_amount=Decimal("300.00"))

        self.assertIsNotNone(order)
        self.assertEqual(order.user_id, self.user.id)
        self.assertEqual(order.status, "pending")
        self.assertEqual(order.total_amount, Decimal("300.00"))

    def test_user_has_orders_true(self) -> None:
        """Test user_has_orders returns True when user has orders."""
        Order.objects.create(user=self.user)
        self.assertTrue(OrderRepository.user_has_orders(self.user))

    def test_user_has_orders_false(self) -> None:
        """Test user_has_orders returns False when user has no orders."""
        self.assertFalse(OrderRepository.user_has_orders(self.user))

    def test_count_user_orders(self) -> None:
        """Test counting user's orders."""
        self.assertEqual(OrderRepository.count_user_orders(self.user), 0)

        Order.objects.create(user=self.user)
        self.assertEqual(OrderRepository.count_user_orders(self.user), 1)

        Order.objects.create(user=self.user)
        self.assertEqual(OrderRepository.count_user_orders(self.user), 2)

    def test_update_order(self) -> None:
        """Test updating order fields."""
        order = Order.objects.create(user=self.user, status="pending")
        updated = OrderRepository.update_order(order, status="shipped")

        self.assertEqual(updated.status, "shipped")
        # Verify it was saved
        order.refresh_from_db()
        self.assertEqual(order.status, "shipped")
