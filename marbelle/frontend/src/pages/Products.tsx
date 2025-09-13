import React from 'react';
import { ProductCatalog } from '../features/products';
import type { Product } from '../features/products';

const Products: React.FC = () => {
    const handleProductClick = (product: Product) => {
        console.log('Navigate to product detail:', product.id);
    };

    return <ProductCatalog onProductClick={handleProductClick} />;
};

export default Products;
