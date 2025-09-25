// src/pages/auth/Register.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useSignupMutation } from "../../redux/api/authApi";

interface RegisterFormData {
    email: string;
    acceptTerms: boolean;
}

type ErrorMessages = Record<string, string>;

export default function Register() {
    const navigate = useNavigate();
    const [signup, { isLoading }] = useSignupMutation();

    const [formData, setFormData] = useState<RegisterFormData>({
        email: "",
        acceptTerms: false,
    });

    const [errors, setErrors] = useState<ErrorMessages>({});
    const [serverError, setServerError] = useState<string>("");

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
            const result = await signup({ email: formData.email }).unwrap();

            if (result.success) {
                // Navigate to verification page with email
                navigate("/verify-email", { state: { email: formData.email } });
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
                        className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md mb-3 outline-none placeholder:text-sm disabled:bg-gray-50"
                    />
                    {errors.email && <p className="text-red-500 text-xs mb-3">{errors.email}</p>}

                    <div className="flex items-center mb-3 mt-2">
                        <input
                            type="checkbox"
                            name="acceptTerms"
                            checked={formData.acceptTerms}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="mr-2 text-[#666666]"
                        />
                        <label className="text-sm text-[#666666]">Accept all Terms & Conditions</label>
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