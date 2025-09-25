// src/pages/auth/ForgotPassword.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useForgotPasswordMutation } from "../../redux/api/authApi";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

    const [email, setEmail] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email) {
            setError("Please enter your email address");
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        try {
            const result = await forgotPassword({ email }).unwrap();

            if (result.success) {
                setSuccess(true);
                setError("");
                // Navigate to reset password page after 2 seconds
                setTimeout(() => {
                    navigate("/reset-password", { state: { email } });
                }, 2000);
            } else {
                setError(result.message);
            }
        } catch (error: any) {
            setError(error?.data?.message || "Failed to send reset code. Please try again.");
        }
    };

    return (
        <section>
            <div className="flex items-center justify-center min-h-[80vh] bg-green-50">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md mx-4"
                >
                    <h2 className="text-2xl md:text-3xl font-medium text-gray-900 text-center mb-4">
                        Forgot Password
                    </h2>

                    {!success ? (
                        <>
                            <p className="text-sm text-gray-600 text-center mb-6">
                                Enter your email address and we'll send you a code to reset your password
                            </p>

                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError("");
                                }}
                                disabled={isLoading}
                                className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md mb-3 outline-none placeholder:text-sm disabled:bg-gray-50"
                            />

                            {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#1D7B3C] text-white py-2 rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-4"
                            >
                                {isLoading ? <LoadingSpinner size="sm" /> : "Send Reset Code"}
                            </button>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-green-600 font-medium mb-2">Reset code sent!</p>
                            <p className="text-sm text-gray-600 mb-4">
                                Check your email for the password reset code. Redirecting...
                            </p>
                        </div>
                    )}

                    <p className="text-center text-sm">
                        Remember your password?{" "}
                        <span
                            onClick={() => !isLoading && navigate("/login")}
                            className="text-green-700 font-semibold cursor-pointer hover:underline"
                        >
                            Login
                        </span>
                    </p>
                </form>
            </div>
            <Footer />
        </section>
    );
}