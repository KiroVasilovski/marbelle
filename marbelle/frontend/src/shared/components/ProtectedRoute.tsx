import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

interface AuthenticatedRouteProps {
    children: React.ReactNode;
}

interface UnauthenticatedRouteProps {
    children: React.ReactNode;
}

export const AuthenticatedRoute: React.FC<AuthenticatedRouteProps> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect to login page with return url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export const UnauthenticatedRoute: React.FC<UnauthenticatedRouteProps> = ({ children }) => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        // Redirect authenticated users to home page
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

// Keep the old export for backward compatibility
export const ProtectedRoute = AuthenticatedRoute;
