import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthContextType, User, LoginCredentials, RegisterData } from './types/auth';
import { authService } from './services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    const isAuthenticated = authService.isAuthenticated() && !!user;

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedUser = authService.getCurrentUser();

                if (storedUser && authService.isAuthenticated()) {
                    try {
                        // Verify token is still valid
                        const userData = await authService.verifyToken();
                        setUser(userData);
                    } catch {
                        // Token is invalid, clear storage
                        authService.clearAuthData();
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                setError('Failed to initialize authentication');
            }
        };

        initializeAuth();

        // Listen for logout events from API client
        const handleLogout = () => {
            setUser(null);
            setError(null);
        };

        window.addEventListener('auth:logout', handleLogout);
        return () => window.removeEventListener('auth:logout', handleLogout);
    }, []);

    const login = async (credentials: LoginCredentials): Promise<void> => {
        setError(null);
        try {
            const data = await authService.login(credentials);
            if (data) {
                setUser(data.user);
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'LOGIN FAILED');
            throw error;
        }
    };

    const register = async (userData: RegisterData): Promise<void> => {
        setError(null);
        try {
            await authService.register(userData);
            // Don't auto-login after registration, user needs to verify email
        } catch (error) {
            setError(error instanceof Error ? error.message : 'REGISTRATION FAILED');
            throw error;
        }
    };

    const logout = (): void => {
        authService.logout();
        setUser(null);
        setError(null);
    };

    const verifyEmail = async (token: string): Promise<void> => {
        setError(null);
        try {
            await authService.verifyEmail(token);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'EMAIL VERIFICATION FAILED');
            throw error;
        }
    };

    const requestPasswordReset = async (email: string): Promise<void> => {
        setError(null);
        try {
            await authService.requestPasswordReset(email);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'PASSWORD RESET REQUEST FAILED');
            throw error;
        }
    };

    const confirmPasswordReset = async (token: string, newPassword: string, confirmPassword: string): Promise<void> => {
        setError(null);
        try {
            await authService.confirmPasswordReset(token, newPassword, confirmPassword);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'PASSWORD RESET CONFIRMATION FAILED');
            throw error;
        }
    };

    const resendVerification = async (email: string): Promise<void> => {
        setError(null);
        try {
            await authService.resendVerification(email);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'RESEND VERIFICATION FAILED');
            throw error;
        }
    };

    const clearError = (): void => {
        setError(null);
    };

    const checkAuthStatus = async (): Promise<void> => {
        try {
            const userData = await authService.verifyToken();
            setUser(userData);
        } catch (error) {
            console.error('Auth status check failed:', error);
            setUser(null);
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated,
        error,
        login,
        logout,
        register,
        verifyEmail,
        requestPasswordReset,
        confirmPasswordReset,
        resendVerification,
        clearError,
        checkAuthStatus,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
