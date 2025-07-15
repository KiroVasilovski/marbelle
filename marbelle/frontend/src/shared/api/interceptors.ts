/**
 * Additional interceptors for the API client
 * Can be extended for logging, analytics, etc.
 */
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Request logging interceptor
export const requestLoggerInterceptor = (config: AxiosRequestConfig): AxiosRequestConfig => {
    if (import.meta.env.MODE === 'development') {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            headers: config.headers,
            data: config.data,
        });
    }
    return config;
};

// Response logging interceptor
export const responseLoggerInterceptor = (response: AxiosResponse): AxiosResponse => {
    if (import.meta.env.MODE === 'development') {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`, {
            data: response.data,
            headers: response.headers,
        });
    }
    return response;
};

// Error logging interceptor
export const errorLoggerInterceptor = (error: AxiosError): Promise<AxiosError> => {
    if (import.meta.env.MODE === 'development') {
        console.error(`❌ API Error: ${error.config?.url}`, {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
        });
    }
    return Promise.reject(error);
};

// Rate limiting interceptor
export const rateLimitInterceptor = (error: AxiosError): Promise<AxiosError> => {
    if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        if (retryAfter) {
            console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
        }
    }
    return Promise.reject(error);
};

// Cache interceptor for GET requests
export const cacheInterceptor = (config: AxiosRequestConfig): AxiosRequestConfig => {
    if (config.method === 'get' && !config.params?.no_cache) {
        config.headers = {
            ...config.headers,
            'Cache-Control': 'public, max-age=300', // 5 minutes
        };
    }
    return config;
};
