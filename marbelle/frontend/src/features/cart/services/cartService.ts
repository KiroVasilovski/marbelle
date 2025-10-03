import { apiClient } from '../../../shared/api/ApiClient';
import type {
    Cart,
    AddToCartRequest,
    UpdateCartItemRequest,
    CartItem,
    CartTotals,
} from '../types/cart';

interface AddToCartData {
    item: CartItem;
    cart_totals: CartTotals;
}

class CartService {
    async getCart(): Promise<Cart> {
        const cartData = await apiClient.get<Cart>('/cart/');
        return cartData;
    }

    async addToCart(request: AddToCartRequest): Promise<AddToCartData> {
        // apiClient.post already unwraps response.data.data, so we get the data object directly
        const data = await apiClient.post<AddToCartData>('/cart/items/', request);
        return data;
    }

    async updateCartItem(itemId: number, request: UpdateCartItemRequest): Promise<void> {
        await apiClient.put(`/cart/items/${itemId}/`, request);
    }

    async removeCartItem(itemId: number): Promise<void> {
        await apiClient.delete(`/cart/items/${itemId}/remove/`);
    }

    async clearCart(): Promise<void> {
        await apiClient.delete('/cart/clear/');
    }
}

export const cartService = new CartService();