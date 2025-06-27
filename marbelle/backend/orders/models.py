from decimal import Decimal
from typing import Any

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Order(models.Model):
    """
    Order model for tracking customer purchases.

    Supports order lifecycle from pending to delivered/cancelled.
    Total amount is stored for efficient database operations but can be recalculated.
    """

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
        ("refunded", "Refunded"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders",
        help_text="Customer who placed the order",
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending", help_text="Current order status"
    )
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
        help_text="Total order amount (calculated from order items)",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Order"
        verbose_name_plural = "Orders"
        db_table = "orders"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Order #{self.id} - {self.user.get_full_name() or self.user.username} - ${self.total_amount}"

    def calculate_total(self):
        """
        Calculate and return the total amount from all order items.

        Returns:
            Decimal: Total amount calculated from order items
        """
        total = Decimal("0.00")
        for item in self.items.all():
            total += item.quantity * item.unit_price
        return total

    def update_total(self):
        """
        Recalculate and save the total amount from order items.
        """
        self.total_amount = self.calculate_total()
        self.save(update_fields=["total_amount", "updated_at"])

    @property
    def item_count(self):
        """Get total number of items in the order."""
        return sum(item.quantity for item in self.items.all())


class OrderItem(models.Model):
    """
    Order item model for individual line items within an order.

    Captures product details at time of purchase to preserve historical data
    even if product prices change later.
    """

    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="items", help_text="Order this item belongs to"
    )
    product = models.ForeignKey(
        "products.Product", on_delete=models.PROTECT, related_name="order_items", help_text="Product being ordered"
    )
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)], help_text="Quantity ordered (minimum 1)")
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="Price per unit at time of order",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Order Item"
        verbose_name_plural = "Order Items"
        db_table = "order_items"
        ordering = ["created_at"]
        unique_together = [["order", "product"]]

    def __str__(self) -> str:
        return f"{self.quantity}x {self.product.name} @ ${self.unit_price}"

    @property
    def subtotal(self):
        """Calculate the subtotal for this order item."""
        return self.quantity * self.unit_price

    def save(self, *args: Any, **kwargs: Any) -> None:
        """
        Override save to automatically set unit_price from product if not provided
        and update order total after saving.
        """
        if not self.unit_price:
            self.unit_price = self.product.price

        super().save(*args, **kwargs)

        # Update the order total after saving the item
        self.order.update_total()
