import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface ProductImageProps {
    imageUrl: string | null;
    productName: string;
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
};

export const ProductImage: React.FC<ProductImageProps> = ({ imageUrl, productName, size = 'md' }) => {
    const sizeClass = sizeClasses[size];

    return (
        <div className={`flex-shrink-0 ${sizeClass}`}>
            {imageUrl ? (
                <img src={imageUrl} alt={productName} className="w-full h-full object-cover rounded" />
            ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded">
                    <ShoppingCart size={20} className="text-gray-400" />
                </div>
            )}
        </div>
    );
};
