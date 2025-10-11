// // src/components/AdminRoute.tsx
// import { useSelector } from "react-redux";
// import { Navigate } from "react-router-dom";
// import type { RootState } from "../redux/store";

// interface AdminRouteProps {
//     children: React.ReactNode;
// }

// const AdminRoute = ({ children }: AdminRouteProps) => {
//     const user = useSelector((state: RootState) => state.auth.user);
//     const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

//     // Check if user is authenticated and has admin role
//     if (!isAuthenticated) {
//         return <Navigate to="/admin/login" replace />;
//     }

//     // Check if user has admin role (adjust this based on your user object structure)
//     if (user?.role !== "admin") {
//         return <Navigate to="/" replace />;
//     }

//     return <>{children}</>;
// };

// export default AdminRoute;














// // src/routes/AdminRoute.tsx
// import { useSelector } from "react-redux";
// import { Navigate } from "react-router-dom";
// import type { RootState } from "../store/store";

// interface AdminRouteProps {
//     children: React.ReactNode;
// }

// const AdminRoute = ({ children }: AdminRouteProps) => {
//     const user = useSelector((state: RootState) => state.adminAuth.user);
//     const isAuthenticated = useSelector((state: RootState) => state.adminAuth.isAuthenticated);

//     // Check if admin is authenticated
//     if (!isAuthenticated) {
//         return <Navigate to="/admin/login" replace />;
//     }

//     // Check if user has admin role
//     // if (user?.role !== "admin") {
//     //     return <Navigate to="/admin/login" replace />;
//     // }

//     // Optionally check if admin is active
//     // if (!user.isActive) {
//     //     return <Navigate to="/admin/login" replace />;
//     // }

//     return <>{children}</>;
// };

// export default AdminRoute;



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