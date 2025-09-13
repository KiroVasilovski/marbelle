import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';
import type { Product } from '../types/product';

interface UseProductDetailReturn {
    product: Product | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useProductDetail = (productId: number | string): UseProductDetailReturn => {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProduct = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const productData = await productService.getProduct(Number(productId));
            setProduct(productData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load product details';
            setError(errorMessage);
            setProduct(null);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        if (productId) {
            fetchProduct();
        }
    }, [productId, fetchProduct]);

    const refetch = () => {
        fetchProduct();
    };

    return {
        product,
        loading,
        error,
        refetch,
    };
};