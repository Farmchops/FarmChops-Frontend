// src/components/AdminRoute.tsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "../redux/store";

interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
    const user = useSelector((state: RootState) => state.auth.user);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    // Check if user is authenticated and has admin role
    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    // Check if user has admin role (adjust this based on your user object structure)
    if (user?.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;
