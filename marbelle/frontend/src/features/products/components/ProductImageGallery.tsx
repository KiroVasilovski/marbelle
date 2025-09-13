import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProductImage } from '../types/product';

interface ProductImageGalleryProps {
    images: ProductImage[];
    productName: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ images, productName }) => {
    const { t } = useTranslation();
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const placeholderImage =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5PIElNQUdFPC90ZXh0Pjwvc3ZnPg==';

    // Sort images by display_order, then by id
    const sortedImages = [...images].sort((a, b) => {
        if (a.display_order !== b.display_order) {
            return a.display_order - b.display_order;
        }
        return a.id - b.id;
    });

    // If no images, show placeholder
    if (sortedImages.length === 0) {
        return (
            <div className="space-y-4">
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <img
                        src={placeholderImage}
                        alt={t('products.detail.primaryImage')}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        );
    }

    const selectedImage = sortedImages[selectedImageIndex];

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-100">
                <img
                    src={selectedImage?.image || placeholderImage}
                    alt={selectedImage?.alt_text || t('products.detail.primaryImage')}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = placeholderImage;
                    }}
                />
            </div>

            {/* Thumbnail Navigation */}
            {sortedImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                    {sortedImages.map((image, index) => (
                        <button
                            key={image.id}
                            type="button"
                            onClick={() => setSelectedImageIndex(index)}
                            className={`aspect-square bg-gray-100 overflow-hidden transition-opacity duration-200 ${
                                selectedImageIndex === index
                                    ? 'ring-2 ring-black opacity-100'
                                    : 'opacity-70 hover:opacity-100'
                            }`}
                            aria-label={t('products.detail.thumbnailImage', { index: index + 1 })}
                        >
                            <img
                                src={image.image}
                                alt={image.alt_text || `${productName} ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = placeholderImage;
                                }}
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Image count indicator */}
            {sortedImages.length > 1 && (
                <div className="text-center">
                    <span className="text-sm text-gray-500 uppercase tracking-wide">
                        {selectedImageIndex + 1} / {sortedImages.length}
                    </span>
                </div>
            )}
        </div>
    );
};