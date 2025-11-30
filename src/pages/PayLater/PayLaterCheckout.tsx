// src/pages/PayLater/PayLaterCheckout.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import {
    useGetPayLaterCartQuery,
    usePayLaterCheckoutMutation,
    useGetPayLaterStatusQuery
} from '@/redux/api/paylaterApi';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

interface DeliveryAddress {
    street: string;
    city: string;
    state: string;
    phone: string;
}

interface FormErrors {
    street?: string;
    city?: string;
    state?: string;
    phone?: string;
}

const PayLaterCheckout = () => {
    const navigate = useNavigate();

    const { data: statusData } = useGetPayLaterStatusQuery();
    const { data: cartData, isLoading } = useGetPayLaterCartQuery();
    const [checkout, { isLoading: isCheckingOut }] = usePayLaterCheckoutMutation();

    const [address, setAddress] = useState<DeliveryAddress>({
        street: '',
        city: '',
        state: '',
        phone: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const [orderSuccess, setOrderSuccess] = useState<{
        orderId: string;
        totalAmount: number;
        dueDate: string;
    } | null>(null);

    const cart = cartData?.data?.cart;
    const availableCredit = statusData?.data?.account?.availableCredit ?? 0;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!address.street.trim()) {
            newErrors.street = 'Street address is required';
        }
        if (!address.city.trim()) {
            newErrors.city = 'City is required';
        }
        if (!address.state.trim()) {
            newErrors.state = 'State is required';
        }
        if (!address.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^(\+234|0)[0-9]{10}$/.test(address.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Please enter a valid Nigerian phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCheckoutError(null);

        if (!validateForm()) return;

        try {
            const result = await checkout({ deliveryAddress: address }).unwrap();
            setOrderSuccess({
                orderId: result.data.order.orderId,
                totalAmount: result.data.order.totalAmount,
                dueDate: result.data.order.dueDate,
            });
        } catch (err) {
            const error = err as { data?: { message?: string } };
            setCheckoutError(error.data?.message || 'Failed to place order. Please try again.');
        }
    };

    const nigerianStates = [
        'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
        'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
        'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
        'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
        'Yobe', 'Zamfara'
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Order Success
    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-lg mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
                        <p className="text-gray-600 mb-6">
                            Your PayLater order has been confirmed. The amount will be deducted from your salary via IPPIS.
                        </p>

                        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Order ID</span>
                                    <span className="font-mono font-medium">{orderSuccess.orderId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Amount</span>
                                    <span className="font-bold text-[#1D7B3C]">{formatCurrency(orderSuccess.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Payment Due</span>
                                    <span className="font-medium">{formatDate(new Date(orderSuccess.dueDate))}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
                            <p className="text-sm text-blue-800">
                                <strong>What happens next?</strong><br />
                                Your order will be processed and delivered to your address. Payment of {formatCurrency(orderSuccess.totalAmount)} will be automatically deducted from your salary within 30 days.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/paylater')}
                                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                            >
                                View Status
                            </button>
                            <button
                                onClick={() => navigate('/orders')}
                                className="flex-1 py-3 px-4 bg-[#1D7B3C] text-white rounded-lg font-medium hover:bg-green-700 transition"
                            >
                                Track Order
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // No cart or empty cart
    if (!cart || cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-lg mx-auto text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                    <p className="text-gray-600 mb-4">Add items to your cart before checkout</p>
                    <button
                        onClick={() => navigate('/paylater/shop')}
                        className="bg-[#1D7B3C] text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
                    >
                        Browse Products
                    </button>
                </div>
            </div>
        );
    }

    // Cart exceeds credit
    if (cart.totalAmount > availableCredit) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-lg mx-auto">
                    <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Insufficient Credit</h2>
                        <p className="text-gray-600 mb-4">
                            Your cart total ({formatCurrency(cart.totalAmount)}) exceeds your available credit ({formatCurrency(availableCredit)}).
                        </p>
                        <button
                            onClick={() => navigate('/paylater/cart')}
                            className="bg-[#1D7B3C] text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
                        >
                            Modify Cart
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/paylater/cart')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">PayLater Checkout</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Delivery Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit}>
                            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <MapPin className="w-5 h-5 text-[#1D7B3C]" />
                                    <h3 className="font-bold text-gray-900">Delivery Address</h3>
                                </div>

                                {checkoutError && (
                                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                        <p className="text-sm text-red-700">{checkoutError}</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                                            Street Address
                                        </label>
                                        <input
                                            type="text"
                                            id="street"
                                            name="street"
                                            value={address.street}
                                            onChange={handleInputChange}
                                            placeholder="123 Main Street, Apartment 4B"
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/20 focus:border-[#1D7B3C] ${
                                                errors.street ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.street && <p className="mt-1 text-sm text-red-600">{errors.street}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                id="city"
                                                name="city"
                                                value={address.city}
                                                onChange={handleInputChange}
                                                placeholder="Lagos"
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/20 focus:border-[#1D7B3C] ${
                                                    errors.city ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            />
                                            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                                                State
                                            </label>
                                            <select
                                                id="state"
                                                name="state"
                                                value={address.state}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/20 focus:border-[#1D7B3C] bg-white ${
                                                    errors.state ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            >
                                                <option value="">Select state</option>
                                                {nigerianStates.map(state => (
                                                    <option key={state} value={state}>{state}</option>
                                                ))}
                                            </select>
                                            {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={address.phone}
                                            onChange={handleInputChange}
                                            placeholder="+234 800 000 0000"
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/20 focus:border-[#1D7B3C] ${
                                                errors.phone ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* PayLater Agreement */}
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <CreditCard className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-amber-800">PayLater Agreement</p>
                                        <p className="text-sm text-amber-700 mt-1">
                                            By placing this order, you agree that {formatCurrency(cart.totalAmount)} will be automatically deducted from your salary via IPPIS by {formatDate(dueDate)}.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button - Mobile */}
                            <button
                                type="submit"
                                disabled={isCheckingOut}
                                className="lg:hidden w-full py-4 bg-[#1D7B3C] text-white rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isCheckingOut ? (
                                    <>
                                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Placing Order...
                                    </>
                                ) : (
                                    `Place Order - ${formatCurrency(cart.totalAmount)}`
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
                            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>

                            {/* Items */}
                            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                                {cart.items.map((item) => (
                                    <div key={item.productId} className="flex gap-3">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-12 h-12 object-cover rounded-lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-medium">{formatCurrency(item.paylaterPrice * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">{formatCurrency(cart.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Delivery</span>
                                    <span className="font-medium">{formatCurrency(cart.estimatedDelivery)}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-2 flex justify-between">
                                    <span className="font-bold text-gray-900">Total</span>
                                    <span className="font-bold text-[#1D7B3C] text-lg">{formatCurrency(cart.totalAmount)}</span>
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                                <p><strong>Payment due:</strong> {formatDate(dueDate)}</p>
                                <p className="mt-1">Automatic deduction via IPPIS</p>
                            </div>

                            {/* Submit Button - Desktop */}
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isCheckingOut}
                                className="hidden lg:flex w-full mt-4 py-3 bg-[#1D7B3C] text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center gap-2"
                            >
                                {isCheckingOut ? (
                                    <>
                                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Placing Order...
                                    </>
                                ) : (
                                    'Place Order'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayLaterCheckout;
