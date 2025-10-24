import { apiClient } from '../../../shared/api/ApiClient';
import type { Product, ProductListResponse, CategoryListResponse, ProductFilters } from '../types/product';

class ProductService {
    /**
     * Get products with optional filters
     */
    async getProducts(filters: ProductFilters = {}): Promise<ProductListResponse> {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        const queryString = params.toString();
        const url = `/products/${queryString ? `?${queryString}` : ''}`;

        // The backend now returns standardized response with data and pagination
        // For paginated endpoints, we need to capture the raw response to get pagination metadata
        const axiosInstance = apiClient.getAxiosInstance();
        const response = await axiosInstance.get<ProductListResponse>(url);

        // ApiClient wraps response, so we need to handle both the wrapper and the actual data
        if (response.data?.success && response.data?.data) {
            return response.data as ProductListResponse;
        }

        // Fallback for compatibility
        return {
            success: true,
            message: 'Results retrieved successfully.',
            data: (response.data?.data || []) as Product[],
            pagination: response.data?.pagination,
        };
    }

    /**
     * Get a single product by ID
     */
    async getProduct(id: number): Promise<Product> {
        return await apiClient.get<Product>(`/products/${id}/`, { skipAuth: true });
    }

    /**
     * Get all categories
     */
    async getCategories(): Promise<CategoryListResponse> {
        const axiosInstance = apiClient.getAxiosInstance();
        const response = await axiosInstance.get<CategoryListResponse>('/categories/');

        if (response.data?.success && response.data?.data) {
            return response.data as CategoryListResponse;
        }

        return {
            success: true,
            message: 'Results retrieved successfully.',
            data: (response.data?.data || []) as any[],
            pagination: response.data?.pagination,
        };
    }

    /**
     * Get products for a specific category
     */
    async getCategoryProducts(categoryId: number, filters: ProductFilters = {}): Promise<ProductListResponse> {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        const queryString = params.toString();
        const url = `/categories/${categoryId}/products/${queryString ? `?${queryString}` : ''}`;

        const axiosInstance = apiClient.getAxiosInstance();
        const response = await axiosInstance.get<ProductListResponse>(url);

        if (response.data?.success && response.data?.data) {
            return response.data as ProductListResponse;
        }

        return {
            success: true,
            message: 'Results retrieved successfully.',
            data: (response.data?.data || []) as Product[],
            pagination: response.data?.pagination,
        };
    }
}

export const productService = new ProductService();
