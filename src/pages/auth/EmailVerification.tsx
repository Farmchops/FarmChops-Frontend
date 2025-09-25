// src/pages/auth/EmailVerification.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "../../components/Footer";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useCompleteSignupMutation } from "../../redux/api/authApi";
// import { useCompleteSignupMutation } from "../../store/api/authApi";

interface VerificationFormData {
    verificationCode: string;
    password: string;
    confirmPassword: string;
}

type ErrorMessages = Record<string, string>;

export default function EmailVerification() {
    const navigate = useNavigate();
    const location = useLocation();
    const [completeSignup, { isLoading }] = useCompleteSignupMutation();

    const email = location.state?.email;

    const [formData, setFormData] = useState<VerificationFormData>({
        verificationCode: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState<ErrorMessages>({});
    const [serverError, setServerError] = useState<string>("");

    useEffect(() => {
        if (!email) {
            navigate("/register");
        }
    }, [email, navigate]);

    const validate = (): boolean => {
        const newErrors: ErrorMessages = {};

        if (!formData.verificationCode) newErrors.verificationCode = "Verification code is required";
        else if (!/^\d{6}$/.test(formData.verificationCode))
            newErrors.verificationCode = "Verification code must be 6 digits";

        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 8)
            newErrors.password = "Password must be at least 8 characters";

        if (formData.password !== formData.confirmPassword)
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
            const result = await completeSignup({
                email,
                verificationCode: formData.verificationCode,
                password: formData.password,
            }).unwrap();

            if (result.success) {
                // User is now logged in via RTK mutation, navigate to profile completion
                navigate("/complete-profile");
            } else {
                setServerError(result.message);
            }
        } catch (error: any) {
            setServerError(error?.data?.message || "Invalid or expired verification code");
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
                        Verify Your Email
                    </h2>

                    <p className="text-sm text-gray-600 text-center mb-6">
                        We sent a verification code to <strong>{email}</strong>
                    </p>

                    <input
                        type="text"
                        name="verificationCode"
                        placeholder="Enter 6-digit code"
                        value={formData.verificationCode}
                        onChange={handleChange}
                        disabled={isLoading}
                        maxLength={6}
                        className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md mb-3 outline-none placeholder:text-sm text-center text-lg tracking-widest disabled:bg-gray-50"
                    />
                    {errors.verificationCode && (
                        <p className="text-red-500 text-xs mb-3">{errors.verificationCode}</p>
                    )}

                    <input
                        type="password"
                        name="password"
                        placeholder="Create Password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md mb-3 outline-none placeholder:text-sm disabled:bg-gray-50"
                    />
                    {errors.password && (
                        <p className="text-red-500 text-xs mb-3">{errors.password}</p>
                    )}

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
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
                        {isLoading ? <LoadingSpinner size="sm" /> : "Verify & Create Account"}
                    </button>

                    <p className="mt-4 text-center text-sm">
                        Didn't receive the code?{" "}
                        <span
                            onClick={() => !isLoading && navigate("/register")}
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