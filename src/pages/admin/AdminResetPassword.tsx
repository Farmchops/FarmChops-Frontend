// src/pages/admin/AdminResetPassword.tsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EyeOff, Eye, ArrowLeft } from "lucide-react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import { useAdminResetPasswordMutation } from "@/redux/api/adminAuthApi";

const AdminResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [resetPassword, { isLoading }] = useAdminResetPasswordMutation();

    const emailFromState = location.state?.email || "";

    const [formData, setFormData] = useState({
        email: emailFromState,
        resetCode: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.email || !formData.resetCode || !formData.newPassword) {
            setError("Please fill in all fields");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.newPassword.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        try {
            const result = await resetPassword({
                email: formData.email,
                resetCode: formData.resetCode,
                newPassword: formData.newPassword,
            }).unwrap();

            if (result.success) {
                setSuccess("Password reset successfully! Redirecting to login...");
                setTimeout(() => {
                    navigate("/admin/login");
                }, 2000);
            } else {
                setError(result.message || "Failed to reset password");
            }
        } catch (error: any) {
            setError(error?.data?.message || "Failed to reset password. Please try again.");
        }
    };

    return (
        <section>
            <Navbar />
            <div className="flex items-center justify-center min-h-[80vh] bg-green-50 py-8">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md mx-4"
                >
                    <button
                        type="button"
                        onClick={() => navigate("/admin/login")}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm">Back to Login</span>
                    </button>

                    <h2 className="text-2xl md:text-3xl font-medium text-gray-900 text-center mb-2">
                        Reset Password
                    </h2>
                    <p className="text-sm text-gray-600 text-center mb-6">
                        Enter the code sent to your email and your new password
                    </p>

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md mb-3 outline-none placeholder:text-sm disabled:bg-gray-50"
                    />

                    <input
                        type="text"
                        name="resetCode"
                        placeholder="Reset Code"
                        value={formData.resetCode}
                        onChange={handleChange}
                        disabled={isLoading}
                        maxLength={6}
                        className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md mb-3 outline-none placeholder:text-sm disabled:bg-gray-50"
                    />

                    <div className="relative mb-3">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="newPassword"
                            placeholder="New Password"
                            value={formData.newPassword}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md outline-none placeholder:text-sm disabled:bg-gray-50 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute text-xs right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <EyeOff className="font-light" /> : <Eye className="font-light" />}
                        </button>
                    </div>

                    <div className="relative mb-3">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Confirm New Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md outline-none placeholder:text-sm disabled:bg-gray-50 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute text-xs right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showConfirmPassword ? <EyeOff className="font-light" /> : <Eye className="font-light" />}
                        </button>
                    </div>

                    {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
                    {success && <p className="text-green-600 text-sm mb-3 text-center">{success}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#1D7B3C] text-white py-2 rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? <LoadingSpinner size="sm" /> : "Reset Password"}
                    </button>
                </form>
            </div>
            <Footer />
        </section>
    );
};

export default AdminResetPassword;