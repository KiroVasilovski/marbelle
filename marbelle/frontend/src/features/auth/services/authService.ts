/**
 * Authentication Service - New architecture using ApiClient
 * Handles all authentication-related API calls
 */
import { apiClient } from '../../../shared/api/ApiClient';
import { API_ENDPOINTS, STORAGE_KEYS } from '../../../shared/api/apiConfig';
import { localStorageService } from '../../../shared/storage/LocalStorageService';
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

export class AuthService {
    private static instance: AuthService;

    private constructor() { }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    /**
     * User Registration
     */
    public async register(data: RegisterData): Promise<RegisterResponse['data']> {
        return await apiClient.post<RegisterResponse['data']>(API_ENDPOINTS.AUTH.REGISTER, data, {
            skipAuth: true,
        });
    }

    /**
     * User Login
     */
    public async login(credentials: LoginCredentials): Promise<LoginResponse['data']> {
        const data = await apiClient.post<LoginResponse['data']>(API_ENDPOINTS.AUTH.LOGIN, credentials, {
            skipAuth: true,
        });

        if (data) {
            // Store tokens using ApiClient method
            const tokens: AuthTokens = {
                access: data.access,
                refresh: data.refresh,
            };

            apiClient.storeTokens(tokens);

            // Store user data
            this.storeUserData(data.user);
        }

        return data;
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
    public async verifyEmail(token: string): Promise<VerificationResponse['data']> {
        const data: EmailVerificationRequest = { token };

        return await apiClient.post<VerificationResponse['data']>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, data, {
            skipAuth: true,
        });
    }

    /**
     * Resend Email Verification
     */
    public async resendVerification(email: string): Promise<void> {
        const data: ResendVerificationRequest = { email };

        await apiClient.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, data, { skipAuth: true });
    }

    /**
     * Request Password Reset
     */
    public async requestPasswordReset(email: string): Promise<void> {
        const data: PasswordResetRequest = { email };

        await apiClient.post(API_ENDPOINTS.AUTH.PASSWORD_RESET, data, { skipAuth: true });
    }

    /**
     * Confirm Password Reset
     */
    public async confirmPasswordReset(
        token: string,
        newPassword: string,
        confirmPassword: string
    ): Promise<void> {
        const data: PasswordResetConfirm = {
            token,
            new_password: newPassword,
            new_password_confirm: confirmPassword,
        };

        await apiClient.post(API_ENDPOINTS.AUTH.PASSWORD_RESET_CONFIRM, data, { skipAuth: true });
    }

    /**
     * Verify Token (check if user is still authenticated)
     */
    public async verifyToken(): Promise<User> {
        if (!apiClient.isAuthenticated()) {
            throw new Error('No token found');
        }

        try {
            const user = await apiClient.get<User>(API_ENDPOINTS.AUTH.VERIFY_TOKEN);

            // Update stored user data
            this.updateUserData(user);

            return user;
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
        return localStorageService.getItem<User>(STORAGE_KEYS.USER_DATA);
    }

    /**
     * Check if user is authenticated
     */
    public isAuthenticated(): boolean {
        return apiClient.isAuthenticated();
    }

    /**
     * Store user data in localStorage
     */
    private storeUserData(user: User): void {
        localStorageService.setItem(STORAGE_KEYS.USER_DATA, user);
    }

    /**
     * Update user data in localStorage
     */
    private updateUserData(user: User): void {
        localStorageService.setItem(STORAGE_KEYS.USER_DATA, user);
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
