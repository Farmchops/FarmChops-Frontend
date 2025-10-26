// src/pages/admin/AdminManagement.tsx
import { useState } from "react";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { UserCog, CheckCircle, XCircle, Edit2, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";
import {
    useGetAdminsQuery,
    useUpdateAdminRoleMutation,
    useUpdateAdminPermissionsMutation,
    useUpdateAdminStatusMutation,
    useDeleteAdminMutation
} from "@/redux/api/adminManagementApi";
import useAdminPermissions from "@/hooks/useAdminPermission";
import type { RootState } from "@/redux/store";
import type { AdminUser } from "@/redux/api/adminAuthApi";
import AddAdminModal from "./AddAdminModal";
import { AdminPermissionsModal } from "./AdminManagementPermission";
import graph from "@/assets/admin/graph.png";
import { alertService } from "@/lib/alertService";

const AdminManagement = () => {
    const { data, isLoading, error, refetch } = useGetAdminsQuery();
    const [updateRole] = useUpdateAdminRoleMutation();
    const [updatePermissions] = useUpdateAdminPermissionsMutation();
    const [updateStatus] = useUpdateAdminStatusMutation();
    const [deleteAdmin] = useDeleteAdminMutation();

    const currentUser = useSelector((state: RootState) => state.adminAuth.user);
    const { isSuperAdmin: hasSuperAdminPermission } = useAdminPermissions();

    const [showAddAdminModal, setShowAddAdminModal] = useState(false);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    console.log(hasSuperAdminPermission());

    const handlePermissionsUpdate = async (data: { adminRole: string; permissions: string[] }) => {
        if (!selectedAdmin) return;

        try {
            setActionLoading("permissions");

            // First update the role
            await updateRole({
                id: selectedAdmin.id,
                body: { adminRole: data.adminRole },
            }).unwrap();

            // Then update the permissions
            await updatePermissions({
                id: selectedAdmin.id,
                body: { permissions: data.permissions },
            }).unwrap();

            setShowPermissionsModal(false);
            setSelectedAdmin(null);
            refetch();
        } catch (error) {
            console.error("Failed to update admin:", error);
            throw error;
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleStatus = async (adminId: string, currentStatus: boolean) => {
        if (currentUser?.id === adminId) {
            // alert("You cannot deactivate your own account");
            alertService.show({
                type: "error",
                title: "Account Activation",
                message: "You cannot deactivate your own account"
            });
            return;
        }

        try {
            setActionLoading(adminId);
            await updateStatus({
                id: adminId,
                body: { isActive: !currentStatus },
            }).unwrap();
            refetch();
        } catch (error) {
            console.error("Failed to update admin status:", error);
            // alert("Failed to update admin status");
            alertService.show({
                type: "error",
                title: "Admin Status",
                message: "Failed to update admin status"
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteAdmin = async (admin: AdminUser) => {
        if (currentUser?.id === admin.id) {
            alertService.show({
                type: "error",
                title: "Account Deletion",
                message: "You cannot delete your own account"
            });
            // alert("You cannot delete your own account");
            return;
        }

        if (admin.adminRole === "super_admin") {
            // alert("You cannot delete a Super Admin account");
            alertService.show({
                type: "error",
                title: "Account Deletion",
                message: "You cannot delete a Super Admin account"
            });
            return;
        }

        const confirmed = confirm(
            `Are you sure you want to delete ${admin.firstName} ${admin.lastName}? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setActionLoading(`delete-${admin.id}`);
            await deleteAdmin(admin.id).unwrap();
            refetch();
            // alert("Admin deleted successfully");
            alertService.show({
                type: "success",
                title: "Account Deletion",
                message: "Admin deleted successfully"
            });
            
        } catch (error) {
            console.error("Failed to delete admin:", error);
            // alert("Failed to delete admin");
            alertService.show({
                type: "error",
                title: "Account Deletion",
                message: "Failed to delete admin"
            });
            
        } finally {
            setActionLoading(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-600 p-8">
                Failed to load admins. Please try again.
            </div>
        );
    }

    const admins = data?.data?.admins || [];

    // Calculate stats
    const totalAdmins = admins.length;
    const activeAdmins = admins.filter((admin: AdminUser) => admin.isActive).length;
    const inactiveAdmins = totalAdmins - activeAdmins;

    const stats = [
        {
            title: "Total Admins",
            value: totalAdmins,
            change: "100%"
        },
        {
            title: "Active Admins",
            value: activeAdmins,
            change: totalAdmins > 0 ? Math.round((activeAdmins / totalAdmins) * 100) + "%" : "0%"
        },
        {
            title: "Inactive Admins",
            value: inactiveAdmins,
            change: totalAdmins > 0 ? Math.round((inactiveAdmins / totalAdmins) * 100) + "%" : "0%"
        }
    ];

    return (
        <div className="py-6 mt-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold">Admin Management</h1>
                    <p className="text-sm text-gray-700 mt-1">
                        Manage all admin accounts and permissions
                    </p>
                </div>
                {hasSuperAdminPermission() && (
                    <button
                        onClick={() => setShowAddAdminModal(true)}
                        className="bg-[#1D7B3C] text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors "
                    >
                        + Add Admin
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((item, idx) => (
                    <div key={idx} className="bg-white shadow rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[#8E95A9] text-sm">{item.title}</span>
                                <span className="text-2xl font-bold text-[#1C2A53]">{item.value}</span>
                            </div>
                            <div className="flex flex-col items-center justify-between">
                                <span className="flex items-center text-[#FF8901] text-sm font-medium">
                                    {item.change}
                                </span>
                                <img src={graph} alt="graph" className="mt-2" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!hasSuperAdminPermission && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                        You have limited permissions. Contact a Super Admin to manage admin accounts.
                    </p>
                </div>
            )}

            {/* Table Container with Horizontal Scroll */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr className="text-[#687182] text-sm">
                                <th className="p-3 text-left font-medium whitespace-nowrap">#</th>
                                <th className="p-3 text-left font-medium whitespace-nowrap">Fullname</th>
                                <th className="p-3 text-left font-medium whitespace-nowrap">Email</th>
                                <th className="p-3 text-left font-medium whitespace-nowrap">Role</th>
                                <th className="p-3 text-left font-medium whitespace-nowrap">Status</th>
                                {hasSuperAdminPermission() && (
                                    <th className="p-3 text-left font-medium whitespace-nowrap">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {admins.map((admin: AdminUser, idx: number) => (
                                <tr key={admin.id} className="hover:bg-gray-50">
                                    <td className="p-3">{idx + 1}</td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {admin.firstName} {admin.lastName}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="text-xs text-gray-600">{admin.email}</div>
                                    </td>
                                    <td className="p-3">
                                        <span className="inline-flex items-center gap-1 rounded-full text-xs font-medium">
                                            {admin.adminRole?.replace(/_/g, " ").toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {admin.isActive ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                                                <CheckCircle className="h-3 w-3" />
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 whitespace-nowrap">
                                                <XCircle className="h-3 w-3" />
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    {hasSuperAdminPermission() && (
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedAdmin(admin);
                                                        setShowPermissionsModal(true);
                                                    }}
                                                    disabled={actionLoading === "permissions" || admin.adminRole === "super_admin"}
                                                    className="p-2 hover:text-[#1D7B3C] hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Edit permissions"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(admin.id, admin.isActive)}
                                                    disabled={
                                                        actionLoading === admin.id ||
                                                        currentUser?.id === admin.id ||
                                                        admin.adminRole === "super_admin"
                                                    }
                                                    className={`px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${admin.isActive
                                                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                                                        : "bg-green-100 text-green-700 hover:bg-green-200"
                                                        }`}
                                                >
                                                    {actionLoading === admin.id ? (
                                                        <LoadingSpinner size="sm" />
                                                    ) : admin.isActive ? (
                                                        "Deactivate"
                                                    ) : (
                                                        "Activate"
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAdmin(admin)}
                                                    disabled={
                                                        actionLoading === `delete-${admin.id}` ||
                                                        currentUser?.id === admin.id ||
                                                        admin.adminRole === "super_admin"
                                                    }
                                                    className="p-2 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Delete admin"
                                                >
                                                    {actionLoading === `delete-${admin.id}` ? (
                                                        <LoadingSpinner size="sm" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {admins.length === 0 && (
                    <div className="text-center py-12">
                        <UserCog className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No admins found</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by inviting a new admin.</p>
                    </div>
                )}
            </div>

            {/* Add Admin Modal */}
            <AddAdminModal
                isOpen={showAddAdminModal}
                onClose={() => setShowAddAdminModal(false)}
            />

            {/* User Permissions Modal */}
            <AdminPermissionsModal
                isOpen={showPermissionsModal}
                admin={selectedAdmin}
                onClose={() => {
                    setShowPermissionsModal(false);
                    setSelectedAdmin(null);
                }}
                onSubmit={handlePermissionsUpdate}
                isLoading={actionLoading === "permissions"}
            />
        </div>
    );
};

export default AdminManagement;