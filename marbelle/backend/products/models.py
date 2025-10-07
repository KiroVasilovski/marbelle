from decimal import Decimal
from typing import Any

from cloudinary.models import CloudinaryField
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models


class Category(models.Model):
    """
    Product category model for organizing natural stone products.

    Supports flat categorization.
    Examples: Slabs, Tiles, Mosaics, Decorative Items, Tables, Accessories
    """

    name = models.CharField(
        max_length=100, unique=True, help_text="Category name (e.g., Slabs, Tiles, Decorative Items)"
    )
    description = models.TextField(blank=True, null=True, help_text="Optional description of the category")
    is_active = models.BooleanField(default=True, help_text="Whether this category is active and visible")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        db_table = "categories"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Product(models.Model):
    """
    Product model for natural stone products.

    Supports all types of products from construction materials (slabs, tiles)
    to decorative items (tables, vases) accessible to all customer types.
    """

    UNIT_CHOICES = [
        ("sqm", "Square Meters"),
        ("piece", "Piece"),
        ("slab", "Slab"),
        ("linear_m", "Linear Meters"),
    ]

    name = models.CharField(max_length=200, help_text="Product name")
    description = models.TextField(help_text="Detailed product description")
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="Product price (must be positive)",
    )
    unit_of_measure = models.CharField(
        max_length=20, choices=UNIT_CHOICES, help_text="Unit of measurement for pricing and quantity"
    )
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="products", help_text="Product category"
    )
    stock_quantity = models.PositiveIntegerField(default=0, help_text="Current stock quantity")
    is_active = models.BooleanField(default=True, help_text="Whether this product is active and visible")
    sku = models.CharField(
        max_length=50,
        unique=True,
        help_text="Stock Keeping Unit (unique identifier for product)",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Product"
        verbose_name_plural = "Products"
        db_table = "products"
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.category.name})"

    @property
    def in_stock(self) -> bool:
        """Check if product has stock available."""
        return self.stock_quantity > 0


class ProductImage(models.Model):
    """
    Product image model for storing multiple images per product.

    Supports primary image designation and display ordering for galleries.
    Uses Cloudinary for image storage in production, local storage in development.
    """

    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="images", help_text="Product this image belongs to"
    )

    # Use CloudinaryField if Cloudinary is configured, otherwise use ImageField
    if getattr(settings, "USE_CLOUDINARY", False):
        image = CloudinaryField(
            "image",
            folder=lambda instance: f"marbelle/products/{instance.product.sku}",
            transformation={
                "quality": "auto:best",
                "fetch_format": "auto",
            },
            help_text="Product image file (stored on Cloudinary)",
        )
    else:
        image = models.ImageField(
            upload_to=lambda instance, filename: f"products/{instance.product.sku}/{filename}",
            help_text="Product image file (stored locally)",
        )

    alt_text = models.CharField(max_length=200, blank=True, null=True, help_text="Alternative text for accessibility")
    is_primary = models.BooleanField(default=False, help_text="Whether this is the primary/main image for the product")
    display_order = models.PositiveIntegerField(default=0, help_text="Order for displaying images (0 = first)")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Product Image"
        verbose_name_plural = "Product Images"
        db_table = "product_images"
        ordering = ["product", "display_order", "created_at"]
        unique_together = [["product", "display_order"]]

    def __str__(self) -> str:
        primary_text = " (Primary)" if self.is_primary else ""
        return f"{self.product.name} - Image {self.display_order}{primary_text}"

    def clean(self):
        """
        Validate that only one primary image exists per product.
        """
        if self.is_primary and self.product and self.product.pk:
            existing_primary = ProductImage.objects.filter(product=self.product, is_primary=True).exclude(pk=self.pk)
            if existing_primary.exists():
                raise ValidationError("Only one primary image is allowed per product.")

    def save(self, *args: Any, **kwargs: Any) -> None:
        self.full_clean()
        super().save(*args, **kwargs)
