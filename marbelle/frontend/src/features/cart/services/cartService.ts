import { apiClient } from '../../../shared/api/ApiClient';
import { API_ENDPOINTS } from '../../../shared/api/apiConfig';
import type { Cart, AddToCartRequest, UpdateCartItemRequest, CartItem, CartTotals } from '../types/cart';

interface AddToCartData {
    item: CartItem;
    cart_totals: CartTotals;
}

class CartService {
    async getCart(): Promise<Cart> {
        const cartData = await apiClient.get<Cart>(API_ENDPOINTS.CART.GET);
        return cartData;
    }

    async addToCart(request: AddToCartRequest): Promise<AddToCartData> {
        return await apiClient.post<AddToCartData>(API_ENDPOINTS.CART.ADD_ITEM, request);
    }

    async updateCartItem(itemId: number, request: UpdateCartItemRequest): Promise<void> {
        const endpoint = API_ENDPOINTS.CART.UPDATE_ITEM.replace(':id', itemId.toString());
        await apiClient.put(endpoint, request);
    }

    async removeCartItem(itemId: number): Promise<void> {
        const endpoint = API_ENDPOINTS.CART.REMOVE_ITEM.replace(':id', itemId.toString());
        await apiClient.delete(endpoint);
    }

    async clearCart(): Promise<void> {
        await apiClient.delete(API_ENDPOINTS.CART.CLEAR);
    }
}

export const cartService = new CartService();
