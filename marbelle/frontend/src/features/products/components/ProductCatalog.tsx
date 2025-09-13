import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProductGrid } from './ProductGrid';
import { useProducts } from '../hooks/useProducts';
import type { Product } from '../types/product';

interface ProductCatalogProps {
    onProductClick?: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ onProductClick }) => {
    const { t } = useTranslation();
    const { products, loading, error } = useProducts();

    const handleProductClick = (product: Product) => {
        if (onProductClick) {
            onProductClick(product);
        }
        console.log('Product clicked:', product.name);
    };

    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <p className="text-gray-900 text-lg font-medium uppercase tracking-wide mb-4">
                        {t('products.error.title')}
                    </p>
                    <p className="text-red-600 text-sm mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-black text-white px-6 py-2 text-sm uppercase tracking-wide hover:bg-gray-800 transition-colors"
                    >
                        {t('common.retry', { defaultValue: 'RETRY' })}
                    </button>
                </div>
            </div>
        );
    }

    if (loading && products.length === 0) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-500 uppercase tracking-wide">{t('products.loading')}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-16">
            <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-16 text-center uppercase tracking-wide">
                    {t('pages.products.title')}
                </h1>

                <ProductGrid products={products} onProductClick={handleProductClick} />
            </div>
        </div>
    );
};
