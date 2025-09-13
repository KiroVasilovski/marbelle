export interface ProductImage {
    id: number;
    image: string;
    alt_text: string;
    is_primary: boolean;
    display_order: number;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    unit_of_measure: string;
    category: number;
    stock_quantity: number;
    in_stock: boolean;
    sku: string;
    images: ProductImage[];
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: number;
    name: string;
    description: string;
    product_count: number;
    created_at: string;
}

export interface ProductListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Product[];
}

export interface CategoryListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Category[];
}

export interface ProductFilters {
    search?: string;
    category?: number;
    min_price?: number;
    max_price?: number;
    in_stock?: boolean;
    ordering?: string;
    page?: number;
}
