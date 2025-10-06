from django.contrib import admin
from django.db.models.query import QuerySet
from django.http import HttpRequest
from django.utils.html import format_html

from .models import Cart, CartItem, Order, OrderItem


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


class CartItemInline(admin.TabularInline):
    """
    Inline admin for CartItem to manage cart items within Cart admin.
    """

    model = CartItem
    extra = 0
    fields = ("product", "quantity", "unit_price", "subtotal_display")
    readonly_fields = ("subtotal_display",)

    def subtotal_display(self, obj: CartItem) -> str:
        """Display calculated subtotal for the cart item."""
        if obj.id:
            return f"${obj.subtotal}"
        return "-"

    subtotal_display.short_description = "Subtotal"


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    """
    Admin configuration for Cart model with inline cart items.
    """

    list_display = ("id", "owner_display", "item_count_display", "subtotal_display", "total_display", "updated_at")
    list_filter = ("created_at", "updated_at")
    search_fields = ("user__username", "user__email", "user__first_name", "user__last_name", "session_key")
    ordering = ("-updated_at",)
    readonly_fields = ("created_at", "updated_at", "subtotal_display", "tax_amount_display", "total_display")
    inlines = [CartItemInline]

    fieldsets = (
        ("Cart Owner", {"fields": ("user", "session_key")}),
        (
            "Cart Totals",
            {
                "fields": ("subtotal_display", "tax_amount_display", "total_display"),
                "description": "Totals are automatically calculated from cart items",
            },
        ),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    def owner_display(self, obj: Cart) -> str:
        """Display cart owner (user or guest session)."""
        if obj.user:
            if obj.user.company_name:
                return f"{obj.user.get_full_name()} ({obj.user.company_name})"
            return obj.user.get_full_name() or obj.user.username
        return f"Guest (session: {obj.session_key[:8]}...)"

    owner_display.short_description = "Owner"

    def item_count_display(self, obj: Cart) -> int:
        """Display total number of items in the cart."""
        return obj.item_count

    item_count_display.short_description = "Items"

    def subtotal_display(self, obj: Cart) -> str:
        """Display cart subtotal."""
        if obj.id:
            return f"${obj.subtotal}"
        return "-"

    subtotal_display.short_description = "Subtotal"

    def tax_amount_display(self, obj: Cart) -> str:
        """Display cart tax amount."""
        if obj.id:
            return f"${obj.tax_amount}"
        return "-"

    tax_amount_display.short_description = "Tax (9%)"

    def total_display(self, obj: Cart) -> str:
        """Display cart total."""
        if obj.id:
            return f"${obj.total}"
        return "-"

    total_display.short_description = "Total"

    actions = ["clear_carts"]

    def clear_carts(self, request: HttpRequest, queryset: QuerySet) -> None:
        """Admin action to clear selected carts."""
        count = 0
        for cart in queryset:
            cart.clear()
            count += 1
        self.message_user(request, f"Cleared {count} carts.")

    clear_carts.short_description = "Clear selected carts"


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    """
    Admin configuration for CartItem model (standalone view).
    """

    list_display = ("cart_owner_display", "product", "quantity", "unit_price", "subtotal_display", "created_at")
    list_filter = ("created_at", "product__category")
    search_fields = ("cart__user__username", "cart__session_key", "product__name", "product__sku")
    ordering = ("-created_at",)

    fieldsets = (
        ("Cart Item Information", {"fields": ("cart", "product", "quantity", "unit_price")}),
        ("Calculated Fields", {"fields": ("subtotal_display",), "classes": ("collapse",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    readonly_fields = ("subtotal_display", "created_at", "updated_at")

    def cart_owner_display(self, obj: CartItem) -> str:
        """Display cart owner for the item."""
        cart = obj.cart
        if cart.user:
            return cart.user.get_full_name() or cart.user.username
        return f"Guest ({cart.session_key[:8]}...)"

    cart_owner_display.short_description = "Cart Owner"

    def subtotal_display(self, obj: CartItem) -> str:
        """Display calculated subtotal for the cart item."""
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
