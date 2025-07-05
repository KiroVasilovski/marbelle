/**
 * Authentication Service - New architecture using ApiClient
 * Handles all authentication-related API calls
 */
import { apiClient } from '../../../shared/api/ApiClient';
import { API_ENDPOINTS, STORAGE_KEYS } from '../../../shared/api/apiConfig';
import { localStorageService } from '../../../shared/storage/LocalStorageService';
import { sessionStorageService } from '../../../shared/storage/SessionStorageService';
import type {
    LoginCredentials,
    RegisterData,
    PasswordResetRequest,
    PasswordResetConfirm,
    EmailVerificationRequest,
    ResendVerificationRequest,
    LoginResponse,
    RegisterResponse,
    VerificationResponse,
    User,
    AuthTokens,
} from '../types/auth';
import type { ApiResponse } from '../../../shared/api/ApiClient';

export class AuthService {
    private static instance: AuthService;

    private constructor() {}

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    /**
     * User Registration
     */
    public async register(data: RegisterData): Promise<RegisterResponse> {
        const response = await apiClient.post<RegisterResponse['data']>(API_ENDPOINTS.AUTH.REGISTER, data, {
            skipAuth: true,
        });

        return {
            success: response.success,
            message: response.message,
            data: response.data,
            errors: response.errors,
        };
    }

    /**
     * User Login
     */
    public async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse['data']>(API_ENDPOINTS.AUTH.LOGIN, credentials, {
            skipAuth: true,
        });

        if (response.success && response.data) {
            // Store tokens using ApiClient method
            const tokens: AuthTokens = {
                access: response.data.access,
                refresh: response.data.refresh,
            };

            apiClient.storeTokens(tokens, credentials.remember_me);

            // Store user data
            this.storeUserData(response.data.user, credentials.remember_me);
        }

        return {
            success: response.success,
            message: response.message,
            data: response.data,
            errors: response.errors,
        };
    }

    /**
     * User Logout
     */
    public async logout(): Promise<void> {
        try {
            // Call logout endpoint to blacklist token
            await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {});
        } catch (error) {
            // Even if logout fails, clear local tokens
            console.error('Logout API call failed:', error);
        } finally {
            // Clear all stored data
            apiClient.clearTokens();
        }
    }

    /**
     * Email Verification
     */
    public async verifyEmail(token: string): Promise<VerificationResponse> {
        const data: EmailVerificationRequest = { token };

        const response = await apiClient.post<VerificationResponse['data']>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, data, {
            skipAuth: true,
        });

        return {
            success: response.success,
            message: response.message,
            data: response.data,
            errors: response.errors,
        };
    }

    /**
     * Resend Email Verification
     */
    public async resendVerification(email: string): Promise<ApiResponse> {
        const data: ResendVerificationRequest = { email };

        return await apiClient.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, data, { skipAuth: true });
    }

    /**
     * Request Password Reset
     */
    public async requestPasswordReset(email: string): Promise<ApiResponse> {
        const data: PasswordResetRequest = { email };

        return await apiClient.post(API_ENDPOINTS.AUTH.PASSWORD_RESET, data, { skipAuth: true });
    }

    /**
     * Confirm Password Reset
     */
    public async confirmPasswordReset(
        token: string,
        newPassword: string,
        confirmPassword: string
    ): Promise<ApiResponse> {
        const data: PasswordResetConfirm = {
            token,
            new_password: newPassword,
            new_password_confirm: confirmPassword,
        };

        return await apiClient.post(API_ENDPOINTS.AUTH.PASSWORD_RESET_CONFIRM, data, { skipAuth: true });
    }

    /**
     * Verify Token (check if user is still authenticated)
     */
    public async verifyToken(): Promise<ApiResponse<User>> {
        if (!apiClient.isAuthenticated()) {
            return {
                success: false,
                message: 'No token found',
            };
        }

        try {
            const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.VERIFY_TOKEN);

            if (response.success && response.data) {
                // Update stored user data
                this.updateUserData(response.data);
            }

            return response;
        } catch (error) {
            // If token verification fails, clear stored data
            apiClient.clearTokens();
            throw error;
        }
    }

    /**
     * Get Current User Data
     */
    public getCurrentUser(): User | null {
        const rememberMe = localStorageService.getItem<boolean>(STORAGE_KEYS.REMEMBER_ME);

        if (rememberMe) {
            return localStorageService.getItem<User>(STORAGE_KEYS.USER_DATA);
        } else {
            return sessionStorageService.getItem<User>(STORAGE_KEYS.USER_DATA);
        }
    }

    /**
     * Check if user is authenticated
     */
    public isAuthenticated(): boolean {
        return apiClient.isAuthenticated();
    }

    /**
     * Store user data in appropriate storage
     */
    private storeUserData(user: User, rememberMe = false): void {
        const storage = rememberMe ? localStorageService : sessionStorageService;
        storage.setItem(STORAGE_KEYS.USER_DATA, user);
    }

    /**
     * Update user data in storage
     */
    private updateUserData(user: User): void {
        const rememberMe = localStorageService.getItem<boolean>(STORAGE_KEYS.REMEMBER_ME);
        const storage = rememberMe ? localStorageService : sessionStorageService;
        storage.setItem(STORAGE_KEYS.USER_DATA, user);
    }

    /**
     * Clear all authentication data
     */
    public clearAuthData(): void {
        apiClient.clearTokens();
    }
}

// Export singleton instance
export const authService = AuthService.getInstance();
