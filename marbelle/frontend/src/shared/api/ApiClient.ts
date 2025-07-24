/**
 * ApiClient - Centralized API client using Axios
 * Handles all HTTP requests with authentication, interceptors, and error handling
 */
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import { API_CONFIG, STORAGE_KEYS } from './apiConfig';
import { localStorageService } from '../storage/LocalStorageService';
import { ApiError } from './ApiError';

/**
 * ApiResponse - Standardized API response structure
 * @template T - Type of the data returned in the response
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

/**
 * RequestOptions - Extended Axios request configuration
 * @extends AxiosRequestConfig
 * @property {boolean} [skipAuth] - Skip authentication for this request
 * @property {boolean} [useRefreshToken] - Use refresh token for this request
 */
export interface RequestOptions extends AxiosRequestConfig {
    skipAuth?: boolean;
    useRefreshToken?: boolean;
}

/**
 * AuthTokens - Structure for authentication tokens
 * @property {string} access - Access token for authenticated requests
 * @property {string} refresh - Refresh token for renewing access token
 */
export interface AuthTokens {
    access: string;
    refresh: string;
}

/**
 * ApiClient - Singleton class for managing API requests
 * Implements token management, request/response interceptors, and error handling
 */
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
        return ApiClient.instance || (ApiClient.instance = new ApiClient());
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
        return localStorageService.getItem<string>(STORAGE_KEYS.ACCESS_TOKEN);
    }

    private getRefreshToken(): string | null {
        return localStorageService.getItem<string>(STORAGE_KEYS.REFRESH_TOKEN);
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
                throw ApiError.fromResponse(response.status, response.data);
            }
        } catch (error) {
            this.clearTokens();
            if (error instanceof ApiError) {
                throw error;
            }
            throw this.createApiError(error as AxiosError);
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

    public storeTokens(tokens: AuthTokens): void {
        localStorageService.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access);
        localStorageService.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh);
    }

    public clearTokens(): void {
        localStorageService.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorageService.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorageService.removeItem(STORAGE_KEYS.USER_DATA);
    }

    public async get<T = unknown>(url: string, config?: RequestOptions): Promise<T> {
        try {
            const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.get(url, config);

            if (!response.data.success) {
                throw ApiError.fromResponse(response.status, response.data);
            }

            return response.data.data as T;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw this.createApiError(error as AxiosError);
        }
    }

    public async post<T = unknown>(url: string, data?: unknown, config?: RequestOptions): Promise<T> {
        try {
            const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.post(url, data, config);

            if (!response.data.success) {
                throw ApiError.fromResponse(response.status, response.data);
            }

            return response.data.data as T;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw this.createApiError(error as AxiosError);
        }
    }

    public async put<T = unknown>(url: string, data?: unknown, config?: RequestOptions): Promise<T> {
        try {
            const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.put(url, data, config);

            if (!response.data.success) {
                throw ApiError.fromResponse(response.status, response.data);
            }

            return response.data.data as T;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw this.createApiError(error as AxiosError);
        }
    }

    public async patch<T = unknown>(url: string, data?: unknown, config?: RequestOptions): Promise<T> {
        try {
            const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.patch(url, data, config);

            if (!response.data.success) {
                throw ApiError.fromResponse(response.status, response.data);
            }

            return response.data.data as T;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw this.createApiError(error as AxiosError);
        }
    }

    public async delete<T = unknown>(url: string, config?: RequestOptions): Promise<T> {
        try {
            const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.delete(url, config);

            if (!response.data.success) {
                throw ApiError.fromResponse(response.status, response.data);
            }

            return response.data.data as T;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw this.createApiError(error as AxiosError);
        }
    }

    private createApiError(error: AxiosError): ApiError {
        console.error('API Error:', error);

        if (error.response?.data) {
            const errorData = error.response.data as { message?: string; errors?: Record<string, string[]> };
            return ApiError.fromResponse(error.response.status, errorData);
        }

        if (error.request) {
            return ApiError.fromNetworkError(error);
        }

        return ApiError.fromUnknownError(error);
    }

    public isAuthenticated(): boolean {
        return !!this.getAccessToken();
    }

    public getAxiosInstance(): AxiosInstance {
        return this.axiosInstance;
    }
}

export const apiClient = ApiClient.getInstance();
