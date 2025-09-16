import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../shared/components/shadcn/button';
import { useCart } from '../CartContext';

interface AddToCartButtonProps {
    productId: number;
    quantity?: number;
    disabled?: boolean;
    className?: string;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
    productId,
    quantity = 1,
    disabled = false,
    className,
}) => {
    const { t } = useTranslation();
    const { addToCart } = useCart();
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = async () => {
        setIsAdding(true);
        try {
            await addToCart({ product_id: productId, quantity });
        } catch (error) {
            console.error('Failed to add to cart:', error);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <Button
            onClick={handleAddToCart}
            disabled={disabled || isAdding}
            className={className}
        >
            {isAdding ? t('cart.actions.addingToCart') : t('cart.actions.addToCart')}
        </Button>
    );
};