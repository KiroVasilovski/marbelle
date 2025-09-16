import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { cartService } from './services/cartService';
import type { Cart, AddToCartRequest, UpdateCartItemRequest } from './types/cart';

interface CartContextType {
    cart: Cart | null;
    isLoading: boolean;
    error: string | null;
    addToCart: (request: AddToCartRequest) => Promise<void>;
    updateCartItem: (itemId: number, request: UpdateCartItemRequest) => Promise<void>;
    removeCartItem: (itemId: number) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [cart, setCart] = useState<Cart | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refreshCart = async (): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            const cartData = await cartService.getCart();
            setCart(cartData);
        } catch (error) {
            console.error('Failed to load cart:', error);
            setError(error instanceof Error ? error.message : 'Failed to load cart');
        } finally {
            setIsLoading(false);
        }
    };

    const addToCart = async (request: AddToCartRequest): Promise<void> => {
        setError(null);
        try {
            await cartService.addToCart(request);
            await refreshCart();
        } catch (error) {
            console.error('Failed to add item to cart:', error);
            setError(error instanceof Error ? error.message : 'Failed to add item to cart');
            throw error;
        }
    };

    const updateCartItem = async (itemId: number, request: UpdateCartItemRequest): Promise<void> => {
        setError(null);
        try {
            await cartService.updateCartItem(itemId, request);
            await refreshCart();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to update cart item');
            throw error;
        }
    };

    const removeCartItem = async (itemId: number): Promise<void> => {
        setError(null);
        try {
            await cartService.removeCartItem(itemId);
            await refreshCart();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to remove cart item');
            throw error;
        }
    };

    const clearCart = async (): Promise<void> => {
        setError(null);
        try {
            await cartService.clearCart();
            await refreshCart();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to clear cart');
            throw error;
        }
    };

    useEffect(() => {
        refreshCart();
    }, []);

    const value: CartContextType = {
        cart,
        isLoading,
        error,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
        refreshCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
