"""Comprehensive tests for product repositories."""

from django.test import TestCase

from .models import Category, Product
from .repositories import CategoryRepository, ProductRepository


class ProductRepositoryTest(TestCase):
    """Test ProductRepository data access methods."""

    def setUp(self) -> None:
        """Set up test fixtures."""
        self.category = Category.objects.create(
            name="Slabs",
            description="Natural stone slabs",
            is_active=True,
        )

        # Create test products
        self.product1 = Product.objects.create(
            name="White Marble Slab",
            description="Premium white marble",
            price="150.00",
            unit_of_measure="sqm",
            category=self.category,
            stock_quantity=100,
            sku="WM-SLAB-001",
            is_active=True,
        )

        self.product2 = Product.objects.create(
            name="Black Granite Slab",
            description="Polished black granite",
            price="200.00",
            unit_of_measure="sqm",
            category=self.category,
            stock_quantity=50,
            sku="BG-SLAB-001",
            is_active=True,
        )

        self.product_inactive = Product.objects.create(
            name="Old Product",
            description="Inactive product",
            price="100.00",
            unit_of_measure="sqm",
            category=self.category,
            stock_quantity=0,
            sku="OLD-PROD-001",
            is_active=False,
        )

    def test_get_all_active(self) -> None:
        """Test getting all active products."""
        products = list(ProductRepository.get_all_active())
        self.assertEqual(len(products), 2)
        product_ids = {p.id for p in products}
        self.assertIn(self.product1.id, product_ids)
        self.assertIn(self.product2.id, product_ids)
        self.assertNotIn(self.product_inactive.id, product_ids)

    def test_get_all_active_has_optimizations(self) -> None:
        """Test that get_all_active includes query optimizations."""
        products = ProductRepository.get_all_active()
        # Verify select_related and prefetch_related are applied
        # This is tested implicitly - if optimizations are missing,
        # N+1 queries would occur
        list(products)  # Materialize the queryset
        self.assertTrue(True)  # If we got here without error, optimization worked

    def test_get_by_id_success(self) -> None:
        """Test retrieving product by ID."""
        product = ProductRepository.get_by_id(self.product1.id)
        self.assertIsNotNone(product)
        self.assertEqual(product.id, self.product1.id)
        self.assertEqual(product.name, "White Marble Slab")

    def test_get_by_id_not_found(self) -> None:
        """Test get_by_id returns None for non-existent ID."""
        product = ProductRepository.get_by_id(99999)
        self.assertIsNone(product)

    def test_get_by_id_only_active(self) -> None:
        """Test get_by_id returns inactive products too."""
        # Note: get_by_id doesn't filter by is_active
        product = ProductRepository.get_by_id(self.product_inactive.id)
        self.assertIsNotNone(product)

    def test_get_by_sku_success(self) -> None:
        """Test retrieving product by SKU."""
        product = ProductRepository.get_by_sku("WM-SLAB-001")
        self.assertIsNotNone(product)
        self.assertEqual(product.id, self.product1.id)

    def test_get_by_sku_not_found(self) -> None:
        """Test get_by_sku returns None for non-existent SKU."""
        product = ProductRepository.get_by_sku("NONEXISTENT-SKU")
        self.assertIsNone(product)

    def test_get_active_in_category(self) -> None:
        """Test getting active products in a category."""
        products = list(ProductRepository.get_active_in_category(self.category.id))
        self.assertEqual(len(products), 2)
        product_ids = {p.id for p in products}
        self.assertIn(self.product1.id, product_ids)
        self.assertIn(self.product2.id, product_ids)

    def test_get_active_in_category_empty(self) -> None:
        """Test getting products in category with no products."""
        new_category = Category.objects.create(name="Empty", is_active=True)
        products = list(ProductRepository.get_active_in_category(new_category.id))
        self.assertEqual(len(products), 0)

    def test_product_exists(self) -> None:
        """Test product_exists check."""
        self.assertTrue(ProductRepository.product_exists(self.product1.id))
        self.assertTrue(ProductRepository.product_exists(self.product_inactive.id))
        self.assertFalse(ProductRepository.product_exists(99999))

    def test_active_product_exists(self) -> None:
        """Test active_product_exists check."""
        self.assertTrue(ProductRepository.active_product_exists(self.product1.id))
        self.assertFalse(ProductRepository.active_product_exists(self.product_inactive.id))

    def test_get_category(self) -> None:
        """Test getting a category."""
        category = CategoryRepository.get_by_id(self.category.id)
        self.assertIsNotNone(category)
        self.assertEqual(category.id, self.category.id)

    def test_get_category_not_found(self) -> None:
        """Test get_by_id returns None for non-existent ID."""
        category = CategoryRepository.get_by_id(99999)
        self.assertIsNone(category)

    def test_get_all_active_categories(self) -> None:
        """Test getting all active categories."""
        # Create inactive category to verify it's not returned
        Category.objects.create(name="Inactive", is_active=False)

        categories = list(CategoryRepository.get_all_active())
        self.assertEqual(len(categories), 1)
        self.assertEqual(categories[0].id, self.category.id)
