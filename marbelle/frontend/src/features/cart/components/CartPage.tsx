import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '../../../shared/components/shadcn/button';
import { useCart } from '../CartContext';
import { CartItem } from './CartItem';

export const CartPage: React.FC = () => {
    const { t } = useTranslation();
    const { cart, isLoading, error } = useCart();

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg">{t('common.loading')}</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">{t('cart.title')}</h1>
                    <div className="text-red-600 mb-4">{error}</div>
                    <Link to="/products">
                        <Button variant="secondary">{t('cart.emptyState.shopNowButton')}</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-8">{t('cart.title')}</h1>
                    <div className="max-w-md mx-auto">
                        <ShoppingCart size={64} className="mx-auto mb-4 text-gray-400" />
                        <h2 className="text-xl font-semibold mb-2">{t('cart.emptyState.title')}</h2>
                        <p className="text-gray-600 mb-6">{t('cart.emptyState.subtitle')}</p>
                        <Link to="/products">
                            <Button variant="outline">{t('cart.emptyState.shopNowButton')}</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto px-4 py-8">
            <div className="md:max-w-6xl mx-auto">
                <h1 className="text-2xl mb-8 font-bold">{t('cart.title')}</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white ">
                            <div className="space-y-2">
                                {cart.items.map((item) => (
                                    <CartItem key={item.id} item={item} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded shadow-sm border p-6 sticky top-20">
                            <h2 className="text-lg font-medium mb-4">{t('cart.summary.subtotal')}</h2>
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between">
                                    <span>{t('cart.summary.subtotal')}</span>
                                    <span>${cart.subtotal}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{t('cart.summary.tax')}</span>
                                    <span>${cart.tax_amount}</span>
                                </div>
                                <div className="border-t pt-2">
                                    <div className="flex justify-between font-semibold text-lg">
                                        <span>{t('cart.summary.total')}</span>
                                        <span>${cart.total}</span>
                                    </div>
                                </div>
                            </div>

                            <Button variant="secondary" className="w-full">
                                {t('cart.actions.checkout')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
