/**
 * Dashboard types for the dashboard feature
 */

import type { User } from '../../auth/types/auth';

// Address types
export interface Address {
    id: number;
    label: string;
    first_name: string;
    last_name: string;
    company?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
    is_primary: boolean;
    created_at: string;
    updated_at: string;
}

export interface AddressFormData {
    label: string;
    first_name: string;
    last_name: string;
    company?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
}

// Profile types
export interface ProfileUpdateData {
    first_name: string;
    last_name: string;
    phone?: string;
    company_name?: string;
}

export interface PasswordChangeData {
    current_password: string;
    new_password: string;
    new_password_confirm: string;
}

// Email change types
export interface EmailChangeRequestData {
    current_password: string;
    new_email: string;
}

export interface EmailChangeConfirmData {
    token: string;
}

export interface EmailChangeResponse {
    success: boolean;
    message: string;
    data?: User;
    errors?: Record<string, string[]>;
}

// Order types (placeholder for future implementation)
export interface Order {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    created_at: string;
    updated_at: string;
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Record<string, string[]>;
}

export interface AddressResponse {
    success: boolean;
    data?: {
        addresses: Address[];
    };
    message?: string;
    errors?: Record<string, string[]>;
}

export interface ProfileResponse {
    success: boolean;
    data?: {
        user: User;
    };
    message?: string;
    errors?: Record<string, string[]>;
}

export interface OrderHistoryResponse {
    success: boolean;
    data?: {
        orders: Order[];
        count: number;
        next?: string;
        previous?: string;
    };
    message?: string;
    errors?: Record<string, string[]>;
}

// Dashboard context types
export interface DashboardContextType {
    // User profile state
    user: User | null;
    profileLoading: boolean;
    profileError: string | null;

    // Address state
    addresses: Address[];
    addressesLoading: boolean;
    addressesError: string | null;

    // Order state
    orders: Order[];
    ordersLoading: boolean;
    ordersError: string | null;

    // Profile actions
    updateProfile: (data: ProfileUpdateData) => Promise<void>;
    changePassword: (data: PasswordChangeData) => Promise<void>;

    // Address actions
    fetchAddresses: () => Promise<void>;
    createAddress: (data: AddressFormData) => Promise<void>;
    updateAddress: (id: number, data: AddressFormData) => Promise<void>;
    deleteAddress: (id: number) => Promise<void>;
    setPrimaryAddress: (id: number) => Promise<void>;

    // Order actions
    fetchOrders: () => Promise<void>;

    // Utility methods
    clearErrors: () => void;
    refreshUserData: () => Promise<void>;
}

// Form validation types
export interface FormField {
    value: string;
    error: string;
    touched: boolean;
}

export interface DashboardFormState {
    [key: string]: FormField;
}

export interface ValidationErrors {
    [key: string]: string;
}

// Navigation types
export interface DashboardNavItem {
    id: string;
    label: string;
    href: string;
    icon?: string;
    count?: number;
}

export interface DashboardSection {
    id: string;
    title: string;
    description?: string;
    isActive?: boolean;
}

// UI State types
export interface DashboardUIState {
    activeSection: string;
    sidebarOpen: boolean;
    editingProfile: boolean;
    editingAddress: number | null;
    showAddressForm: boolean;
    showPasswordForm: boolean;
}

// Business rules types
export interface AddressLimits {
    maxAddresses: number;
    currentCount: number;
    canAddMore: boolean;
}

export interface ProfileStatus {
    emailVerified: boolean;
    isBusinessCustomer: boolean;
    accountComplete: boolean;
    missingFields: string[];
}
