export interface CartProduct {
    id: number;
    name: string;
    sku: string;
    stock_quantity: number;
    in_stock: boolean;
    image?: string;
}

export interface CartItem {
    id: number;
    product: CartProduct;
    quantity: number;
    unit_price: string;
    subtotal: string;
    created_at: string;
}

export interface CartTotals {
    item_count: number;
    subtotal: string;
    tax_amount: string;
    total: string;
}

export interface Cart {
    id: number;
    item_count: number;
    subtotal: string;
    tax_amount: string;
    total: string;
    items: CartItem[];
}

export interface AddToCartRequest {
    product_id: number;
    quantity: number;
}

export interface UpdateCartItemRequest {
    quantity: number;
}

export interface CartApiResponse {
    success: boolean;
    message: string;
    data: Cart;
}

export interface AddToCartApiResponse {
    success: boolean;
    message: string;
    data: {
        item: CartItem;
        cart_totals: CartTotals;
    };
}

export interface UpdateCartItemApiResponse {
    success: boolean;
    message: string;
    data: {
        item: CartItem;
        cart_totals: CartTotals;
    };
}

export interface RemoveCartItemApiResponse {
    success: boolean;
    message: string;
    data: {
        cart_totals: CartTotals;
    };
}

export interface ClearCartApiResponse {
    success: boolean;
    message: string;
    data: {
        cart_totals: CartTotals;
    };
}