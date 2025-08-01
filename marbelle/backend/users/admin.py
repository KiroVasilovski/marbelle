from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Address, EmailChangeToken, User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Admin configuration for User model.

    Extends Django's UserAdmin to include custom fields for business customers.
    """

    # Fields to display in the admin list view
    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "company_name",
        "is_business_customer",
        "is_staff",
        "date_joined",
    )

    # Fields that can be used to filter users in admin
    list_filter = ("is_staff", "is_superuser", "is_active", "date_joined", "last_login")

    # Add search functionality
    search_fields = ("username", "first_name", "last_name", "email", "company_name")

    # Add custom fields to the fieldsets for the user detail/edit view
    fieldsets = UserAdmin.fieldsets + (
        (
            "Business Information",
            {"fields": ("company_name", "phone"), "description": "Additional information for business customers"},
        ),
    )

    # Add custom fields to the add user form
    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "Business Information",
            {
                "fields": ("company_name", "phone"),
            },
        ),
    )

    def is_business_customer(self, obj: User) -> bool:
        """Display business customer status in admin list."""
        return obj.is_business_customer

    is_business_customer.boolean = True
    is_business_customer.short_description = "Business Customer"


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    """
    Admin configuration for Address model.
    """

    list_display = (
        "label",
        "user",
        "first_name",
        "last_name",
        "city",
        "state",
        "country",
        "is_primary",
        "created_at",
    )

    list_filter = ("is_primary", "country", "state", "created_at")

    search_fields = (
        "user__username",
        "user__email",
        "label",
        "first_name",
        "last_name",
        "company",
        "city",
        "address_line_1",
    )

    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        (
            "Address Information",
            {
                "fields": (
                    "user",
                    "label",
                    "is_primary",
                )
            },
        ),
        (
            "Contact Details",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "company",
                    "phone",
                )
            },
        ),
        (
            "Address",
            {
                "fields": (
                    "address_line_1",
                    "address_line_2",
                    "city",
                    "state",
                    "postal_code",
                    "country",
                )
            },
        ),
        (
            "Timestamps",
            {
                "fields": ("created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )


@admin.register(EmailChangeToken)
class EmailChangeTokenAdmin(admin.ModelAdmin):
    """
    Admin configuration for EmailChangeToken model.
    """

    list_display = (
        "user",
        "new_email",
        "is_used",
        "is_expired",
        "created_at",
        "expires_at",
    )

    list_filter = ("is_used", "created_at", "expires_at")

    search_fields = (
        "user__username",
        "user__email",
        "new_email",
        "token",
    )

    readonly_fields = ("token", "created_at", "expires_at", "is_expired")

    fieldsets = (
        (
            "Token Information",
            {
                "fields": (
                    "user",
                    "new_email",
                    "token",
                    "is_used",
                )
            },
        ),
        (
            "Timestamps",
            {
                "fields": ("created_at", "expires_at"),
                "classes": ("collapse",),
            },
        ),
    )

    def is_expired(self, obj: EmailChangeToken) -> bool:
        """Display expiration status in admin list."""
        return obj.is_expired

    is_expired.boolean = True
    is_expired.short_description = "Expired"
