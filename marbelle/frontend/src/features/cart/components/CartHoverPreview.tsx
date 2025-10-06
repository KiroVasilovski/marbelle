import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '../../../shared/components/shadcn/button';
import { ProductImage } from './ProductImage';
import { getProductImageUrl } from '../utils/imageUtils';
import type { Cart } from '../types/cart';

interface CartHoverPreviewProps {
    cart: Cart | null;
    isVisible: boolean;
}

export const CartHoverPreview: React.FC<CartHoverPreviewProps> = ({ cart, isVisible }) => {
    const { t } = useTranslation();

    if (!cart || cart.items.length === 0) return null;

    return (
        <div
            className={`
                absolute right-0 top-full z-50
                transition-all duration-300 ease-in-out
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
            `}
            style={{
                transformOrigin: 'top right',
            }}
        >
            {/* Preview content */}
            <div className="bg-white shadow-2xl rounded-lg border border-gray-200 w-96 max-h-[500px]">
                {/* Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-4 rounded-t-lg">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        {t('cart.hover.title')}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                        {t('cart.hover.itemCount', { count: cart.item_count })}
                    </p>
                </div>

                {/* Items List - Scrollable */}
                <div className="max-h-80 overflow-y-auto">
                    {cart.items.map((item) => (
                        <div
                            key={item.id}
                            className="flex space-x-3 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                            <ProductImage
                                imageUrl={getProductImageUrl(item.product.image)}
                                productName={item.product.name}
                            />
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 truncate">{item.product.name}</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    {t('cart.hover.quantity')}: {item.quantity}
                                </p>
                                <p className="text-sm font-medium text-gray-900 mt-1">${item.subtotal}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer with totals and action */}
                <div className="bg-gray-50 p-4 rounded-b-lg border-t border-gray-200">
                    <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{t('cart.hover.subtotal')}</span>
                            <span className="font-medium text-gray-900">${cart.subtotal}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{t('cart.hover.tax')}</span>
                            <span className="font-medium text-gray-900">${cart.tax_amount}</span>
                        </div>
                        <div className="flex justify-between text-base border-t border-gray-200 pt-2">
                            <span className="font-semibold text-gray-900 uppercase tracking-wide">
                                {t('cart.hover.total')}
                            </span>
                            <span className="font-bold text-gray-900">${cart.total}</span>
                        </div>
                    </div>

                    <Link to="/cart" className="block">
                        <Button variant="outline" className="w-full uppercase tracking-wide">
                            {t('cart.hover.viewCart')}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};
