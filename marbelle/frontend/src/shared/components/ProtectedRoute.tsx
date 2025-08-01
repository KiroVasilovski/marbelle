import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from './ui/loading-spinner';

interface AuthenticatedRouteProps {
    children: React.ReactNode;
}

interface UnauthenticatedRouteProps {
    children: React.ReactNode;
}

export const AuthenticatedRoute: React.FC<AuthenticatedRouteProps> = ({ children }) => {
    const { isAuthenticated, isInitializing } = useAuth();
    const location = useLocation();
    const { t } = useTranslation();

    // Show loading state during authentication initialization
    if (isInitializing) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" className="mx-auto mb-4" />
                    <p className="text-gray-600">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login page with return url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export const UnauthenticatedRoute: React.FC<UnauthenticatedRouteProps> = ({ children }) => {
    const { isAuthenticated, isInitializing } = useAuth();
    const { t } = useTranslation();

    // Show loading state during authentication initialization
    if (isInitializing) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" className="mx-auto mb-4" />
                    <p className="text-gray-600">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        // Redirect authenticated users to home page
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

// Keep the old export for backward compatibility
export const ProtectedRoute = AuthenticatedRoute;
