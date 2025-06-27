from django.contrib import admin
from django.db.models.query import QuerySet
from django.http import HttpRequest
from django.utils.html import format_html

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    """
    Inline admin for OrderItem to manage order items within Order admin.
    """

    model = OrderItem
    extra = 0
    fields = ("product", "quantity", "unit_price", "subtotal_display")
    readonly_fields = ("subtotal_display",)

    def subtotal_display(self, obj: OrderItem) -> str:
        """Display calculated subtotal for the order item."""
        if obj.id:
            return f"${obj.subtotal}"
        return "-"

    subtotal_display.short_description = "Subtotal"


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """
    Admin configuration for Order model with inline order items.
    """

    list_display = ("id", "user_display", "status", "total_amount", "item_count_display", "created_at")
    list_filter = ("status", "created_at", "updated_at")
    search_fields = ("user__username", "user__email", "user__first_name", "user__last_name", "user__company_name")
    ordering = ("-created_at",)
    readonly_fields = ("total_amount", "created_at", "updated_at", "calculated_total_display")
    inlines = [OrderItemInline]

    fieldsets = (
        ("Order Information", {"fields": ("user", "status")}),
        (
            "Financial Information",
            {
                "fields": ("total_amount", "calculated_total_display"),
                "description": "Total amount is automatically calculated from order items",
            },
        ),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    def user_display(self, obj: Order) -> str:
        """Display user with company name if available."""
        user = obj.user
        if user.company_name:
            return f"{user.get_full_name()} ({user.company_name})"
        return user.get_full_name() or user.username

    user_display.short_description = "Customer"

    def item_count_display(self, obj: Order) -> int:
        """Display total number of items in the order."""
        return obj.item_count

    item_count_display.short_description = "Items"

    def calculated_total_display(self, obj: Order) -> str:
        """Display calculated total for verification."""
        if obj.id:
            calculated = obj.calculate_total()
            stored = obj.total_amount
            if calculated == stored:
                return format_html('<span style="color: green;">${}</span>', calculated)
            else:
                return format_html('<span style="color: red;">${} (stored: ${})</span>', calculated, stored)
        return "-"

    calculated_total_display.short_description = "Calculated Total"

    actions = ["recalculate_totals"]

    def recalculate_totals(self, request: HttpRequest, queryset: QuerySet) -> None:
        """Admin action to recalculate order totals."""
        count = 0
        for order in queryset:
            order.update_total()
            count += 1
        self.message_user(request, f"Recalculated totals for {count} orders.")

    recalculate_totals.short_description = "Recalculate order totals"


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    """
    Admin configuration for OrderItem model (standalone view).
    """

    list_display = ("order", "product", "quantity", "unit_price", "subtotal_display", "created_at")
    list_filter = ("created_at", "product__category", "order__status")
    search_fields = ("order__user__username", "product__name", "product__sku")
    ordering = ("-created_at",)

    fieldsets = (
        ("Order Item Information", {"fields": ("order", "product", "quantity", "unit_price")}),
        ("Calculated Fields", {"fields": ("subtotal_display",), "classes": ("collapse",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    readonly_fields = ("subtotal_display", "created_at", "updated_at")

    def subtotal_display(self, obj: OrderItem) -> str:
        """Display calculated subtotal for the order item."""
        if obj.id:
            return f"${obj.subtotal}"
        return "-"

    subtotal_display.short_description = "Subtotal"
