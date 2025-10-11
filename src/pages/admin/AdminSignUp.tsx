// src/pages/admin/AdminSignup.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EyeOff, Eye } from "lucide-react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import { useAdminSignupMutation } from "@/redux/api/adminAuthApi";

const AdminSignup = () => {
    const navigate = useNavigate();
    const [adminSignup, { isLoading }] = useAdminSignupMutation();

    const [formData, setFormData] = useState({
        email: "",
        otp: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
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

        // Validation
        if (!formData.email || !formData.otp || !formData.password || !formData.firstName || !formData.lastName) {
            setError("Please fill in all fields");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        try {
            const result = await adminSignup({
                email: formData.email,
                otp: formData.otp,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
            }).unwrap();

            if (result.success) {
                setSuccess("Admin account created successfully! Redirecting to login...");
                setTimeout(() => {
                    navigate("/admin/login");
                }, 2000);
            } else {
                setError(result.message || "Signup failed");
            }
        } catch (error: any) {
            setError(error?.data?.message || "Failed to create admin account");
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
                    <h2 className="text-2xl md:text-3xl font-medium text-gray-900 text-center mb-6">
                        Admin Sign Up
                    </h2>

                    <p className="text-sm text-gray-600 text-center mb-4">
                        Enter the invitation code sent to your email
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={formData.firstName}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md outline-none placeholder:text-sm disabled:bg-gray-50"
                        />
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={formData.lastName}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md outline-none placeholder:text-sm disabled:bg-gray-50"
                        />
                    </div>

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md mb-3 outline-none placeholder:text-sm disabled:bg-gray-50"
                    />

                    <input
                        type="text"
                        name="otp"
                        placeholder="Invitation Code (OTP)"
                        value={formData.otp}
                        onChange={handleChange}
                        disabled={isLoading}
                        maxLength={6}
                        className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md mb-3 outline-none placeholder:text-sm disabled:bg-gray-50"
                    />

                    <div className="relative mb-3">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
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
                            placeholder="Confirm Password"
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
                        {isLoading ? <LoadingSpinner size="sm" /> : "Sign Up"}
                    </button>

                    <p className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <span
                            onClick={() => !isLoading && navigate("/admin/login")}
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
};

export default AdminSignup;