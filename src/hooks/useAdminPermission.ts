// src/hooks/useAdminPermissions.ts
import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

export const useAdminPermissions = () => {
    const user = useSelector((state: RootState) => state.adminAuth.user);

    const hasPermission = (permission: string | string[]): boolean => {
        if (!user?.permissions) return false;

        // Check if user has all permissions (super admin)
        if (user.permissions.includes("*")) return true;

        // Check for single permission
        if (typeof permission === "string") {
            return user.permissions.includes(permission);
        }

        // Check if user has any of the provided permissions
        return permission.some(p => user.permissions.includes(p));
    };

    const hasAllPermissions = (permissions: string[]): boolean => {
        if (!user?.permissions) return false;
        if (user.permissions.includes("*")) return true;

        return permissions.every(p => user.permissions.includes(p));
    };

    const isSuperAdmin = (): boolean => {
        return user?.permissions?.includes("*") || false;
    };

    return {
        hasPermission,
        hasAllPermissions,
        isSuperAdmin,
        permissions: user?.permissions || [],
        adminRole: user?.adminRole,
    };
};

export default useAdminPermissions;