// src/routes/AdminRoute.tsx
import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

interface AdminRouteProps {
    children: React.ReactNode;
    requiredPermission?: string;
}

const AdminRoute = ({ children, requiredPermission }: AdminRouteProps) => {
    const user = useSelector((state: RootState) => state.adminAuth.user);
    const token = useSelector((state: RootState) => state.adminAuth.token);

    // Check if admin is authenticated
    if (!token || !user) {
        return <Navigate to="/admin/login" replace />;
    }

    // Check if admin is active
    if (user.isActive === false) {
        return <Navigate to="/admin/login" replace />;
    }

    // Check for specific permission if required
    if (requiredPermission && requiredPermission !== "*") {
        // Super admin has "*" and can access everything
        const hasSuperAdminPermission = user.permissions?.includes("*");

        // Check if user has the specific permission
        const hasSpecificPermission = user.permissions?.includes(requiredPermission);

        if (!hasSuperAdminPermission && !hasSpecificPermission) {
            // User lacks required permission, redirect to overview
            return <Navigate to="/admin/overview" replace />;
        }
    }

    // All checks passed
    return <>{children}</>;
};

export default AdminRoute;