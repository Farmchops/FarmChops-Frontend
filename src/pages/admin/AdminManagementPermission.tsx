// src/components/Admin/UserPermissionsModal.tsx
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { AdminUser } from "@/redux/api/adminAuthApi";
// import { ROLES, PERMISSIONS, ROLE_PERMISSIONS } from "@/utils/permissions";

const ROLES = {
    SUPER_ADMIN: 'super_admin',
    INVENTORY_OFFICER: 'inventory_officer',
    OPERATIONS_OFFICER: 'operations_officer',
    LOGISTICS: 'logistics',
    CUSTOMER_SUPPORT: 'customer_support',
    FINANCE: 'finance',
    ADMIN: 'admin' // General admin role
}

const PERMISSIONS = {
    // Inventory permissions
    VIEW_INVENTORY: 'view_inventory',
    MANAGE_INVENTORY: 'manage_inventory',
    REQUEST_PAYMENT: 'request_payment',

    // Product/Category permissions
    VIEW_PRODUCTS: 'view_products',
    MANAGE_PRODUCTS: 'manage_products',
    MANAGE_CATEGORIES: 'manage_categories',

    // Order permissions
    VIEW_ORDERS: 'view_orders',
    APPROVE_ORDERS: 'approve_orders',
    UPDATE_ORDER_STATUS: 'update_order_status',

    // Logistics permissions
    VIEW_LOGISTICS: 'view_logistics',
    CONFIRM_DELIVERY: 'confirm_delivery',

    // Customer Support permissions
    VIEW_CUSTOMER_FEEDBACK: 'view_customer_feedback',
    RESPOND_TO_FEEDBACK: 'respond_to_feedback',

    // Finance permissions
    VIEW_FINANCIAL_REPORTS: 'view_financial_reports',
    APPROVE_PAYMENTS: 'approve_payments',
    PROCESS_PAYMENTS: 'process_payments',
    VIEW_PAYMENT_DETAILS: 'view_payment_details',

    // Admin management (super admin only)
    MANAGE_ADMINS: 'manage_admins',

    // Super admin has all permissions
    ALL: '*'
}



const ROLE_PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: [PERMISSIONS.ALL],

    [ROLES.INVENTORY_OFFICER]: [
        PERMISSIONS.VIEW_INVENTORY,
        PERMISSIONS.MANAGE_INVENTORY,
        PERMISSIONS.VIEW_PRODUCTS,
        PERMISSIONS.MANAGE_PRODUCTS,
        PERMISSIONS.MANAGE_CATEGORIES,
        PERMISSIONS.REQUEST_PAYMENT
    ],

    [ROLES.OPERATIONS_OFFICER]: [
        PERMISSIONS.VIEW_ORDERS,
        PERMISSIONS.APPROVE_ORDERS,
        PERMISSIONS.UPDATE_ORDER_STATUS
    ],

    [ROLES.LOGISTICS]: [
        PERMISSIONS.VIEW_LOGISTICS,
        PERMISSIONS.VIEW_ORDERS,
        PERMISSIONS.CONFIRM_DELIVERY
    ],

    [ROLES.CUSTOMER_SUPPORT]: [
        PERMISSIONS.VIEW_ORDERS, // Read-only
        PERMISSIONS.VIEW_CUSTOMER_FEEDBACK,
        PERMISSIONS.RESPOND_TO_FEEDBACK
    ],

    [ROLES.FINANCE]: [
        PERMISSIONS.VIEW_FINANCIAL_REPORTS,
        PERMISSIONS.VIEW_ORDERS,
        PERMISSIONS.VIEW_PAYMENT_DETAILS,
        PERMISSIONS.APPROVE_PAYMENTS,
        PERMISSIONS.PROCESS_PAYMENTS
    ],

    [ROLES.ADMIN]: [
        PERMISSIONS.VIEW_PRODUCTS,
        PERMISSIONS.MANAGE_PRODUCTS,
        PERMISSIONS.MANAGE_CATEGORIES,
        PERMISSIONS.VIEW_ORDERS
    ]
};

interface AdminPermissionsModalProps {
    isOpen: boolean;
    admin: AdminUser | null;
    onClose: () => void;
    onSubmit: (data: { adminRole: string; permissions: string[] }) => Promise<void>;
    isLoading?: boolean;
}

const adminRoles = [
    { value: ROLES.SUPER_ADMIN, label: "Super Admin" },
    { value: ROLES.INVENTORY_OFFICER, label: "Inventory Officer" },
    { value: ROLES.OPERATIONS_OFFICER, label: "Operations Officer" },
    { value: ROLES.LOGISTICS, label: "Logistics" },
    { value: ROLES.CUSTOMER_SUPPORT, label: "Customer Support" },
    { value: ROLES.FINANCE, label: "Finance" },
];

const allPermissions = [
    { id: PERMISSIONS.VIEW_INVENTORY, label: "View Inventory", description: "View inventory status" },
    { id: PERMISSIONS.MANAGE_INVENTORY, label: "Manage Inventory", description: "Modify inventory levels" },
    { id: PERMISSIONS.REQUEST_PAYMENT, label: "Request Payment", description: "Request payment for inventory" },
    { id: PERMISSIONS.VIEW_PRODUCTS, label: "View Products", description: "View all products" },
    { id: PERMISSIONS.MANAGE_PRODUCTS, label: "Manage Products", description: "Create, edit, delete products" },
    { id: PERMISSIONS.MANAGE_CATEGORIES, label: "Manage Categories", description: "Manage product categories" },
    { id: PERMISSIONS.VIEW_ORDERS, label: "View Orders", description: "View all orders" },
    { id: PERMISSIONS.APPROVE_ORDERS, label: "Approve Orders", description: "Approve pending orders" },
    { id: PERMISSIONS.UPDATE_ORDER_STATUS, label: "Update Order Status", description: "Update order status" },
    { id: PERMISSIONS.VIEW_LOGISTICS, label: "View Logistics", description: "View logistics information" },
    { id: PERMISSIONS.CONFIRM_DELIVERY, label: "Confirm Delivery", description: "Confirm deliveries" },
    { id: PERMISSIONS.VIEW_CUSTOMER_FEEDBACK, label: "View Feedback", description: "View customer feedback" },
    { id: PERMISSIONS.RESPOND_TO_FEEDBACK, label: "Respond to Feedback", description: "Respond to feedback" },
    { id: PERMISSIONS.VIEW_FINANCIAL_REPORTS, label: "View Financial Reports", description: "Access financial reports" },
    { id: PERMISSIONS.APPROVE_PAYMENTS, label: "Approve Payments", description: "Approve payments" },
    { id: PERMISSIONS.PROCESS_PAYMENTS, label: "Process Payments", description: "Process payments" },
    { id: PERMISSIONS.VIEW_PAYMENT_DETAILS, label: "View Payment Details", description: "View payment details" },
];

export const AdminPermissionsModal: React.FC<AdminPermissionsModalProps> = ({
    isOpen,
    admin,
    onClose,
    onSubmit,
    isLoading = false,
}) => {
    const [selectedRole, setSelectedRole] = useState<string>(ROLES.INVENTORY_OFFICER);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [error, setError] = useState<string>("");
    const [open, setOpen] = useState(false);
    const [backdropVisible, setBackdropVisible] = useState(false);

    // Initialize from admin data
    useEffect(() => {
        if (admin) {
            setSelectedRole(admin.adminRole);
            // If super admin, don't set permissions (they get "*")
            if (admin.permissions.includes(PERMISSIONS.ALL)) {
                setSelectedPermissions([]);
            } else {
                setSelectedPermissions(admin.permissions);
            }
        }
    }, [admin, isOpen]);

    // When role changes, update permissions
    const handleRoleChange = (role: string) => {
        setSelectedRole(role);
        const rolePerms = ROLE_PERMISSIONS[role] || [];
        setSelectedPermissions(rolePerms);
        setError("");
    };

    // Animation effects
    useEffect(() => {
        if (isOpen) {
            setOpen(true);
            const timer = setTimeout(() => setBackdropVisible(true), 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen || !admin) return null;

    const togglePermission = (permissionId: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(permissionId)
                ? prev.filter((p) => p !== permissionId)
                : [...prev, permissionId]
        );
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Super admin doesn't need permission validation
        if (selectedRole === ROLES.SUPER_ADMIN) {
            try {
                await onSubmit({ adminRole: selectedRole, permissions: [PERMISSIONS.ALL] });
                handleClose();
            } catch (err: any) {
                setError(err?.message || "Failed to update admin.");
            }
            return;
        }

        if (selectedPermissions.length === 0) {
            setError("Please select at least one permission.");
            return;
        }

        try {
            await onSubmit({ adminRole: selectedRole, permissions: selectedPermissions });
            handleClose();
        } catch (err: any) {
            setError(err?.message || "Failed to update admin.");
        }
    };

    const handleClose = () => {
        setBackdropVisible(false);
        setTimeout(() => setOpen(false), 150);
        setTimeout(() => onClose(), 450);
    };

    const isSuperAdmin = selectedRole === ROLES.SUPER_ADMIN;
    const rolePermissions = ROLE_PERMISSIONS[selectedRole] || [];

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black transition-opacity duration-300 ${backdropVisible ? "opacity-40" : "opacity-0"
                    }`}
                onClick={handleClose}
            />

            {/* Drawer */}
            <div
                className={`ml-auto w-full sm:w-[420px] h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"
                    } overflow-y-auto relative`}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
                >
                    <X size={24} />
                </button>

                <div className="m-3">
                    {/* Header */}
                    <div className="mb-2 border-b border-[#808080]">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                            User Permissions
                        </h2>
                        {/* <p className="text-sm text-gray-600">Manage admin role and permissions</p> */}
                    </div>

                    {/* Admin Info */}
                    <div className="flex items-center gap-3 py-4 rounded-lg">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-lg font-semibold text-[#1D7B3C]">
                                {(admin.firstName?.charAt(0) || "")}{(admin.lastName?.charAt(0) || "")}
                            </span>

                        </div>
                        <div>
                            <p className="font-medium text-gray-900">
                                {admin.firstName} {admin.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{admin.email}</p>
                        </div>
                    </div>


                    {/* Permission Warning */}
                    <div className="mb-4 p-3 bg-[#DDEFE3] border  rounded-lg">
                        <p className="text-xs font-medium">
                            * Permission list will change when select the user group
                        </p>
                    </div>


                    {/* Role Selection */}
                    <div className="mb-3 w-full">
                        <Select value={selectedRole} onValueChange={handleRoleChange} >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent >
                                {adminRoles.map((role) => (
                                    <SelectItem key={role.value} value={role.value}>
                                        {role.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>



                    {/* Super Admin Notice */}
                    {/* {isSuperAdmin && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs text-blue-700">
                                Super Admin has all permissions by default.
                            </p>
                        </div>
                    )} */}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Permissions List */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Permissions
                        </label>
                        <div className="space-y-3">
                            {!isSuperAdmin ? (
                                allPermissions.map((permission) => {
                                    const isIncludedInRole = rolePermissions.includes(permission.id);
                                    const isSelected = selectedPermissions.includes(permission.id);

                                    return (
                                        <button
                                            key={permission.id}
                                            type="button"
                                            onClick={() => togglePermission(permission.id)}
                                            className={`w-full p-3 rounded-lg text-left transition-all ${isSelected
                                                ? ""
                                                : ""
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                {/* <div className="p-2 bg-[#D9D9D9]">
                                                    <div className="w-5 h-5 rounded-full bg-[#1D7B3C] flex items-center justify-center">
                                                        <span className="text-lg font-semibold text-[#1D7B3C]">
                                                            {""}
                                                        </span>
                                                    </div>
                                                </div> */}

                                                <div>
                                                    <p
                                                        className={`font-base text-sm ${isSelected ? "text-black" : "text-gray-900"
                                                            }`}
                                                    >
                                                        {permission.label}
                                                    </p>
                                                    <p className="text-xs text-[#808080] mt-1">
                                                        {permission.description}
                                                    </p>
                                                    {isIncludedInRole && (
                                                        <p className="text-xs text-green-600 mt-1">
                                                            • Included in {selectedRole.replace(/_/g, " ")}
                                                        </p>
                                                    )}
                                                </div>
                                                {/* Toggle Visual */}
                                                <div
                                                    className={`flex-shrink-0 w-10 h-5 rounded-full transition-colors ml-2 ${isSelected ? "bg-[#1D7B3C]" : "bg-gray-300"
                                                        }`}
                                                >
                                                    <div
                                                        className={`w-5 h-5 bg-white rounded-full transition-transform ${isSelected ? "translate-x-5" : "translate-x-0"
                                                            }`}
                                                    />
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="p-3  rounded-lg">
                                    <p className="text-sm text-gray-700 font-medium">
                                        ✓ All Permissions Granted
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Super Admin has access to all features
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className=" text-right bg-[#1D7B3C] text-white px-3 py-2 rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                        {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminPermissionsModal;
