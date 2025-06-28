import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, LoginCredentials, RegisterData } from '@/types/auth';
import { authService } from '@/services/authService';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    register: (userData: RegisterData) => Promise<void>;
}

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
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!token && !!user;

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = authService.getStoredToken();
            const storedUser = authService.getStoredUser();

            if (storedToken && storedUser) {
                try {
                    // Verify token is still valid
                    await authService.verifyToken();
                    setToken(storedToken);
                    setUser(storedUser);
                } catch {
                    // Token is invalid, clear storage
                    authService.logout();
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (credentials: LoginCredentials): Promise<void> => {
        setIsLoading(true);
        try {
            const response = await authService.login(credentials);
            if (response.success && response.data) {
                setToken(response.data.access);
                setUser(response.data.user);
            } else {
                throw new Error(response.message || 'LOGIN FAILED');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: RegisterData): Promise<void> => {
        setIsLoading(true);
        try {
            const response = await authService.register(userData);
            if (!response.success) {
                throw new Error(response.message || 'REGISTRATION FAILED');
            }
            // Don't auto-login after registration, user needs to verify email
        } finally {
            setIsLoading(false);
        }
    };

    const logout = (): void => {
        authService.logout();
        setToken(null);
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
        register,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};