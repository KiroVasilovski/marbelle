import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../shared/components/shadcn/button';
import { useCart } from '../CartContext';
import type { CartItem as CartItemType } from '../types/cart';

interface CartItemProps {
    item: CartItemType;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
    const { t } = useTranslation();
    const { updateCartItem, removeCartItem } = useCart();
    const [isUpdating, setIsUpdating] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    const handleQuantityChange = async (newQuantity: number) => {
        if (newQuantity < 1 || newQuantity > 99) return;

        setIsUpdating(true);
        try {
            await updateCartItem(item.id, { quantity: newQuantity });
        } catch (error) {
            console.error('Failed to update quantity:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRemove = async () => {
        setIsRemoving(true);
        try {
            await removeCartItem(item.id);
        } catch (error) {
            console.error('Failed to remove item:', error);
        } finally {
            setIsRemoving(false);
        }
    };

    return (
        <div className="flex items-center space-x-4 py-4 border-b">
            <div className="flex-shrink-0 w-20 h-20">
                {item.product.image ? (
                    <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-500">No image</span>
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">{item.product.name}</h3>
                <p className="text-sm text-gray-500">{t('cart.item.price')}: ${item.unit_price}</p>
                <p className="text-xs text-gray-400">SKU: {item.product.sku}</p>
                {!item.product.in_stock && (
                    <p className="text-xs text-red-600">{t('cart.item.outOfStock')}</p>
                )}
            </div>

            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(item.quantity - 1)}
                    disabled={isUpdating || item.quantity <= 1}
                    className="w-8 h-8 p-0"
                >
                    <Minus size={12} />
                </Button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(item.quantity + 1)}
                    disabled={isUpdating || item.quantity >= 99}
                    className="w-8 h-8 p-0"
                >
                    <Plus size={12} />
                </Button>
            </div>

            <div className="text-right">
                <p className="text-sm font-medium">${item.subtotal}</p>
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={isRemoving}
                className="text-red-600 hover:text-red-800 p-2"
            >
                <Trash2 size={16} />
            </Button>
        </div>
    );
};