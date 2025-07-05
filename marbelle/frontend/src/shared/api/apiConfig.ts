/**
 * API Configuration - Central configuration for all API requests
 */

// Environment configuration
export const API_CONFIG = {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
    timeout: 30000, // 30 seconds
    defaultHeaders: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
} as const;

// API endpoints
export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: '/auth/register/',
        LOGIN: '/auth/login/',
        LOGOUT: '/auth/logout/',
        REFRESH: '/auth/refresh/',
        VERIFY_EMAIL: '/auth/verify-email/',
        VERIFY_TOKEN: '/auth/verify-token/',
        PASSWORD_RESET: '/auth/password-reset/',
        PASSWORD_RESET_CONFIRM: '/auth/password-reset-confirm/',
        RESEND_VERIFICATION: '/auth/resend-verification/',
    },
    PRODUCTS: {
        LIST: '/products/',
        DETAIL: '/products/:id/',
        CATEGORIES: '/products/categories/',
    },
    ORDERS: {
        LIST: '/orders/',
        CREATE: '/orders/',
        DETAIL: '/orders/:id/',
    },
} as const;

// Storage keys
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
} as const;
