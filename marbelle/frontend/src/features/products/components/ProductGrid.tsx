import React from 'react';
import { ProductCard } from './ProductCard';
import type { Product } from '../types/product';

interface ProductGridProps {
    products: Product[];
    onProductClick?: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductClick }) => {
    if (products.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-500 uppercase tracking-wide text-sm">NO PRODUCTS FOUND</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 md:gap-x-10 xl:gap-x-16 md:ml-4 md:mr-4 xl:ml-9 xl:mr-9 gap-y-8 md:gap-y-12 xl:gap-y-16">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} onClick={onProductClick} />
            ))}
        </div>
    );
};
