/**
 * Authentication types for the auth feature
 */

// User types
export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    company_name?: string;
    phone?: string;
    is_active: boolean;
    is_verified: boolean;
    is_business_customer: boolean;
    date_joined: string;
}

// Authentication request types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirm: string;
    company_name?: string;
    phone?: string;
}

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordResetConfirm {
    token: string;
    new_password: string;
    new_password_confirm: string;
}

export interface EmailVerificationRequest {
    token: string;
}

export interface ResendVerificationRequest {
    email: string;
}

// Authentication response types
export interface AuthTokens {
    access: string;
    refresh: string;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    data?: {
        user: User;
        tokens: AuthTokens;
    };
    errors?: Record<string, string[]>;
}

export interface LoginResponse {
    success: boolean;
    message?: string;
    data?: {
        user: User;
        access: string;
        refresh: string;
    };
    errors?: Record<string, string[]>;
}

export interface RegisterResponse {
    success: boolean;
    message?: string;
    data?: {
        user: User;
        message: string;
    };
    errors?: Record<string, string[]>;
}

export interface VerificationResponse {
    success: boolean;
    message?: string;
    data?: {
        user: User;
    };
    errors?: Record<string, string[]>;
}

// Authentication context types
export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    error: string | null;

    // Auth actions
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    verifyEmail: (token: string) => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>;
    confirmPasswordReset: (token: string, newPassword: string, confirmPassword: string) => Promise<void>;
    resendVerification: (email: string) => Promise<void>;

    // Utility methods
    clearError: () => void;
    checkAuthStatus: () => Promise<void>;
}

// Form validation types
export interface ValidationErrors {
    [key: string]: string;
}

export interface FormField {
    value: string;
    error: string;
    touched: boolean;
}

export interface AuthFormState {
    [key: string]: FormField;
}

// Password strength types
export interface PasswordStrength {
    score: number;
    feedback: string[];
    isValid: boolean;
}

// API Error types
export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
    status?: number;
}
