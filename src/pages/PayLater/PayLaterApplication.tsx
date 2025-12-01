// src/pages/PayLater/PayLaterApplication.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Shield, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useSubmitApplicationMutation } from '@/redux/api/paylaterApi';

interface FormData {
    email: string;
    firstName: string;
    lastName: string;
    gender: 'male' | 'female' | '';
    phoneNumber: string;
    bvn: string;
    nin: string;
}

interface FormErrors {
    email?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    phoneNumber?: string;
    bvn?: string;
    nin?: string;
}

const PayLaterApplication = () => {
    const navigate = useNavigate();
    const [submitApplication, { isLoading }] = useSubmitApplicationMutation();

    const [step, setStep] = useState<'intro' | 'form'>('intro');
    const [formData, setFormData] = useState<FormData>({
        email: '',
        firstName: '',
        lastName: '',
        gender: '',
        phoneNumber: '',
        bvn: '',
        nin: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.gender) {
            newErrors.gender = 'Please select your gender';
        }

        if (!formData.phoneNumber) {
            newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^(\+234|0)[0-9]{10}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
            newErrors.phoneNumber = 'Please enter a valid Nigerian phone number';
        }

        if (!formData.bvn) {
            newErrors.bvn = 'BVN is required';
        } else if (!/^[0-9]{11}$/.test(formData.bvn)) {
            newErrors.bvn = 'BVN must be 11 digits';
        }

        if (!formData.nin) {
            newErrors.nin = 'NIN is required';
        } else if (!/^[0-9]{11}$/.test(formData.nin)) {
            newErrors.nin = 'NIN must be 11 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        if (!validateForm()) return;

        try {
            await submitApplication({
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                gender: formData.gender as 'male' | 'female',
                phoneNumber: formData.phoneNumber,
                bvn: formData.bvn,
                nin: formData.nin,
            }).unwrap();

            setSubmitSuccess(true);
        } catch (err) {
            const error = err as { data?: { message?: string } };
            setSubmitError(error.data?.message || 'Failed to submit application. Please try again.');
        }
    };

    if (submitSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-lg mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
                        <p className="text-gray-600 mb-6">
                            Your PayLater application has been received. A member of our team will contact you soonest to review your details and notify you via email once your application is processed.
                        </p>
                        <button
                            onClick={() => navigate('/paylater')}
                            className="bg-[#1D7B3C] text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
                        >
                            View Application Status
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'intro') {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1D7B3C]/10 rounded-full mb-4">
                            <CreditCard className="w-8 h-8 text-[#1D7B3C]" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">PayLater</h1>
                        <p className="text-gray-600">Shop now and pay later with automatic salary deduction</p>
                    </div>

                    {/* Info Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">How PayLater Works</h2>

                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-[#1D7B3C]/10 rounded-full flex items-center justify-center text-[#1D7B3C] font-semibold text-sm">
                                    1
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Apply for PayLater</h3>
                                    <p className="text-sm text-gray-600">Fill out the application form with your personal and verification details</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-[#1D7B3C]/10 rounded-full flex items-center justify-center text-[#1D7B3C] font-semibold text-sm">
                                    2
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Get Approved</h3>
                                    <p className="text-sm text-gray-600">Our team verifies your details and assigns you a credit limit</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-[#1D7B3C]/10 rounded-full flex items-center justify-center text-[#1D7B3C] font-semibold text-sm">
                                    3
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Shop on Credit</h3>
                                    <p className="text-sm text-gray-600">Browse products and checkout without paying upfront</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-[#1D7B3C]/10 rounded-full flex items-center justify-center text-[#1D7B3C] font-semibold text-sm">
                                    4
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Automatic Repayment</h3>
                                    <p className="text-sm text-gray-600">Payment is automatically deducted from your salary via IPPIS within a month</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                            <Shield className="w-6 h-6 text-[#1D7B3C] mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-900">Secure & Verified</p>
                            <p className="text-xs text-gray-500">BVN & NIN verification</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                            <Clock className="w-6 h-6 text-[#1D7B3C] mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-900">30 Days to Pay</p>
                            <p className="text-xs text-gray-500">Flexible repayment period</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                            <CreditCard className="w-6 h-6 text-[#1D7B3C] mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-900">Up to ₦500,000</p>
                            <p className="text-xs text-gray-500">Based on your eligibility</p>
                        </div>
                    </div>

                    {/* Notice */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-amber-800 font-medium">Important Notice</p>
                                <p className="text-sm text-amber-700">You can only have one active PayLater purchase at a time.</p>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={() => setStep('form')}
                        className="w-full bg-[#1D7B3C] text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                        Apply for PayLater
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-xl mx-auto">
                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#1D7B3C] text-white rounded-full flex items-center justify-center text-sm font-medium">
                            1
                        </div>
                        <span className="text-sm font-medium text-[#1D7B3C]">Personal Info</span>
                    </div>
                    <div className="w-8 h-px bg-gray-300" />
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
                            2
                        </div>
                        <span className="text-sm text-gray-500">Review</span>
                    </div>
                    <div className="w-8 h-px bg-gray-300" />
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
                            3
                        </div>
                        <span className="text-sm text-gray-500">Complete</span>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900">PayLater Application</h2>
                        <p className="text-sm text-gray-600">Fill in your details to apply for PayLater credit</p>
                    </div>

                    {submitError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-700">{submitError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Personal Info Section */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Personal Information</h3>

                            <div className="space-y-4">
                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter your email"
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/20 focus:border-[#1D7B3C] ${
                                            errors.email ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                </div>

                                {/* Name Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            placeholder="First name"
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/20 focus:border-[#1D7B3C] ${
                                                errors.firstName ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            placeholder="Last name"
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/20 focus:border-[#1D7B3C] ${
                                                errors.lastName ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                                    </div>
                                </div>

                                {/* Gender & Phone Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                                            Gender
                                        </label>
                                        <select
                                            id="gender"
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/20 focus:border-[#1D7B3C] bg-white ${
                                                errors.gender ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        >
                                            <option value="">Select gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                        {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleInputChange}
                                            placeholder="+234 800 000 0000"
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/20 focus:border-[#1D7B3C] ${
                                                errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Verification Section */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Verification Details</h3>
                            <p className="text-xs text-gray-500 mb-3">Required for eligibility verification</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="bvn" className="block text-sm font-medium text-gray-700 mb-1">
                                        BVN
                                    </label>
                                    <input
                                        type="text"
                                        id="bvn"
                                        name="bvn"
                                        value={formData.bvn}
                                        onChange={handleInputChange}
                                        placeholder="11-digit BVN"
                                        maxLength={11}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/20 focus:border-[#1D7B3C] ${
                                            errors.bvn ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.bvn && <p className="mt-1 text-sm text-red-600">{errors.bvn}</p>}
                                </div>
                                <div>
                                    <label htmlFor="nin" className="block text-sm font-medium text-gray-700 mb-1">
                                        NIN
                                    </label>
                                    <input
                                        type="text"
                                        id="nin"
                                        name="nin"
                                        value={formData.nin}
                                        onChange={handleInputChange}
                                        placeholder="11-digit NIN"
                                        maxLength={11}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/20 focus:border-[#1D7B3C] ${
                                            errors.nin ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.nin && <p className="mt-1 text-sm text-red-600">{errors.nin}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-600">
                                By submitting this application, you agree to our Terms of Service and authorize FarmChops to verify your identity using the provided BVN and NIN. Your information is securely stored and will only be used for PayLater eligibility verification.
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setStep('intro')}
                                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 py-3 px-4 bg-[#1D7B3C] text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Application'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PayLaterApplication;
