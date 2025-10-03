import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '../../../shared/components/shadcn/button';
import { useCart } from '../CartContext';
import { ProductImage } from './ProductImage';
import { getProductImageUrl } from '../utils/imageUtils';
import type { CartItem } from '../types/cart';

interface CartPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    recentlyAddedItem: CartItem | null;
    cartItemCount: number;
    cartTotal: string;
}

export const CartPreview: React.FC<CartPreviewProps> = ({
    isOpen,
    onClose,
    recentlyAddedItem,
    cartItemCount,
    cartTotal,
}) => {
    const { t } = useTranslation();
    const { clearRecentlyAddedItem } = useCart();

    // Auto-close after 4 seconds
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    // Clean up after exit animation completes
    const handleTransitionEnd = () => {
        if (!isOpen && recentlyAddedItem) {
            clearRecentlyAddedItem();
        }
    };

    if (!recentlyAddedItem) return null;

    return (
        <>
            {/* Backdrop for mobile - fades in smoothly */}
            <div
                className={`
                    fixed inset-0 z-[70] bg-black/20 md:hidden
                    transition-opacity duration-500 ease-in-out
                    ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                `}
                onClick={onClose}
                role="button"
                tabIndex={0}
                aria-label="Close cart preview"
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        onClose();
                    }
                }}
            />

            {/* Cart Preview Dropdown - Smooth slide from top */}
            <div
                className={`
                    fixed md:absolute right-0 z-[80]
                    bg-white shadow-2xl rounded-lg border border-gray-200
                    transition-all duration-700 ease-in-out
                    ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8 pointer-events-none'}

                    /* Mobile: centered dropdown from top */
                    top-16 left-4 right-4 md:left-auto
                    md:top-full md:mt-2 md:right-0

                    /* Width */
                    w-auto md:w-96
                `}
                style={{
                    transformOrigin: 'top center',
                }}
                onTransitionEnd={handleTransitionEnd}
            >
                {/* Success Header - Animated */}
                <div
                    className={`
                        bg-green-50 border-b border-green-100 p-4 rounded-t-lg
                        transition-all duration-500 delay-200 ease-out
                        ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                    `}
                >
                    <div className="flex items-center space-x-2">
                        <div
                            className={`
                                flex-shrink-0 w-8 h-8 bg-green-500 rounded-full
                                flex items-center justify-center
                                transition-all duration-500 delay-300 ease-out
                                ${isOpen ? 'scale-100 rotate-0' : 'scale-0 -rotate-180'}
                            `}
                        >
                            <Check size={18} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <p
                                className={`
                                    text-sm font-medium text-green-900 uppercase tracking-wide
                                    transition-all duration-500 delay-400 ease-out
                                    ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
                                `}
                            >
                                {t('cart.preview.addedToCart')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Item Details - Staggered fade in */}
                <div
                    className={`
                        p-4 border-b border-gray-100
                        transition-all duration-500 delay-500 ease-out
                        ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                    `}
                >
                    <div className="flex space-x-3">
                        <div
                            className={`
                                transition-all duration-500 delay-600 ease-out
                                ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
                            `}
                        >
                            <ProductImage
                                imageUrl={getProductImageUrl(recentlyAddedItem.product.image)}
                                productName={recentlyAddedItem.product.name}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4
                                className={`
                                    text-sm font-medium text-gray-900 truncate
                                    transition-all duration-500 delay-700 ease-out
                                    ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                                `}
                            >
                                {recentlyAddedItem.product.name}
                            </h4>
                            <p
                                className={`
                                    text-xs text-gray-500 mt-1
                                    transition-all duration-500 delay-[800ms] ease-out
                                    ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                                `}
                            >
                                {t('cart.preview.quantity')}: {recentlyAddedItem.quantity}
                            </p>
                            <p
                                className={`
                                    text-sm font-medium text-gray-900 mt-1
                                    transition-all duration-500 delay-[900ms] ease-out
                                    ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                                `}
                            >
                                ${recentlyAddedItem.subtotal}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Cart Summary - Final animated section */}
                <div
                    className={`
                        p-4 bg-gray-50 rounded-b-lg
                        transition-all duration-500 delay-[1000ms] ease-out
                        ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                    `}
                >
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-600">
                            {t('cart.preview.itemsInCart', { count: cartItemCount })}
                        </p>
                        <p className="text-lg font-semibold text-gray-900">${cartTotal}</p>
                    </div>

                    {/* Action Buttons - Fade in last */}
                    <div
                        className={`
                            flex space-x-2
                            transition-all duration-500 delay-[1100ms] ease-out
                            ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                        `}
                    >
                        <Button onClick={onClose} variant="outline" className="flex-1 uppercase tracking-wide text-xs">
                            {t('cart.preview.continueShopping')}
                        </Button>
                        <Link to="/cart" className="flex-1" onClick={onClose}>
                            <Button variant="secondary" className="w-full">
                                {t('cart.preview.viewCart')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};
