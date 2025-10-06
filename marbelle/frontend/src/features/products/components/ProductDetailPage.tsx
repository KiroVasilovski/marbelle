import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProductDetail } from '../hooks/useProductDetail';
import { ProductInfo } from './ProductInfo';
import { AddToCartButton } from '../../cart';
import type { ProductImage } from '../types/product';

export const ProductDetailPage: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { product, loading, error } = useProductDetail(id || '');

    // Refs for intersection observers
    const productInfoRef = useRef<HTMLDivElement>(null);
    const footerSentinelRef = useRef<HTMLDivElement>(null);

    // State to control sticky bar visibility
    const [showStickyBar, setShowStickyBar] = useState(false);

    const handleBackClick = () => {
        navigate('/products');
    };

    // Intersection Observer for product info section
    useEffect(() => {
        const productInfoElement = productInfoRef.current;
        const footerSentinelElement = footerSentinelRef.current;

        if (!productInfoElement || !footerSentinelElement) return;

        let isProductInfoVisible = true;
        let isFooterVisible = false;

        // Observer for when user scrolls past product info
        const productInfoObserver = new IntersectionObserver(
            ([entry]) => {
                isProductInfoVisible = entry.isIntersecting;
                // Show sticky bar when product info is NOT visible AND footer is NOT visible
                setShowStickyBar(!isProductInfoVisible && !isFooterVisible);
            },
            {
                threshold: 0,
                rootMargin: '0px',
            }
        );

        // Observer for when user reaches footer
        const footerObserver = new IntersectionObserver(
            ([entry]) => {
                isFooterVisible = entry.isIntersecting;
                // Show sticky bar when product info is NOT visible AND footer is NOT visible
                setShowStickyBar(!isProductInfoVisible && !isFooterVisible);
            },
            {
                threshold: 0,
                rootMargin: '0px',
            }
        );

        productInfoObserver.observe(productInfoElement);
        footerObserver.observe(footerSentinelElement);

        return () => {
            productInfoObserver.disconnect();
            footerObserver.disconnect();
        };
    }, [product]);

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
            <div className="block lg:hidden">
                {/* Primary Image */}
                <div className="aspect-square">
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

                {/* Product Information - with ref for intersection observer */}
                <div ref={productInfoRef} className="p-4">
                    <ProductInfo product={product} />
                </div>

                {/* Additional Images Gallery */}
                {galleryImages.length > 0 && (
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
                )}

                {/* Footer Sentinel - invisible element to detect when footer is near */}
                <div ref={footerSentinelRef} className="h-0" />

                {/* Sticky Bottom Bar - appears when scrolled past product info */}
                <div
                    className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg transition-transform duration-300 z-40 ${
                        showStickyBar ? 'translate-y-0' : 'translate-y-full'
                    }`}
                >
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex-1 pr-4">
                                <h2 className="text-sm font-light text-gray-900 uppercase tracking-wide line-clamp-2">
                                    {product.name}
                                </h2>
                                <p className="text-lg font-light text-gray-900 mt-1">
                                    ${product.price}
                                    <span className="text-xs text-gray-500 ml-1 uppercase tracking-wide">
                                        {t('products.perUnit.' + product.unit_of_measure, {
                                            defaultValue: `/ ${product.unit_of_measure.toUpperCase()}`,
                                        })}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <AddToCartButton productId={product.id} disabled={!product.in_stock} className="w-full" />
                    </div>
                </div>
            </div>

            {/* Desktop/Tablet Layout: Side-by-side with sticky sidebar */}
            <div className="hidden lg:block">
                <div className="flex lg:-mt-20">
                    {/* Left side - Images (3/5 width) */}
                    <div className="w-3/5">
                        {/* Primary Image */}
                        <div className="aspect-square">
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

                        {/* Additional Images Gallery */}
                        {galleryImages.length > 0 && (
                            <div className="space-y-2 mt-2">
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
                        )}
                    </div>

                    {/* Right side - Product Information (2/5 width, sticky) */}
                    <div className="w-2/5">
                        <div className="sticky top-0 bottom-0 p-8 lg:p-12 bg-white h-screen overflow-y-auto flex items-center">
                            <div className="w-full">
                                <ProductInfo product={product} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
