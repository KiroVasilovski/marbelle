export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    company_name?: string;
    phone?: string;
    is_business_customer: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    password_confirm: string;
    company_name?: string;
    phone?: string;
}

export interface AuthTokens {
    access: string;
    refresh: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
        access: string;
        refresh: string;
        user: User;
    };
    errors?: Record<string, string[]>;
}

export interface ApiErrorResponse {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
}