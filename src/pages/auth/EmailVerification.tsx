// src/pages/auth/EmailVerification.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
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
    const [showPasswordFields, setShowPasswordFields] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

    useEffect(() => {
        if (!email) {
            navigate("/register");
        }
    }, [email, navigate]);

    const validateCode = (): boolean => {
        const newErrors: ErrorMessages = {};

        if (!formData.verificationCode) newErrors.verificationCode = "Verification code is required";
        else if (!/^\d{6}$/.test(formData.verificationCode))
            newErrors.verificationCode = "Verification code must be 6 digits";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validatePassword = (): boolean => {
        const newErrors: ErrorMessages = {};

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

    // Step 1: Validate and proceed to password creation
    const handleVerifyCode = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateCode()) return;

        // Code format is valid, show password fields
        setShowPasswordFields(true);
        setServerError("");
    };

    // Step 2: Create account with code and password
    const handleCreateAccount = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validatePassword()) return;

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
            const errorMsg = error?.data?.message || "Failed to create account";
            setServerError(errorMsg);

            // If code is invalid, go back to code entry
            if (errorMsg.toLowerCase().includes("code") || errorMsg.toLowerCase().includes("verification")) {
                setShowPasswordFields(false);
            }
        }
    };

    if (!email) return null;

    return (
        <section>
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                {!showPasswordFields ? (
                    // Step 1: Verify Code
                    <form
                        onSubmit={handleVerifyCode}
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
                            className="w-full py-3 px-4 border border-[#E6E6E6] focus:border-[#1D7B3C] rounded-md mb-3 outline-none placeholder:text-sm text-center text-xl tracking-[0.5em] disabled:bg-gray-50 font-semibold"
                        />
                        {errors.verificationCode && (
                            <p className="text-red-500 text-xs mb-3">{errors.verificationCode}</p>
                        )}

                        {serverError && (
                            <p className="text-red-500 text-sm mb-3 text-center">{serverError}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#1D7B3C] text-white py-3 rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                        >
                            {isLoading ? <LoadingSpinner size="sm" /> : "Continue"}
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
                ) : (
                    // Step 2: Create Password
                    <form
                        onSubmit={handleCreateAccount}
                        className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md mx-4"
                    >
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-2">
                                Email Verified!
                            </h2>
                            <p className="text-sm text-gray-600">
                                Now create a password for your account
                            </p>
                        </div>

                        <div className="relative mb-3">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Create Password"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="w-full py-2 px-3 pr-10 border border-[#E6E6E6] focus:border-[#1D7B3C] rounded-md outline-none placeholder:text-sm disabled:bg-gray-50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-xs mb-3">{errors.password}</p>
                        )}

                        <div className="relative mb-3">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="w-full py-2 px-3 pr-10 border border-[#E6E6E6] focus:border-[#1D7B3C] rounded-md outline-none placeholder:text-sm disabled:bg-gray-50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-xs mb-3">{errors.confirmPassword}</p>
                        )}

                        {serverError && (
                            <p className="text-red-500 text-sm mb-3 text-center">{serverError}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#1D7B3C] text-white py-3 rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium mb-3"
                        >
                            {isLoading ? <LoadingSpinner size="sm" /> : "Create Account"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowPasswordFields(false)}
                            disabled={isLoading}
                            className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                        >
                            Change Code
                        </button>
                    </form>
                )}
            </div>
            <Footer />
        </section>
    );
}