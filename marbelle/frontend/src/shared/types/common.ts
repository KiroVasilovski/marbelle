/**
 * Common types used across the application
 */

// Generic API response structure
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

// Pagination types
export interface PaginatedResponse<T> {
    success: boolean;
    data: {
        results: T[];
        count: number;
        next: string | null;
        previous: string | null;
    };
    message?: string;
}

// Generic error types
export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
    status?: number;
}

// Loading states
export interface LoadingState {
    isLoading: boolean;
    error: string | null;
}

// Form field types
export interface FormField {
    value: string;
    error: string;
    touched: boolean;
}

// Generic form state
export interface FormState {
    [key: string]: FormField;
}

// Validation result
export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

// File upload types
export interface FileUpload {
    file: File;
    preview?: string;
    progress?: number;
    error?: string;
}

// Common entity base
export interface BaseEntity {
    id: number;
    created_at: string;
    updated_at: string;
}

// Search and filter types
export interface SearchParams {
    q?: string;
    page?: number;
    page_size?: number;
    ordering?: string;
}

export interface FilterOption {
    value: string;
    label: string;
    count?: number;
}

// Generic select option
export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}
