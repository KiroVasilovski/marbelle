import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProductDetail } from '../hooks/useProductDetail';
import { ProductInfo } from './ProductInfo';
import type { ProductImage } from '../types/product';

export const ProductDetailPage: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { product, loading, error } = useProductDetail(id || '');

    const handleBackClick = () => {
        navigate('/products');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-500 uppercase tracking-wide">
                        {t('products.detail.loading')}
                    </span>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <h1 className="text-2xl font-light text-gray-900 uppercase tracking-wide mb-4">
                        {t('products.detail.error.title')}
                    </h1>
                    <p className="text-gray-600 mb-6">{error || t('products.detail.error.message')}</p>
                    <button
                        onClick={handleBackClick}
                        className="bg-black text-white px-6 py-3 text-sm uppercase tracking-wide hover:bg-gray-800 transition-colors"
                    >
                        {t('products.detail.error.backButton')}
                    </button>
                </div>
            </div>
        );
    }

    const placeholderImage =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5PIElNQUdFPC90ZXh0Pjwvc3ZnPg==';

    // Sort images by display_order, then by id
    const sortedImages = [...product.images].sort((a, b) => {
        if (a.display_order !== b.display_order) {
            return a.display_order - b.display_order;
        }
        return a.id - b.id;
    });

    // Get primary image (first image or placeholder)
    const primaryImage = sortedImages[0] || null;

    // Get remaining images for gallery (excluding primary)
    const galleryImages = sortedImages.slice(1);

    return (
        <div className="min-h-screen bg-white">
            {/* Mobile Layout: Column layout (image -> description -> gallery) */}
            <div className="block md:hidden">
                {/* Primary Image */}
                <div className="aspect-square p-4">
                    <img
                        src={primaryImage?.image || placeholderImage}
                        alt={primaryImage?.alt_text || product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = placeholderImage;
                        }}
                    />
                </div>

                {/* Product Information */}
                <div className="p-4">
                    <ProductInfo product={product} />
                </div>

                {/* Additional Images Gallery */}
                {galleryImages.length > 0 && (
                    <div className="p-4 space-y-4">
                        <div className="space-y-4">
                            {galleryImages.map((image: ProductImage) => (
                                <div key={image.id} className="aspect-square bg-gray-100">
                                    <img
                                        src={image.image}
                                        alt={image.alt_text || `${product.name} ${image.display_order}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = placeholderImage;
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop/Tablet Layout: Side-by-side with overlay */}
            <div className="hidden md:block">
                <div className="relative min-h-screen flex xl:-mt-20">
                    {/* Primary Image - Responsive positioning based on screen size */}
                    <div className="w-full md:w-1/2 relative">
                        {/* Large screens (lg+): Image from top with left margin to align with burger menu */}
                        <div className="hidden lg:block absolute inset-0 lg:pt-0">
                            <div className="lg:ml-22 xl:ml-35 lg:h-[calc(100vh-5rem)] xl:h-screen">
                                <img
                                    src={primaryImage?.image || placeholderImage}
                                    alt={primaryImage?.alt_text || product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = placeholderImage;
                                    }}
                                />
                            </div>
                        </div>

                        {/* Medium screens (md to lg): Image after header with minimal margin */}
                        <div className="block lg:hidden">
                            <div className="ml-4 mr-0 h-[calc(100vh-5rem)]">
                                <img
                                    src={primaryImage?.image || placeholderImage}
                                    alt={primaryImage?.alt_text || product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = placeholderImage;
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Product Information - Right side */}
                    <div className="absolute inset-y-0 right-0 w-full md:w-1/2 flex">
                        <div className="w-full bg-white pl-6 pr-6 pb-6 md:pr-8 md:pl-8 md:pb-8 lg:pr-12 lg:pl-12 lg:pb-12 xl:mt-20 flex flex-col justify-start">
                            <ProductInfo product={product} />
                        </div>
                    </div>
                </div>

                {/* Additional Images Gallery - Below main section (desktop/tablet) */}
                {galleryImages.length > 0 && (
                    <div className="bg-white py-12 md:py-16 lg:py-20">
                        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
                                {galleryImages.map((image: ProductImage) => (
                                    <div key={image.id} className="aspect-square bg-gray-100">
                                        <img
                                            src={image.image}
                                            alt={image.alt_text || `${product.name} ${image.display_order}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = placeholderImage;
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
