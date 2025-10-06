import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { toast } from 'sonner';
import { cartService } from './services/cartService';
import type { Cart, AddToCartRequest, UpdateCartItemRequest, CartItem } from './types/cart';

interface CartContextType {
    cart: Cart | null;
    isLoading: boolean;
    error: string | null;
    recentlyAddedItem: CartItem | null;
    showCartPreview: boolean;
    addToCart: (request: AddToCartRequest) => Promise<void>;
    updateCartItem: (itemId: number, request: UpdateCartItemRequest) => Promise<void>;
    removeCartItem: (itemId: number) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
    closeCartPreview: () => void;
    clearRecentlyAddedItem: () => void;
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
    const [recentlyAddedItem, setRecentlyAddedItem] = useState<CartItem | null>(null);
    const [showCartPreview, setShowCartPreview] = useState(false);

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
            // Wait for backend to add the item and return the updated data
            const data = await cartService.addToCart(request);

            // Set recently added item - this will trigger the preview
            setRecentlyAddedItem(data.item);

            // Now refresh cart to get the complete updated state
            await refreshCart();
        } catch (error) {
            console.error('Failed to add item to cart:', error);

            // Extract error message
            const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart';

            // Show error toast for any add-to-cart failure
            toast.error('Unable to Add Item', {
                description: errorMessage,
            });

            // Refresh cart to ensure UI is in sync with backend
            await refreshCart();
            throw error;
        }
    };

    const updateCartItem = async (itemId: number, request: UpdateCartItemRequest): Promise<void> => {
        setError(null);

        // Store previous cart for rollback
        const previousCart = cart;

        // Optimistic update - update local state immediately
        if (cart) {
            const updatedItems = cart.items.map((item) => {
                // Only create new object for the changed item, keep others as-is
                if (item.id === itemId) {
                    const newSubtotal = (parseFloat(item.unit_price) * request.quantity).toFixed(2);
                    return { ...item, quantity: request.quantity, subtotal: newSubtotal };
                }
                // Return same reference for unchanged items (prevents rerender)
                return item;
            });

            const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
            const newSubtotal = updatedItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0).toFixed(2);
            const newTaxAmount = (parseFloat(newSubtotal) * 0.09).toFixed(2);
            const newTotal = (parseFloat(newSubtotal) + parseFloat(newTaxAmount)).toFixed(2);

            setCart({
                ...cart,
                items: updatedItems,
                item_count: newItemCount,
                subtotal: newSubtotal,
                tax_amount: newTaxAmount,
                total: newTotal,
            });
        }

        try {
            // Update backend in background
            await cartService.updateCartItem(itemId, request);
            // Don't refresh - we already have the correct optimistic state
            // Only refresh if there's an error (handled in catch block)
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to update cart item');
            // Rollback: restore previous cart state and refresh from backend
            if (previousCart) {
                setCart(previousCart);
            }
            await refreshCart();
            throw error;
        }
    };

    const removeCartItem = async (itemId: number): Promise<void> => {
        setError(null);

        // Optimistic update - remove from local state immediately
        const previousCart = cart;
        if (cart) {
            const updatedItems = cart.items.filter((item) => item.id !== itemId);

            const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
            const newSubtotal = updatedItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0).toFixed(2);
            const newTaxAmount = (parseFloat(newSubtotal) * 0.09).toFixed(2);
            const newTotal = (parseFloat(newSubtotal) + parseFloat(newTaxAmount)).toFixed(2);

            setCart({
                ...cart,
                items: updatedItems,
                item_count: newItemCount,
                subtotal: newSubtotal,
                tax_amount: newTaxAmount,
                total: newTotal,
            });
        }

        try {
            // Remove from backend in background
            await cartService.removeCartItem(itemId);
            // Don't refresh - we already have the correct optimistic state
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to remove cart item');
            // Rollback: restore previous state and refresh from backend
            if (previousCart) {
                setCart(previousCart);
            }
            await refreshCart();
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

    const closeCartPreview = () => {
        setShowCartPreview(false);
    };

    const clearRecentlyAddedItem = () => {
        setRecentlyAddedItem(null);
    };

    // Effect to trigger animation when item is added
    useEffect(() => {
        if (recentlyAddedItem) {
            // Use requestAnimationFrame to ensure DOM has updated
            requestAnimationFrame(() => {
                setShowCartPreview(true);
            });
        }
    }, [recentlyAddedItem]);

    // Effect to load cart on mount
    useEffect(() => {
        refreshCart();
    }, []);

    const value: CartContextType = {
        cart,
        isLoading,
        error,
        recentlyAddedItem,
        showCartPreview,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
        refreshCart,
        closeCartPreview,
        clearRecentlyAddedItem,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
