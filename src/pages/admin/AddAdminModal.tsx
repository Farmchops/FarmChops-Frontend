// src/pages/admin/AddAdminModal.tsx
import { useState, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAdminSendInviteMutation } from "@/redux/api/adminAuthApi";

interface AddAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}


const adminRoles = [
    { value: "admin", label: "Admin" },
    { value: "finance", label: "Finance" },
    { value: "inventory_officer", label: "Inventory Officer" },
    { value: "operations_officer", label: "Operations Officer" },
    { value: "logistics", label: "Logistics" },
    { value: "customer_support", label: "Customer Support" },
    { value: "rider", label: "Rider" },
];

export const AddAdminModal: React.FC<AddAdminModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [sendInvite, { isLoading }] = useAdminSendInviteMutation();

    const [formData, setFormData] = useState({
        email: "",
        adminRole: "inventory_officer",
    });
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                // fullName: "",
                email: "",
                adminRole: "inventory_officer",
            });
            setError("");
            setSuccess("");
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate full name (for UI only)
        // if (!formData.fullName.trim()) {
        //     setError("Full name is required.");
        //     return;
        // }

        // Validate email
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError("Valid email is required.");
            return;
        }

        try {
            // Call send-invite endpoint directly
            const result = await sendInvite({
                email: formData.email,
                adminRole: formData.adminRole,
            }).unwrap();

            if (result.success) {
                setSuccess(result.message || "Invitation sent successfully!");
                setFormData({ email: "", adminRole: "inventory_officer" });

                // Close modal after 2 seconds
                setTimeout(() => {
                    onClose();
                    if (onSuccess) onSuccess();
                }, 2000);
            }
        } catch (caughtError) {
            const apiMessage = (caughtError as { data?: { message?: string } })?.data?.message;
            setError(apiMessage || "Failed to send invitation.");
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            aria-modal="true"
            role="dialog"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isLoading) onClose();
            }}
        >
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl sm:rounded-md shadow-xl w-full sm:max-w-md p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-2xl font-semibold">Add new admin</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Send an invitation to a new admin user
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        aria-label="Close"
                        className="hover:text-gray-700 ml-4 text-xl disabled:opacity-50"
                    >
                        ✕
                    </button>
                </div>

                {/* Full Name - For UI reference only, not sent to backend */}
                {/* <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none  focus:border-transparent"
                        placeholder="Enter full name"
                        disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        For your reference only
                    </p>
                </div> */}

                {/* Email */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">E-mail address *</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-transparent"
                        placeholder="admin@example.com"
                        disabled={isLoading}
                    />
                </div>

                {/* Admin Role */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">User Group *</label>
                    <Select
                        value={formData.adminRole}
                        onValueChange={(value) => {
                            setFormData((prev) => ({ ...prev, adminRole: value }));
                            setError("");
                            setSuccess("");
                        }}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select admin role" />
                        </SelectTrigger>
                        <SelectContent>
                            {adminRoles.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-600">
                        {success}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-60 transition-colors"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-[#1D7B3C] text-white rounded text-sm hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <svg
                                    className="animate-spin h-4 w-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Sending...
                            </>
                        ) : (
                            "Invite user"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddAdminModal;