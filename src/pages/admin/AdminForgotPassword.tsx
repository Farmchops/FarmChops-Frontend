// src/pages/admin/AdminForgotPassword.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ArrowLeft } from "lucide-react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import { useAdminForgotPasswordMutation } from "@/redux/api/adminAuthApi";

const AdminForgotPassword = () => {
    const navigate = useNavigate();
    const [forgotPassword, { isLoading }] = useAdminForgotPasswordMutation();

    const [email, setEmail] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email) {
            setError("Please enter your email address");
            return;
        }

        try {
            const result = await forgotPassword({ email }).unwrap();

            if (result.success) {
                setSuccess("Password reset code sent to your email. Redirecting...");
                setTimeout(() => {
                    navigate("/admin/reset-password", { state: { email } });
                }, 2000);
            } else {
                setError(result.message || "Failed to send reset code");
            }
        } catch (err: unknown) {
            console.error('Forgot password error:', err);
            setError('Failed to send reset code. Please try again.');
        }
    };

    return (
        <section>
            <Navbar />
            <div className="flex items-center justify-center min-h-[80vh] bg-green-50">
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
                        Forgot Password
                    </h2>
                    <p className="text-sm text-gray-600 text-center mb-6">
                        Enter your email address and we'll send you a reset code
                    </p>

                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setError("");
                            setSuccess("");
                        }}
                        disabled={isLoading}
                        className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md mb-3 outline-none placeholder:text-sm disabled:bg-gray-50"
                    />

                    {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
                    {success && <p className="text-green-600 text-sm mb-3 text-center">{success}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#1D7B3C] text-white py-2 rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? <LoadingSpinner size="sm" /> : "Send Reset Code"}
                    </button>
                </form>
            </div>
            <Footer />
        </section>
    );
};

export default AdminForgotPassword;