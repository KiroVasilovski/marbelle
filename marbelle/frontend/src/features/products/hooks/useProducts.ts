import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import type { Product, Category } from '../types/product';

interface UseProductsReturn {
    products: Product[];
    loading: boolean;
    error: string | null;
    categories: Category[];
}

export const useProducts = (): UseProductsReturn => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Load products and categories in parallel
                const [productsResponse, categoriesResponse] = await Promise.all([
                    productService.getProducts(),
                    productService.getCategories(),
                ]);

                if (isMounted) {
                    setProducts(productsResponse.data || []);
                    setCategories(categoriesResponse.data || []);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Failed to load data');
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    return {
        products,
        categories,
        loading,
        error,
    };
};
