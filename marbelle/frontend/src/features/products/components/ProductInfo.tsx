import React from 'react';
import { useTranslation } from 'react-i18next';
import { AddToCartButton } from '../../cart';

import type { Product } from '../types/product';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/shadcn/accordion';

interface ProductInfoProps {
    product: Product;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            {/* Product Name */}
            <div>
                <h1 className="text-3xl font-light text-gray-900 uppercase tracking-wide">{product.name}</h1>
            </div>

            {/* Price */}
            <div>
                <div className="flex items-baseline space-x-2">
                    <span className="text-sm text-gray-500 uppercase tracking-wide">{t('products.detail.price')}</span>
                </div>
                <div className="mt-1">
                    <span className="text-2xl font-light text-gray-900">${product.price}</span>
                    <span className="text-sm text-gray-500 ml-2 uppercase tracking-wide">
                        {t('products.perUnit.' + product.unit_of_measure, {
                            defaultValue: `/ ${product.unit_of_measure.toUpperCase()}`,
                        })}
                    </span>
                </div>
            </div>

            {/* Add to Cart */}
            <AddToCartButton productId={product.id} disabled={!product.in_stock} className="w-full lg:w-auto" />

            {/* Accordions for Description and Specifications */}
            <Accordion type="single" collapsible className="w-full">
                {/* Description Accordion */}
                {product.description && (
                    <AccordionItem value="description">
                        <AccordionTrigger className="text-sm uppercase tracking-wide">
                            {t('products.detail.description')}
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="prose prose-sm max-w-none">
                                <p className="text-gray-700 leading-relaxed">{product.description}</p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}

                {/* Specifications Accordion */}
                <AccordionItem value="specifications">
                    <AccordionTrigger className="text-sm uppercase tracking-wide">
                        {t('products.detail.specifications')}
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500 uppercase tracking-wide">
                                    {t('products.detail.unitOfMeasure')}
                                </span>
                                <span className="text-sm text-gray-900 uppercase">{product.unit_of_measure}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500 uppercase tracking-wide">
                                    {t('products.detail.category')}
                                </span>
                                <span className="text-sm text-gray-900">Category ID: {product.category}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500 uppercase tracking-wide">
                                    {t('products.sku')}
                                </span>
                                <span className="text-sm text-gray-900 font-mono">{product.sku}</span>
                            </div>
                            {/* Stock Status */}
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500 uppercase tracking-wide">
                                    {t('products.detail.stockQuantity')}
                                </span>
                                <span
                                    className={`text-xs px-2 py-1 uppercase tracking-wide ${
                                        product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {product.in_stock ? t('products.inStock') : t('products.outOfStock')}
                                </span>
                                <span className="text-sm font-medium uppercase tracking-wide">
                                    {product.stock_quantity}{' '}
                                    {t('products.perUnit.' + product.unit_of_measure, {
                                        defaultValue: product.unit_of_measure.toUpperCase(),
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-500 uppercase tracking-wide">Created</span>
                                <span className="text-sm text-gray-900">
                                    {new Date(product.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};
