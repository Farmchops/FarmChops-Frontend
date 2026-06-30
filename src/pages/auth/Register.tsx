// src/pages/auth/Register.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
import Footer from "../../components/Footer";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useSignupMutation } from "../../redux/api/authApi";
import { useValidateReferralCodeMutation } from "../../redux/api/marketersApi";

interface RegisterFormData {
    email: string;
    referralCode: string;
    acceptTerms: boolean;
}

type ErrorMessages = Record<string, string>;

export default function Register() {
    const navigate = useNavigate();
    const [signup, { isLoading }] = useSignupMutation();
    const [validateReferralCode, { isLoading: isValidatingCode }] = useValidateReferralCodeMutation();

    const location = useLocation();
    const from = (location.state as any)?.from?.pathname || "/";

    const [formData, setFormData] = useState<RegisterFormData>({
        email: "",
        referralCode: "",
        acceptTerms: false,
    });

    const [errors, setErrors] = useState<ErrorMessages>({});
    const [serverError, setServerError] = useState<string>("");
    const [referralValidation, setReferralValidation] = useState<{
        isValid: boolean;
        marketerName?: string;
        message?: string;
    } | null>(null);

    // Validate referral code with debounce
    useEffect(() => {
        if (formData.referralCode.trim() === "") {
            setReferralValidation(null);
            return;
        }

        // Debounce validation
        const timer = setTimeout(async () => {
            try {
                const result = await validateReferralCode({
                    referralCode: formData.referralCode.trim().toUpperCase()
                }).unwrap();

                if (result.success && result.data) {
                    setReferralValidation(result.data);
                }
            } catch (error) {
                setReferralValidation({
                    isValid: false,
                    message: "Unable to validate code"
                });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.referralCode, validateReferralCode]);

    const validate = (): boolean => {
        const newErrors: ErrorMessages = {};

        if (!formData.email) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email))
            newErrors.email = "Email is invalid";

        if (!formData.acceptTerms)
            newErrors.acceptTerms = "You must accept terms & conditions";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ): void => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
        setServerError("");
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const payload: any = { email: formData.email };

            // Include referral code if provided and valid
            if (formData.referralCode.trim() && referralValidation?.isValid) {
                payload.referralCode = formData.referralCode.trim().toUpperCase();
            }

            const result = await signup(payload).unwrap();

            if (result.success) {
                // Navigate to verification page with email
                navigate("/verify-email", { state: { email: formData.email, from } });
            } else {
                setServerError(result.message);
            }
        } catch (error: any) {
            setServerError(error?.data?.message || "Something went wrong. Please try again.");
        }
    };

    return (
        <section>
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md mx-4"
                >
                    <h2 className="text-2xl md:text-3xl font-medium text-gray-900 text-center mb-6">
                        Create Account
                    </h2>

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#1D7B3C] rounded-md mb-3 outline-none placeholder:text-sm disabled:bg-gray-50"
                    />
                    {errors.email && <p className="text-red-500 text-xs mb-3">{errors.email}</p>}

                    {/* Referral Code Field */}
                    <div className="mb-3">
                        <label className="block text-sm text-gray-700 mb-1">
                            Referral Code <span className="text-gray-400">(Optional)</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="referralCode"
                                placeholder="Enter referral code"
                                value={formData.referralCode}
                                onChange={(e) => {
                                    const value = e.target.value.toUpperCase();
                                    setFormData((prev) => ({ ...prev, referralCode: value }));
                                }}
                                disabled={isLoading}
                                maxLength={12}
                                className="w-full py-2 px-3 pr-10 border border-[#E6E6E6] focus:border-[#1D7B3C] rounded-md outline-none placeholder:text-sm disabled:bg-gray-50 uppercase"
                            />
                            {isValidatingCode && formData.referralCode && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <LoadingSpinner size="sm" />
                                </div>
                            )}
                            {!isValidatingCode && formData.referralCode && referralValidation && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {referralValidation.isValid ? (
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-500" />
                                    )}
                                </div>
                            )}
                        </div>
                        {!isValidatingCode && formData.referralCode && referralValidation && (
                            <div className="mt-1">
                                {referralValidation.isValid && referralValidation.marketerName ? (
                                    <p className="text-xs text-green-600 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" />
                                        Referred by {referralValidation.marketerName}
                                    </p>
                                ) : (
                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                        <XCircle className="w-3 h-3" />
                                        {referralValidation.message || "Invalid referral code"}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center mb-3 mt-2">
                        <input
                            type="checkbox"
                            name="acceptTerms"
                            checked={formData.acceptTerms}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="mr-2 text-[#666666]"
                        />
                        <label className="text-sm text-[#666666]">
                            Accept all{" "}
                            <span
                                onClick={() => window.open("/terms", "_blank")}
                                className="text-[#1D7B3C] font-semibold cursor-pointer hover:underline"
                            >
                                Terms & Conditions
                            </span>
                        </label>
                    </div>
                    {errors.acceptTerms && (
                        <p className="text-red-500 text-sm mb-3">{errors.acceptTerms}</p>
                    )}

                    {serverError && (
                        <p className="text-red-500 text-sm mb-3 text-center">{serverError}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#1D7B3C] text-white py-2 rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? <LoadingSpinner size="sm" /> : "Send Verification Code"}
                    </button>

                    <p className="mt-4 text-center text-sm">
                        Already have an account?{" "}
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