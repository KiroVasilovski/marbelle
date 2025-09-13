import axios from 'axios';
import { API_CONFIG } from '../../../shared/api/apiConfig';
import type { Product, ProductListResponse, CategoryListResponse, ProductFilters } from '../types/product';

class ProductService {
    private baseURL: string;

    constructor() {
        this.baseURL = API_CONFIG.baseURL;
    }

    async getProducts(filters: ProductFilters = {}): Promise<ProductListResponse> {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        const queryString = params.toString();
        const url = queryString ? `${this.baseURL}/products/?${queryString}` : `${this.baseURL}/products/`;

        const response = await axios.get<ProductListResponse>(url);
        return response.data;
    }

    async getProduct(id: number): Promise<Product> {
        const url = `${this.baseURL}/products/${id}/`;
        const response = await axios.get<Product>(url);
        return response.data;
    }

    async getCategories(): Promise<CategoryListResponse> {
        const url = `${this.baseURL}/categories/`;
        const response = await axios.get<CategoryListResponse>(url);
        return response.data;
    }

    async getCategoryProducts(categoryId: number, filters: ProductFilters = {}): Promise<ProductListResponse> {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        const queryString = params.toString();
        const url = queryString
            ? `${this.baseURL}/categories/${categoryId}/products/?${queryString}`
            : `${this.baseURL}/categories/${categoryId}/products/`;

        const response = await axios.get<ProductListResponse>(url);
        return response.data;
    }
}

export const productService = new ProductService();
