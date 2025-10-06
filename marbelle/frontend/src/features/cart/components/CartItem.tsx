import React, { useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Minus, Plus, X } from 'lucide-react';
import { Button } from '../../../shared/components/shadcn/button';
import { useCart } from '../CartContext';
import { ProductImage } from './ProductImage';
import { getProductImageUrl } from '../utils/imageUtils';
import type { CartItem as CartItemType } from '../types/cart';
import { toast } from 'sonner';

interface CartItemProps {
    item: CartItemType;
}

const CartItemComponent: React.FC<CartItemProps> = ({ item }) => {
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

            const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart';

            toast.error('Unable to Add Item', {
                description: errorMessage,
            });
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
        <div className="relative flex items-stretch space-x-3 md:space-x-4 border border-gray-200 rounded p-2 xs:p-4">
            <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={isRemoving}
                className="absolute top-3 -right-4 ml-2 hover:text-red-800 h-auto w-auto"
            >
                <X size={16} />
            </Button>

            <Link to={`/products/${item.product.id}`} className="flex-shrink-0">
                <ProductImage
                    imageUrl={getProductImageUrl(item.product.image)}
                    productName={item.product.name}
                    size="lg"
                />
            </Link>

            <div className="flex-1 min-w-0 flex xs:py-4 flex-col justify-between">
                <div>
                    <Link to={`/products/${item.product.id}`} className="hover:underline">
                        <h3 className="text-sm font-medium text-gray-900 truncate pr-2">{item.product.name}</h3>
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                        {t('cart.item.price')}: ${item.unit_price}
                    </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.quantity - 1)}
                            disabled={isUpdating || item.quantity == 1}
                            className="w-5 h-5 p-0 border-none rounded-full bg-gray-200"
                        >
                            <Minus size={12} />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.quantity + 1)}
                            disabled={isUpdating || item.quantity >= 99}
                            className="w-5 h-5 p-0 border-none rounded-full bg-gray-200"
                        >
                            <Plus size={12} />
                        </Button>
                    </div>
                    <p className="text-sm font-medium ml-4">${item.subtotal}</p>
                </div>
                {!item.product.in_stock && <p className="text-xs text-red-600 mt-1">{t('cart.item.outOfStock')}</p>}
            </div>
        </div>
    );
};

// Memoize component to prevent unnecessary rerenders
// Since we preserve unchanged item references in CartContext,
// we can use simple reference equality check
export const CartItem = memo(CartItemComponent);
