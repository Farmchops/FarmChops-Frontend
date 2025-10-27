// src/pages/Checkout.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetCartQuery } from "@/redux/api/cartApi";
import {
    useCheckoutMutation,
    useCreateOrderMutation,
} from "@/redux/api/orderApi";
import type { CheckoutResponse } from "@/types/orders";
import CartHero from "@/components/Cart/CartHero";
import Footer from "@/components/Footer";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const { data: cartData, isLoading: cartLoading } = useGetCartQuery();

    const [checkout] = useCheckoutMutation();
    const [createOrder] = useCreateOrderMutation();
    // const [verifyPayment] = useVerifyPaymentMutation();

    // Pre-fill form with user data
    const [formData, setFormData] = useState({
        name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "",
        phone: user?.phone || "",
        address: "",
        city: "",
        state: "",
        notes: "",
    });

    const [paymentMethod, setPaymentMethod] = useState<"paystack" | "pay_later">("paystack");
    const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);

    const cart = cartData?.cart;
    const totalItems = cartData?.cart?.totalItems || 0;
    const totalAmount = cartData?.cart?.totalAmount || 0;

    // Redirect if cart is empty
    useEffect(() => {
        if (!cart || cart.items.length === 0) {
            navigate("/cart");
        }
    }, [cart, navigate]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };


    // Step 1: Calculate Delivery Fee
    const handleCalculateDelivery = async () => {
        if (!formData.name || !formData.phone || !formData.address) {
            alert("Please fill in all required fields (Name, Phone, Address)");
            return;
        }

        setIsProcessing(true);

        try {
            const checkoutResponse = await checkout({
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
                notes: formData.notes,
            }).unwrap();

            if (checkoutResponse.success && checkoutResponse.data) {
                setCheckoutData(checkoutResponse.data);
                setShowDeliveryInfo(true); // ✅ reveal "Place Order"
            }
        } catch (error: any) {
            console.error("Delivery calculation failed:", error);
            alert(error?.data?.message || "Failed to calculate delivery fee. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };


    // Step 2: Create Order and Process Payment
    const handlePlaceOrder = async () => {
        if (!checkoutData) {
            alert("Please calculate delivery fee first");
            return;
        }

        // Extract city and state
        let city = formData.city;
        let state = formData.state;

        if (!city || !state) {
            const addressParts = formData.address.split(",").map(part => part.trim());
            if (addressParts.length >= 3) {
                city = city || addressParts[addressParts.length - 3];
                state = state || addressParts[addressParts.length - 2];
            }
        }

        try {
            const orderResponse = await createOrder({
                deliveryInfo: {
                    address: formData.address,
                    city: city,
                    state: state,
                    phoneNumber: formData.phone,
                },
                paymentMethod,
                deliveryFee: checkoutData.delivery.fee,
            }).unwrap();

            if (orderResponse.success && orderResponse.data) {
                const { order, payment } = orderResponse.data;

                if (paymentMethod === "paystack" && payment) {
                    // Redirect to Paystack
                    window.location.href = payment.authorizationUrl;
                } else if (paymentMethod === "pay_later") {
                    // Redirect to order details page
                    navigate(`/orders/${order._id}`);
                }
            }
        } catch (error: any) {
            console.error("Order creation failed:", error);
            alert(error?.data?.message || error?.message || "Order creation failed. Please try again.");
        }
    };



    // Loading state
    if (cartLoading || isProcessing) {
        return (
            <div>
                <CartHero />
                <section className="max-w-6xl min-h-[80vh] mx-auto py-10 px-4 my-10">
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    </div>
                </section>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <CartHero />
            <section className="max-w-6xl min-h-[60vh] mx-auto py-10 px-4">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-[#121212] mb-2">Order Review</h2>
                    <p className="text-[#737373]">
                        Complete your order - {totalItems} {totalItems === 1 ? "item" : "items"} in cart
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left - Delivery Information */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Delivery Info Form */}
                        <div className="border border-[#9FA5A3]/30 bg-green-100 rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">Delivery Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter your full name"
                                        className="w-full px-4 py-2 border- border-gray-300 rounded-lg focus:outline-none bg-white- placeholder:text-sm text-sm bg-green-50"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+234 812 345 6789"
                                        className="w-full px-4 py-2 border- border-gray-300 rounded-lg focus:outline-none bg-white- placeholder:text-sm text-sm bg-green-50"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Delivery Address *</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="E.g., Victoria Island, Lagos, Nigeria"
                                        className="w-full px-4 py-2 border- border-gray-300 rounded-lg focus:outline-none bg-white- placeholder:text-sm text-sm bg-green-50"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Include street, city, and state (e.g., "123 Main St, Victoria Island, Lagos")
                                    </p>
                                </div>

                                {/* Optional: Separate city/state fields */}
                                <div className="grid md:grid-cols-2 gap-4 hidden">
                                    <div >
                                        <label className="block text-sm font-medium mb-2">City (Optional)</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Lagos"
                                            className="w-full px-4 py-2 border- border-gray-300 rounded-lg focus:outline-none bg-white- placeholder:text-sm text-sm bg-green-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">State (Optional)</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Lagos"
                                            className="w-full px-4 py-3 border- border-gray-300 rounded-lg focus:outline-none   bg-white- placeholder:text-sm text-sm bg-green-50"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Delivery Notes (Optional)
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows={3}
                                        placeholder="E.g., Please deliver between 2-4 PM"
                                        className="w-full px-4 py-3 border- border-gray-300 rounded-lg focus:outline-none bg-white- placeholder:text-sm text-sm bg-green-50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="border border-[#9FA5A3]/30 bg-green-100 rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">Order Details</h3>
                            <div className="space-y-3">
                                {cart?.items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 bg-green-50 p-3 rounded">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-medium ">{item.name}</h4>
                                            <p className="text-sm text-gray-600">
                                                {item.quantity} {item.unit} × ₦{item.price.toLocaleString()}
                                            </p>
                                        </div>
                                        <p className="font-medium ">
                                            ₦{(item.price * item.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right - Order Summary & Payment */}
                    <div className="space-y-6">
                        <div className="border border-[#9FA5A3]/30 bg-green-100 rounded-lg p-6 sticky top-4">
                            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Items ({totalItems}):</span>
                                    <span className="font-medium">₦{totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping:</span>
                                    <span className="">
                                        {checkoutData ? `₦${checkoutData.delivery.fee.toLocaleString()}` : "To be calculated..."}
                                    </span>
                                </div>
                                {checkoutData && (
                                    <div className="text-xs text-gray-500">
                                        <p>Distance: {checkoutData.delivery.distanceText}</p>
                                        <p>Duration: {checkoutData.delivery.durationText}</p>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg border-t border-[#9FA5A3]/30 pt-3 mt-3">
                                    <span>Total:</span>
                                    <span className="text-[#1D7B3C]">
                                        ₦{checkoutData ? checkoutData.totals.grandTotal.toLocaleString() : totalAmount.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="mt-6">
                                <h4 className="font-semibold mb-3">Payment Method</h4>
                                <div className="space-y-2">
                                    <label className="flex items-center p-3  rounded-lg cursor-pointer transition bg-green-50">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="paystack"
                                            checked={paymentMethod === "paystack"}
                                            onChange={(e) => setPaymentMethod(e.target.value as "paystack")}
                                            className="mr-3 accent-[#1D7B3C]"
                                        />
                                        <div className="flex-1">
                                            <span className="font-medium-">Pay with Card/ Transfer</span>
                                            <p className="text-xs text-gray-500">Secure payment via Paystack</p>
                                        </div>
                                    </label>
                                    <label className="hidden flex items-center p-3 rounded-lg cursor-pointertransition bg-green-50">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="pay_later"
                                            checked={paymentMethod === "pay_later"}
                                            onChange={(e) => setPaymentMethod(e.target.value as "pay_later")}
                                            className="mr-3 accent-[#1D7B3C]"
                                        />
                                        <div className="flex-1 ">
                                            <span className="font-medium-">Pay Later</span>
                                            <p className="text-xs text-gray-500">Pay on delivery</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {!showDeliveryInfo ? (
                                // Step 1: Calculate Delivery Button
                                <button
                                    onClick={handleCalculateDelivery}
                                    disabled={isProcessing}
                                    className="w-full text-sm mt-6 bg-[#1D7B3C] text-white py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? "Calculating..." : "Calculate Delivery"}
                                </button>
                            ) : (
                                // Step 2: Place Order Button
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={isProcessing}
                                    className="w-full text-sm mt-6 bg-[#1D7B3C] text-white py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? "Processing..." : "Place Order"}
                                </button>
                            )}


                            <p className="text-xs text-gray-500 text-center mt-4">
                                By placing your order, you agree to our terms and conditions
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Checkout;


