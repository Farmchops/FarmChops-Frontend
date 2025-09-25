// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireProfileComplete?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireProfileComplete = false
}) => {
    const { isAuthenticated, profileComplete } = useSelector((state: RootState) => state.auth);
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect to login page with return url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireProfileComplete && !profileComplete) {
        // Redirect to profile completion if required
        return <Navigate to="/complete-profile" replace />;
    }

    return <>{children}</>;
};
