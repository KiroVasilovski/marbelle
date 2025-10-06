from django.urls import path

from .views.cart import (
    add_to_cart,
    clear_cart,
    get_cart,
    remove_cart_item,
    update_cart_item,
)

app_name = "orders"

urlpatterns = [
    # Cart endpoints
    path("cart/", get_cart, name="get_cart"),
    path("cart/items/", add_to_cart, name="add_to_cart"),
    path("cart/items/<int:item_id>/", update_cart_item, name="update_cart_item"),
    path("cart/items/<int:item_id>/remove/", remove_cart_item, name="remove_cart_item"),
    path("cart/clear/", clear_cart, name="clear_cart"),
]
