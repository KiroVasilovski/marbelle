import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, Loader2 } from 'lucide-react';
import { Button } from '../../../shared/components/shadcn/button';
import { useCart } from '../CartContext';

interface AddToCartButtonProps {
    productId: number;
    quantity?: number;
    disabled?: boolean;
    className?: string;
}

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
    productId,
    quantity = 1,
    disabled = false,
    className,
}) => {
    const { t } = useTranslation();
    const { addToCart } = useCart();
    const [buttonState, setButtonState] = useState<ButtonState>('idle');

    useEffect(() => {
        if (buttonState === 'success' || buttonState === 'error') {
            const timer = setTimeout(() => {
                setButtonState('idle');
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [buttonState]);

    const handleAddToCart = async () => {
        if (buttonState !== 'idle') return;

        setButtonState('loading');
        try {
            await addToCart({ product_id: productId, quantity });
            setButtonState('success');
        } catch (error) {
            console.error('Failed to add to cart:', error);
            setButtonState('error');
        }
    };

    const getButtonClasses = () => {
        const baseClasses = 'transition-all duration-1000 ease-in-out transform';

        switch (buttonState) {
            case 'loading':
                return `${baseClasses}`;
            case 'success':
                return `${baseClasses} !bg-green-700 !text-white text-md disabled:!opacity-100`;
            case 'error':
                return `${baseClasses} !bg-red-700 !text-white text-md disabled:!opacity-100`;
            default:
                return baseClasses;
        }
    };

    const renderButtonContent = () => {
        switch (buttonState) {
            case 'loading':
                return (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t('cart.actions.addingToCart')}</span>
                    </>
                );
            case 'success':
                return (
                    <>
                        <Check className="w-6 h-6 animate-in zoom-in duration-300" />
                        <span>Added!</span>
                    </>
                );
            case 'error':
                return (
                    <>
                        <X className="w-6 h-6 animate-in zoom-in duration-300" />
                        <span>Failed</span>
                    </>
                );
            default:
                return t('cart.actions.addToCart');
        }
    };

    return (
        <Button
            onClick={handleAddToCart}
            disabled={disabled || buttonState !== 'idle'}
            variant="outline"
            className={`${className} ${getButtonClasses()} flex items-center gap-4`}
        >
            {renderButtonContent()}
        </Button>
    );
};
