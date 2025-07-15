/**
 * ApiError - Custom error class for API-related errors
 * Provides structured error information for better error handling
 */
export class ApiError extends Error {
    public readonly status?: number;
    public readonly errors?: Record<string, string[]>;
    public readonly originalError?: unknown;

    constructor(
        message: string,
        errors?: Record<string, string[]>,
        originalError?: unknown,
        status?: number
    ) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errors = errors;
        this.originalError = originalError;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }

    /**
     * Create ApiError from HTTP response data
     */
    static fromResponse(
        status: number,
        data: { message?: string; errors?: Record<string, string[]> }
    ): ApiError {
        return new ApiError(
            data.message || 'An error occurred',
            data.errors,
            undefined,
            status
        );
    }

    /**
     * Create ApiError from network/request error
     */
    static fromNetworkError(originalError: unknown): ApiError {
        return new ApiError(
            'Network error. Please check your connection.',
            undefined,
            originalError
        );
    }

    /**
     * Create ApiError from unknown error
     */
    static fromUnknownError(originalError: unknown): ApiError {
        const message = originalError instanceof Error 
            ? originalError.message 
            : 'An unexpected error occurred';
        
        return new ApiError(message, undefined, originalError);
    }

    /**
     * Check if error is an ApiError instance
     */
    static isApiError(error: unknown): error is ApiError {
        return error instanceof ApiError;
    }

    /**
     * Get formatted error message including field errors
     */
    getFormattedMessage(): string {
        let message = this.message;
        
        if (this.errors && Object.keys(this.errors).length > 0) {
            const fieldErrors = Object.entries(this.errors)
                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                .join('; ');
            message += ` (${fieldErrors})`;
        }
        
        return message;
    }
}