import { apiClient } from '../../../shared/api/ApiClient';
import type {
    Cart,
    AddToCartRequest,
    UpdateCartItemRequest,
    CartApiResponse,
} from '../types/cart';

class CartService {
    async getCart(): Promise<Cart> {
        const cartData = await apiClient.get<Cart>('/cart/');
        return cartData;
    }

    async addToCart(request: AddToCartRequest): Promise<void> {
        await apiClient.post('/cart/items/', request);
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