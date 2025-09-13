import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Product } from '../types/product';

interface ProductCardProps {
    product: Product;
    onClick?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const primaryImage = product.images.find((img) => img.is_primary) || product.images[0];
    const placeholderImage =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5PIElNQUdFPC90ZXh0Pjwvc3ZnPg==';

    const handleClick = () => {
        // Call custom onClick if provided (for backward compatibility)
        if (onClick) {
            onClick(product);
        }
        // Navigate to product detail page
        navigate(`/products/${product.id}`);
    };

    return (
        <div
            className="group cursor-pointer mb-8"
            onClick={handleClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                }
            }}
            role="button"
            tabIndex={0}
        >
            <div className="aspect-[4/5] bg-gray-100 mb-4 overflow-hidden">
                <img
                    src={primaryImage?.image || placeholderImage}
                    alt={primaryImage?.alt_text || product.name}
                    className="w-full h-full object-cover transition-opacity duration-200"
                    loading="lazy"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = placeholderImage;
                    }}
                />
            </div>

            <div className="space-y-1">
                <h3 className="text-sm font-light text-gray-900 uppercase tracking-wide">{product.name}</h3>

                <div className="flex items-center justify-between text-xs text-gray-600 uppercase tracking-wide">
                    <span className="font-light">
                        {product.price}{' '}
                        {t('products.perUnit.' + product.unit_of_measure, { defaultValue: product.unit_of_measure })}
                    </span>
                </div>
            </div>
        </div>
    );
};
