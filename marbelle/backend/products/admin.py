from django.contrib import admin

from .models import Category, Product, ProductImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """
    Admin configuration for Category model.
    """

    list_display = ("name", "is_active", "product_count", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("name", "description")
    ordering = ("name",)

    def product_count(self, obj: Category) -> int:
        """Display number of products in this category."""
        return obj.products.count()

    product_count.short_description = "Products"


class ProductImageInline(admin.TabularInline):
    """
    Inline admin for ProductImage to manage images within Product admin.
    """

    model = ProductImage
    extra = 1
    fields = ("image", "alt_text", "is_primary", "display_order")
    ordering = ("display_order",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """
    Admin configuration for Product model with inline image management.
    """

    list_display = (
        "name",
        "description",
        "category",
        "price",
        "unit_of_measure",
        "stock_quantity",
        "is_active",
        "created_at",
    )
    list_filter = ("category", "unit_of_measure", "is_active", "created_at")
    search_fields = ("name", "description", "sku")
    ordering = ("name",)
    inlines = [ProductImageInline]

    fieldsets = (
        ("Product Information", {"fields": ("name", "description", "category", "sku")}),
        ("Pricing & Inventory", {"fields": ("price", "unit_of_measure", "stock_quantity", "is_active")}),
    )


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    """
    Admin configuration for ProductImage model (standalone view).
    """

    list_display = ("product", "is_primary", "display_order", "created_at")
    list_filter = ("is_primary", "created_at", "product__category")
    search_fields = ("product__name", "alt_text")
    ordering = ("product", "display_order")

    fieldsets = (
        ("Image Information", {"fields": ("product", "image", "alt_text")}),
        ("Display Settings", {"fields": ("is_primary", "display_order")}),
    )
