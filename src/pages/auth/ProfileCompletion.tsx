// src/pages/auth/ProfileCompletion.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Footer from "../../components/Footer";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useUpdateProfileMutation } from "../../redux/api/authApi";
import type { RootState } from "../../redux/store";
import { HybridAddressInput } from "@/components/Checkout/HybridAddressInput";


interface ProfileFormData {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
}

type ErrorMessages = Record<string, string>;

// Error typing helpers for safer unknown error handling
interface ApiErrorData { message?: string }
interface ApiError { data?: ApiErrorData; message?: string }
const getErrorMessage = (e: unknown, fallback: string): string => {
    if (typeof e === 'object' && e !== null) {
        const maybe = e as Partial<ApiError>;
        if (maybe.data && typeof maybe.data === 'object' && typeof maybe.data.message === 'string') {
            return maybe.data.message;
        }
        if (typeof maybe.message === 'string') return maybe.message;
    }
    return fallback;
};

const GOOGLE_API_KEY = 'AIzaSyA8z6nFDQAVB7blbyRiKXU8ooksT72-cu4';
const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string | undefined) ?? import.meta.env.VITE_API_BASE_URL;
const ADDRESS_SEARCH_ENDPOINT = `${API_BASE_URL.replace(/\/$/, '')}/addresses/search`;


const loadGoogleMapsScript = (apiKey?: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!apiKey) {
            reject(new Error("Google Maps API key not provided"));
            return;
        }

        const existing = document.getElementById("google-maps-script");
        if (existing) {
            existing.addEventListener("load", () => resolve());
            existing.addEventListener("error", () => reject(new Error("Google Maps script failed to load")));
            return;
        }

        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&libraries=places&v=weekly`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Google Maps script failed to load"));
        document.head.appendChild(script);
    });
};

export default function ProfileCompletion() {
    const navigate = useNavigate();
    const { isAuthenticated, user, profileComplete } = useSelector((state: RootState) => state.auth);
    const [updateProfile, { isLoading }] = useUpdateProfileMutation();

    const [formData, setFormData] = useState<ProfileFormData>({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        phone: user?.phone || "",
        address: user?.profile?.address || "",
    });


    console.log("isAuthenticated",isAuthenticated);
    console.log("user", user);
    console.log("ProfileComplete", profileComplete)


    const [errors, setErrors] = useState<ErrorMessages>({});
    const [serverError, setServerError] = useState<string>("");

        useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        } else if (profileComplete) {
            navigate("/products");
        }
    }, [isAuthenticated, profileComplete, navigate]);

    // Preload Google Places for address autocomplete
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                await loadGoogleMapsScript(GOOGLE_API_KEY);
                if (!mounted) return;
                // Optional: console.log("Google Maps loaded for ProfileCompletion");
            } catch (err) {
                console.error("Failed to load Google Maps script:", err);
            }
        })();
        return () => { mounted = false; };
    }, []);


    const validate = (): boolean => {
        const newErrors: ErrorMessages = {};

        if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

        if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
        else if (!/^(\+234|0)[789]\d{9}$/.test(formData.phone.replace(/\s/g, '')))
            newErrors.phone = "Please enter a valid Nigerian phone number";

        if (!formData.address.trim()) newErrors.address = "Address is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
            const result = await updateProfile(formData).unwrap();

            if (result.success) {
                navigate("/products");
            } else {
                setServerError(result.message);
            }
                } catch (error: unknown) {
            setServerError(getErrorMessage(error, "Failed to update profile. Please try again."));
        }

    };

    if (!isAuthenticated) return null;

    return (
        <section>
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md mx-4"
                >
                    <h2 className="text-2xl md:text-3xl font-medium text-gray-900 text-center mb-4">
                        Complete Your Profile
                    </h2>

                    <p className="text-sm text-gray-600 text-center mb-6">
                        Please provide your details to complete your account setup
                    </p>

                    <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md mb-3 outline-none placeholder:text-sm disabled:bg-gray-50"
                    />
                    {errors.firstName && (
                        <p className="text-red-500 text-xs mb-3">{errors.firstName}</p>
                    )}

                    <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md mb-3 outline-none placeholder:text-sm disabled:bg-gray-50"
                    />
                    {errors.lastName && (
                        <p className="text-red-500 text-xs mb-3">{errors.lastName}</p>
                    )}

                    <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number (e.g., 08012345678)"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md mb-3 outline-none placeholder:text-sm disabled:bg-gray-50"
                    />
                    {errors.phone && (
                        <p className="text-red-500 text-xs mb-3">{errors.phone}</p>
                    )}

                                        <HybridAddressInput
                        value={formData.address}
                        onAddressChange={(value) => {
                            setFormData(prev => ({ ...prev, address: value }));
                            if (errors.address) setErrors(prev => ({ ...prev, address: "" }));
                            setServerError("");
                        }}
                        onAddressSelect={(details) => {
                            setFormData(prev => ({ ...prev, address: details.fullAddress }));
                        }}
                        googleApiKey={GOOGLE_API_KEY}
                        customApiEndpoint={ADDRESS_SEARCH_ENDPOINT}
                        placeholder="Search your address (e.g., Wuse 2, Jabi, Gwarinpa)..."
                        disabled={isLoading}
                    />
                    {errors.address && (
                        <p className="text-red-500 text-xs mb-3">{errors.address}</p>
                    )}


                    {serverError && (
                        <p className="text-red-500 text-sm mb-3 text-center">{serverError}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#1D7B3C] text-white py-2 rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? <LoadingSpinner size="sm" /> : "Complete Profile"}
                    </button>
                </form>
            </div>
            <Footer />
        </section>
    );
}
