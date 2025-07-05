/**
 * ApiClient - Centralized API client using Axios
 * Handles all HTTP requests with authentication, interceptors, and error handling
 */
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import { API_CONFIG, STORAGE_KEYS } from './apiConfig';
import { localStorageService } from '../storage/LocalStorageService';
import { sessionStorageService } from '../storage/SessionStorageService';

// Types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface RequestOptions extends AxiosRequestConfig {
    skipAuth?: boolean;
    useRefreshToken?: boolean;
}

export interface AuthTokens {
    access: string;
    refresh: string;
}

export class ApiClient {
    private static instance: ApiClient;
    private axiosInstance: AxiosInstance;
    private isRefreshing = false;
    private refreshSubscribers: Array<(token: string) => void> = [];

    private constructor() {
        this.axiosInstance = axios.create({
            baseURL: API_CONFIG.baseURL,
            timeout: API_CONFIG.timeout,
            headers: API_CONFIG.defaultHeaders,
        });

        this.setupInterceptors();
    }

    public static getInstance(): ApiClient {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient();
        }
        return ApiClient.instance;
    }

    private setupInterceptors(): void {
        // Request interceptor - Add auth token to requests
        this.axiosInstance.interceptors.request.use(
            (config) => {
                const token = this.getAccessToken();
                const requestConfig = config as RequestOptions;
                if (token && !requestConfig.skipAuth) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor - Handle token refresh
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as RequestOptions & { _retry?: boolean };

                if (error.response?.status === 401 && !originalRequest.skipAuth && !originalRequest._retry) {
                    if (!this.isRefreshing) {
                        this.isRefreshing = true;
                        try {
                            const newToken = await this.refreshAccessToken();
                            this.isRefreshing = false;
                            this.onRefreshed(newToken);
                            originalRequest._retry = true;
                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            }
                            return this.axiosInstance(originalRequest);
                        } catch (refreshError) {
                            this.isRefreshing = false;
                            this.onRefreshFailed();
                            return Promise.reject(refreshError);
                        }
                    }

                    // If refresh is in progress, queue the request
                    return new Promise((resolve) => {
                        this.refreshSubscribers.push((token: string) => {
                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                            }
                            resolve(this.axiosInstance(originalRequest));
                        });
                    });
                }

                return Promise.reject(error);
            }
        );
    }

    private getAccessToken(): string | null {
        const rememberMe = localStorageService.getItem<boolean>(STORAGE_KEYS.REMEMBER_ME);

        if (rememberMe) {
            return localStorageService.getItem<string>(STORAGE_KEYS.ACCESS_TOKEN);
        } else {
            return sessionStorageService.getItem<string>(STORAGE_KEYS.ACCESS_TOKEN);
        }
    }

    private getRefreshToken(): string | null {
        const rememberMe = localStorageService.getItem<boolean>(STORAGE_KEYS.REMEMBER_ME);

        if (rememberMe) {
            return localStorageService.getItem<string>(STORAGE_KEYS.REFRESH_TOKEN);
        } else {
            return sessionStorageService.getItem<string>(STORAGE_KEYS.REFRESH_TOKEN);
        }
    }

    private async refreshAccessToken(): Promise<string> {
        const refreshToken = this.getRefreshToken();

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await this.axiosInstance.post<ApiResponse<AuthTokens>>(
                '/auth/refresh/',
                { refresh: refreshToken },
                { skipAuth: true } as RequestOptions
            );

            if (response.data.success && response.data.data) {
                this.storeTokens(response.data.data);
                return response.data.data.access;
            } else {
                throw new Error('Token refresh failed');
            }
        } catch (error) {
            this.clearTokens();
            throw error;
        }
    }

    private onRefreshed(token: string): void {
        this.refreshSubscribers.forEach((callback) => callback(token));
        this.refreshSubscribers = [];
    }

    private onRefreshFailed(): void {
        this.refreshSubscribers = [];
        this.clearTokens();
        // Trigger logout event
        window.dispatchEvent(new CustomEvent('auth:logout'));
    }

    public storeTokens(tokens: AuthTokens, rememberMe = false): void {
        const storage = rememberMe ? localStorageService : sessionStorageService;

        storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access);
        storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh);
        localStorageService.setItem(STORAGE_KEYS.REMEMBER_ME, rememberMe);
    }

    public clearTokens(): void {
        localStorageService.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorageService.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorageService.removeItem(STORAGE_KEYS.USER_DATA);
        localStorageService.removeItem(STORAGE_KEYS.REMEMBER_ME);

        sessionStorageService.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        sessionStorageService.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        sessionStorageService.removeItem(STORAGE_KEYS.USER_DATA);
    }

    public async get<T = unknown>(url: string, config?: RequestOptions): Promise<ApiResponse<T>> {
        try {
            const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.get(url, config);
            return response.data;
        } catch (error) {
            return this.handleError<T>(error as AxiosError);
        }
    }

    public async post<T = unknown>(url: string, data?: unknown, config?: RequestOptions): Promise<ApiResponse<T>> {
        try {
            const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.post(url, data, config);
            return response.data;
        } catch (error) {
            return this.handleError<T>(error as AxiosError);
        }
    }

    public async put<T = unknown>(url: string, data?: unknown, config?: RequestOptions): Promise<ApiResponse<T>> {
        try {
            const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.put(url, data, config);
            return response.data;
        } catch (error) {
            return this.handleError<T>(error as AxiosError);
        }
    }

    public async patch<T = unknown>(url: string, data?: unknown, config?: RequestOptions): Promise<ApiResponse<T>> {
        try {
            const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.patch(url, data, config);
            return response.data;
        } catch (error) {
            return this.handleError<T>(error as AxiosError);
        }
    }

    public async delete<T = unknown>(url: string, config?: RequestOptions): Promise<ApiResponse<T>> {
        try {
            const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.delete(url, config);
            return response.data;
        } catch (error) {
            return this.handleError<T>(error as AxiosError);
        }
    }

    private handleError<T>(error: AxiosError): ApiResponse<T> {
        console.error('API Error:', error);

        if (error.response?.data) {
            const errorData = error.response.data as { message?: string; errors?: Record<string, string[]> };
            return {
                success: false,
                message: errorData.message || 'An error occurred',
                errors: errorData.errors,
            };
        }

        if (error.request) {
            return {
                success: false,
                message: 'Network error. Please check your connection.',
            };
        }

        return {
            success: false,
            message: error.message || 'An unexpected error occurred',
        };
    }

    public isAuthenticated(): boolean {
        return !!this.getAccessToken();
    }

    public getAxiosInstance(): AxiosInstance {
        return this.axiosInstance;
    }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();
