from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from products.models import Category, Product

from ..models import Cart, CartItem

User = get_user_model()


class CartModelTestCase(TestCase):
    """Test case for Cart and CartItem models."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass123")

        self.category = Category.objects.create(name="Test Category", description="Test category description")

        self.product1 = Product.objects.create(
            name="Test Product 1",
            description="Test product 1 description",
            price=Decimal("29.99"),
            category=self.category,
            sku="TEST-001",
            stock_quantity=10,
            is_active=True,
        )

        self.product2 = Product.objects.create(
            name="Test Product 2",
            description="Test product 2 description",
            price=Decimal("49.99"),
            category=self.category,
            sku="TEST-002",
            stock_quantity=5,
            is_active=True,
        )

    def test_user_cart_creation(self):
        """Test creating a cart for authenticated user."""
        cart = Cart.objects.create(user=self.user)

        self.assertEqual(cart.user, self.user)
        self.assertIsNone(cart.session_key)
        self.assertEqual(cart.item_count, 0)
        self.assertEqual(cart.subtotal, Decimal("0.00"))
        self.assertEqual(cart.tax_amount, Decimal("0.00"))
        self.assertEqual(cart.total, Decimal("0.00"))

    def test_guest_cart_creation(self):
        """Test creating a cart for guest user."""
        session_key = "test_session_key_123"
        cart = Cart.objects.create(session_key=session_key)

        self.assertIsNone(cart.user)
        self.assertEqual(cart.session_key, session_key)
        self.assertEqual(cart.item_count, 0)

    def test_cart_item_creation(self):
        """Test creating cart items."""
        cart = Cart.objects.create(user=self.user)

        item = CartItem.objects.create(cart=cart, product=self.product1, quantity=2, unit_price=self.product1.price)

        self.assertEqual(item.cart, cart)
        self.assertEqual(item.product, self.product1)
        self.assertEqual(item.quantity, 2)
        self.assertEqual(item.unit_price, self.product1.price)
        self.assertEqual(item.subtotal, Decimal("59.98"))  # 29.99 * 2

    def test_cart_totals_calculation(self):
        """Test cart totals calculation with multiple items."""
        cart = Cart.objects.create(user=self.user)

        # Add first item: 2 x $29.99 = $59.98
        CartItem.objects.create(cart=cart, product=self.product1, quantity=2, unit_price=self.product1.price)

        # Add second item: 1 x $49.99 = $49.99
        CartItem.objects.create(cart=cart, product=self.product2, quantity=1, unit_price=self.product2.price)

        # Subtotal: $59.98 + $49.99 = $109.97
        # Tax (9%): $109.97 * 0.09 = $9.8973 ≈ $9.90
        # Total: $109.97 + $9.90 = $119.87

        self.assertEqual(cart.item_count, 3)
        self.assertEqual(cart.subtotal, Decimal("109.97"))
        self.assertEqual(cart.tax_amount, Decimal("9.90"))  # Should be rounded
        self.assertEqual(cart.total, Decimal("119.87"))

    def test_cart_clear(self):
        """Test clearing all items from cart."""
        cart = Cart.objects.create(user=self.user)

        CartItem.objects.create(cart=cart, product=self.product1, quantity=2, unit_price=self.product1.price)

        self.assertEqual(cart.item_count, 2)

        cart.clear()

        self.assertEqual(cart.item_count, 0)
        self.assertEqual(cart.items.count(), 0)

    def test_cart_item_unit_price_auto_set(self):
        """Test that unit price is automatically set from product if not provided."""
        cart = Cart.objects.create(user=self.user)

        item = CartItem.objects.create(
            cart=cart,
            product=self.product1,
            quantity=1,
            # unit_price not provided
        )

        self.assertEqual(item.unit_price, self.product1.price)


class CartAPITestCase(TestCase):
    """Test case for Cart API endpoints."""

    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass123")

        self.category = Category.objects.create(name="Test Category", description="Test category description")

        self.product = Product.objects.create(
            name="Test Product",
            description="Test product description",
            price=Decimal("29.99"),
            category=self.category,
            sku="TEST-001",
            stock_quantity=10,
            is_active=True,
        )

        self.out_of_stock_product = Product.objects.create(
            name="Out of Stock Product",
            description="Product with no stock",
            price=Decimal("19.99"),
            category=self.category,
            sku="TEST-002",
            stock_quantity=0,
            is_active=True,
        )

    def test_get_empty_cart_guest(self):
        """Test getting empty cart for guest user."""
        url = reverse("orders:get_cart")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["item_count"], 0)
        self.assertEqual(data["data"]["subtotal"], "0.00")
        self.assertEqual(data["data"]["total"], "0.00")
        self.assertEqual(len(data["data"]["items"]), 0)

    def test_get_empty_cart_authenticated(self):
        """Test getting empty cart for authenticated user."""
        self.client.force_authenticate(user=self.user)
        url = reverse("orders:get_cart")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["item_count"], 0)

    def test_add_to_cart_guest(self):
        """Test adding item to cart for guest user."""
        url = reverse("orders:add_to_cart")
        payload = {"product_id": self.product.id, "quantity": 2}

        response = self.client.post(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["item"]["quantity"], 2)
        self.assertEqual(data["data"]["cart_totals"]["item_count"], 2)

    def test_add_to_cart_authenticated(self):
        """Test adding item to cart for authenticated user."""
        self.client.force_authenticate(user=self.user)
        url = reverse("orders:add_to_cart")
        payload = {"product_id": self.product.id, "quantity": 1}

        response = self.client.post(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["item"]["quantity"], 1)

    def test_add_to_cart_invalid_product(self):
        """Test adding non-existent product to cart."""
        url = reverse("orders:add_to_cart")
        payload = {
            "product_id": 99999,  # Non-existent product
            "quantity": 1,
        }

        response = self.client.post(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        data = response.json()

        self.assertFalse(data["success"])

    def test_add_to_cart_out_of_stock(self):
        """Test adding out-of-stock product to cart."""
        url = reverse("orders:add_to_cart")
        payload = {"product_id": self.out_of_stock_product.id, "quantity": 1}

        response = self.client.post(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        data = response.json()

        self.assertFalse(data["success"])
        self.assertIn("out of stock", data["message"].lower())

    def test_add_to_cart_insufficient_stock(self):
        """Test adding more items than available stock."""
        url = reverse("orders:add_to_cart")
        payload = {
            "product_id": self.product.id,
            "quantity": 15,  # More than available stock (10)
        }

        response = self.client.post(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        data = response.json()

        self.assertFalse(data["success"])
        self.assertIn("available in stock", data["message"])

    def test_add_to_cart_invalid_quantity(self):
        """Test adding item with invalid quantity."""
        url = reverse("orders:add_to_cart")

        # Test negative quantity
        payload = {"product_id": self.product.id, "quantity": -1}
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Test zero quantity
        payload = {"product_id": self.product.id, "quantity": 0}
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Test excessive quantity
        payload = {"product_id": self.product.id, "quantity": 100}
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_add_existing_item_updates_quantity(self):
        """Test adding existing product updates quantity instead of creating duplicate."""
        url = reverse("orders:add_to_cart")
        payload = {"product_id": self.product.id, "quantity": 2}

        # First addition
        response1 = self.client.post(url, payload, format="json")
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        data1 = response1.json()
        self.assertEqual(data1["data"]["item"]["quantity"], 2)

        # Second addition (should update existing item)
        payload["quantity"] = 1
        response2 = self.client.post(url, payload, format="json")
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        data2 = response2.json()
        self.assertEqual(data2["data"]["item"]["quantity"], 3)  # 2 + 1

    def test_update_cart_item_quantity(self):
        """Test updating cart item quantity."""
        # First, add item to cart
        self.client.force_authenticate(user=self.user)
        cart = Cart.objects.create(user=self.user)
        cart_item = CartItem.objects.create(cart=cart, product=self.product, quantity=2, unit_price=self.product.price)

        # Update quantity
        url = reverse("orders:update_cart_item", kwargs={"item_id": cart_item.id})
        payload = {"quantity": 5}

        response = self.client.put(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["item"]["quantity"], 5)

    def test_remove_cart_item(self):
        """Test removing item from cart."""
        self.client.force_authenticate(user=self.user)
        cart = Cart.objects.create(user=self.user)
        cart_item = CartItem.objects.create(cart=cart, product=self.product, quantity=2, unit_price=self.product.price)

        url = reverse("orders:remove_cart_item", kwargs={"item_id": cart_item.id})

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertTrue(data["success"])
        self.assertFalse(CartItem.objects.filter(id=cart_item.id).exists())

    def test_clear_cart(self):
        """Test clearing entire cart."""
        self.client.force_authenticate(user=self.user)
        cart = Cart.objects.create(user=self.user)

        # Add multiple items
        CartItem.objects.create(cart=cart, product=self.product, quantity=2, unit_price=self.product.price)

        self.assertEqual(cart.items.count(), 1)

        url = reverse("orders:clear_cart")
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertTrue(data["success"])
        self.assertEqual(cart.items.count(), 0)

    def test_cart_item_access_control(self):
        """Test that users can only access their own cart items."""
        # Create another user and cart
        other_user = User.objects.create_user(username="otheruser", email="other@example.com", password="otherpass123")
        other_cart = Cart.objects.create(user=other_user)
        other_item = CartItem.objects.create(
            cart=other_cart, product=self.product, quantity=1, unit_price=self.product.price
        )

        # Try to access other user's cart item
        self.client.force_authenticate(user=self.user)
        url = reverse("orders:update_cart_item", kwargs={"item_id": other_item.id})
        payload = {"quantity": 5}

        response = self.client.put(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_session_persistence_for_guest(self):
        """Test that guest cart persists across requests using session."""
        # Add item to cart
        url = reverse("orders:add_to_cart")
        payload = {"product_id": self.product.id, "quantity": 2}

        response1 = self.client.post(url, payload, format="json")
        self.assertEqual(response1.status_code, status.HTTP_200_OK)

        # Get cart in second request (should persist)
        url = reverse("orders:get_cart")
        response2 = self.client.get(url)

        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        data = response2.json()

        self.assertEqual(data["data"]["item_count"], 2)
        self.assertEqual(len(data["data"]["items"]), 1)

    def test_session_id_returned_in_header_for_guest(self):
        """Test that X-Session-ID header is returned for guest users (Safari support)."""
        url = reverse("orders:get_cart")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Guest users should get session ID in response header
        self.assertIn("X-Session-ID", response)
        self.assertIsNotNone(response["X-Session-ID"])

    def test_session_id_not_returned_for_authenticated_users(self):
        """Test that X-Session-ID header is NOT returned for authenticated users."""
        self.client.force_authenticate(user=self.user)
        url = reverse("orders:get_cart")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Authenticated users should not get session ID (they use JWT)
        self.assertNotIn("X-Session-ID", response)

    def test_cart_persistence_with_header_session_id(self):
        """Test that cart persists when using X-Session-ID header (Safari compatibility)."""
        # First request: Create cart and get session ID
        url = reverse("orders:add_to_cart")
        payload = {"product_id": self.product.id, "quantity": 2}

        response1 = self.client.post(url, payload, format="json")
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        session_id = response1["X-Session-ID"]

        # Create a new client (simulating new browser context)
        new_client = APIClient()

        # Second request: Use session ID in header to access same cart
        url = reverse("orders:get_cart")
        response2 = new_client.get(url, HTTP_X_SESSION_ID=session_id)

        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        data = response2.json()

        # Should get the same cart with 2 items
        self.assertEqual(data["data"]["item_count"], 2)
        self.assertEqual(len(data["data"]["items"]), 1)

    def test_add_to_cart_with_session_id_header(self):
        """Test adding items to cart using X-Session-ID header."""
        # Get initial session ID
        url = reverse("orders:get_cart")
        response1 = self.client.get(url)
        session_id = response1["X-Session-ID"]

        # Create new client and add item using session header
        new_client = APIClient()
        url = reverse("orders:add_to_cart")
        payload = {"product_id": self.product.id, "quantity": 3}

        response2 = new_client.post(url, payload, format="json", HTTP_X_SESSION_ID=session_id)

        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        data = response2.json()

        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["item"]["quantity"], 3)
        self.assertEqual(data["data"]["cart_totals"]["item_count"], 3)

        # Verify session ID is returned in response
        self.assertEqual(response2["X-Session-ID"], session_id)

    def test_update_cart_item_with_session_id_header(self):
        """Test updating cart items using X-Session-ID header."""
        # Create cart with item
        url = reverse("orders:add_to_cart")
        payload = {"product_id": self.product.id, "quantity": 2}
        response1 = self.client.post(url, payload, format="json")
        session_id = response1["X-Session-ID"]
        cart_item_id = response1.json()["data"]["item"]["id"]

        # Update item using session header in new client
        new_client = APIClient()
        url = reverse("orders:update_cart_item", kwargs={"item_id": cart_item_id})
        payload = {"quantity": 5}

        response2 = new_client.put(url, payload, format="json", HTTP_X_SESSION_ID=session_id)

        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        data = response2.json()

        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["item"]["quantity"], 5)

    def test_remove_cart_item_with_session_id_header(self):
        """Test removing cart items using X-Session-ID header."""
        # Create cart with item
        url = reverse("orders:add_to_cart")
        payload = {"product_id": self.product.id, "quantity": 2}
        response1 = self.client.post(url, payload, format="json")
        session_id = response1["X-Session-ID"]
        cart_item_id = response1.json()["data"]["item"]["id"]

        # Remove item using session header in new client
        new_client = APIClient()
        url = reverse("orders:remove_cart_item", kwargs={"item_id": cart_item_id})

        response2 = new_client.delete(url, HTTP_X_SESSION_ID=session_id)

        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        data = response2.json()

        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["cart_totals"]["item_count"], 0)

    def test_clear_cart_with_session_id_header(self):
        """Test clearing cart using X-Session-ID header."""
        # Create cart with item
        url = reverse("orders:add_to_cart")
        payload = {"product_id": self.product.id, "quantity": 2}
        response1 = self.client.post(url, payload, format="json")
        session_id = response1["X-Session-ID"]

        # Clear cart using session header in new client
        new_client = APIClient()
        url = reverse("orders:clear_cart")

        response2 = new_client.delete(url, HTTP_X_SESSION_ID=session_id)

        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        data = response2.json()

        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["cart_totals"]["item_count"], 0)
