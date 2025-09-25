// src/pages/auth/ResetPassword.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "../../components/Footer";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useResetPasswordMutation } from "../../redux/api/authApi";

interface ResetFormData {
    resetCode: string;
    newPassword: string;
    confirmPassword: string;
}

type ErrorMessages = Record<string, string>;

export default function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const [resetPassword, { isLoading }] = useResetPasswordMutation();

    const email = location.state?.email;

    const [formData, setFormData] = useState<ResetFormData>({
        resetCode: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState<ErrorMessages>({});
    const [serverError, setServerError] = useState<string>("");

    useEffect(() => {
        if (!email) {
            navigate("/forgot-password");
        }
    }, [email, navigate]);

    const validate = (): boolean => {
        const newErrors: ErrorMessages = {};

        if (!formData.resetCode) newErrors.resetCode = "Reset code is required";
        else if (!/^\d{6}$/.test(formData.resetCode))
            newErrors.resetCode = "Reset code must be 6 digits";

        if (!formData.newPassword) newErrors.newPassword = "New password is required";
        else if (formData.newPassword.length < 8)
            newErrors.newPassword = "Password must be at least 8 characters";

        if (formData.newPassword !== formData.confirmPassword)
            newErrors.confirmPassword = "Passwords do not match";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ): void => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
        setServerError("");
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const result = await resetPassword({
                email,
                resetCode: parseInt(formData.resetCode),
                newPassword: formData.newPassword,
            }).unwrap();

            if (result.success) {
                // Show success message and redirect to login
                alert("Password reset successfully! Please login with your new password.");
                navigate("/login");
            } else {
                setServerError(result.message);
            }
        } catch (error: any) {
            setServerError(error?.data?.message || "Invalid or expired reset code");
        }
    };

    if (!email) return null;

    return (
        <section>
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md mx-4"
                >
                    <h2 className="text-2xl md:text-3xl font-medium text-gray-900 text-center mb-4">
                        Reset Password
                    </h2>

                    <p className="text-sm text-gray-600 text-center mb-6">
                        Enter the reset code sent to <strong>{email}</strong> and your new password
                    </p>

                    <input
                        type="text"
                        name="resetCode"
                        placeholder="Enter 6-digit reset code"
                        value={formData.resetCode}
                        onChange={handleChange}
                        disabled={isLoading}
                        maxLength={6}
                        className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md mb-3 outline-none placeholder:text-sm text-center text-lg tracking-widest disabled:bg-gray-50"
                    />
                    {errors.resetCode && (
                        <p className="text-red-500 text-xs mb-3">{errors.resetCode}</p>
                    )}

                    <input
                        type="password"
                        name="newPassword"
                        placeholder="New Password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md mb-3 outline-none placeholder:text-sm disabled:bg-gray-50"
                    />
                    {errors.newPassword && (
                        <p className="text-red-500 text-xs mb-3">{errors.newPassword}</p>
                    )}

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm New Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md mb-3 outline-none placeholder:text-sm disabled:bg-gray-50"
                    />
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mb-3">{errors.confirmPassword}</p>
                    )}

                    {serverError && (
                        <p className="text-red-500 text-sm mb-3 text-center">{serverError}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#1D7B3C] text-white py-2 rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? <LoadingSpinner size="sm" /> : "Reset Password"}
                    </button>

                    <p className="mt-4 text-center text-sm">
                        Didn't receive the code?{" "}
                        <span
                            onClick={() => !isLoading && navigate("/forgot-password")}
                            className="text-green-700 font-semibold cursor-pointer hover:underline"
                        >
                            Try Again
                        </span>
                    </p>
                </form>
            </div>
            <Footer />
        </section>
    );
}