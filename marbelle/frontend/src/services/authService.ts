import type { LoginCredentials, RegisterData, AuthResponse, ApiErrorResponse, User } from '@/types/auth';

const API_BASE_URL = 'http://localhost:8000/api/v1';

class AuthService {
    private getAuthHeaders(): Record<string, string> {
        const token = localStorage.getItem('access_token');
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    }

    private async makeRequest<T>(
        url: string,
        options: RequestInit = {}
    ): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            headers: this.getAuthHeaders(),
            ...options,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'REQUEST FAILED');
        }

        return data;
    }

    async register(userData: RegisterData): Promise<AuthResponse> {
        return this.makeRequest<AuthResponse>('/auth/register/', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await this.makeRequest<AuthResponse>('/auth/login/', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        // Store tokens in localStorage
        if (response.success && response.data) {
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response;
    }

    async logout(): Promise<void> {
        const refreshToken = localStorage.getItem('refresh_token');
        
        try {
            await this.makeRequest('/auth/logout/', {
                method: 'POST',
                body: JSON.stringify({ refresh: refreshToken }),
            });
        } finally {
            // Clear local storage regardless of API response
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
        }
    }

    async verifyEmail(token: string): Promise<ApiErrorResponse> {
        return this.makeRequest<ApiErrorResponse>('/auth/verify-email/', {
            method: 'POST',
            body: JSON.stringify({ token }),
        });
    }

    async requestPasswordReset(email: string): Promise<ApiErrorResponse> {
        return this.makeRequest<ApiErrorResponse>('/auth/password-reset/', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    async confirmPasswordReset(
        token: string,
        newPassword: string,
        newPasswordConfirm: string
    ): Promise<ApiErrorResponse> {
        return this.makeRequest<ApiErrorResponse>('/auth/password-reset-confirm/', {
            method: 'POST',
            body: JSON.stringify({
                token,
                new_password: newPassword,
                new_password_confirm: newPasswordConfirm,
            }),
        });
    }

    async verifyToken(): Promise<{ success: boolean; data?: { user: User } }> {
        return this.makeRequest<{ success: boolean; data?: { user: User } }>('/auth/verify-token/');
    }

    async resendVerificationEmail(email: string): Promise<ApiErrorResponse> {
        return this.makeRequest<ApiErrorResponse>('/auth/resend-verification/', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    getStoredUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    getStoredToken() {
        return localStorage.getItem('access_token');
    }

    isAuthenticated(): boolean {
        return !!this.getStoredToken();
    }
}

export const authService = new AuthService();