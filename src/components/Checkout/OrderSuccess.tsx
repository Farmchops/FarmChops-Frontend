// src/pages/OrderSuccess.tsx
import React, { useEffect, useState, useCallback} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Package, AlertCircle } from "lucide-react";
import { useVerifyPaymentMutation } from "@/redux/api/orderApi";
import { useClearCartMutation } from "@/redux/api/cartApi";
import { dealsApi } from "@/redux/api/dealsApi";
import { useDispatch } from "react-redux";

const OrderSuccess: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const [verifyPayment, { isLoading }] = useVerifyPaymentMutation();
    const [clearCart] = useClearCartMutation();

    const [verificationState, setVerificationState] = useState<"verifying" | "success" | "error">("verifying");
    const [orderNumber, setOrderNumber] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");


    const handleVerifyPayment = useCallback(async (reference: string) => {
        try {
            const response = await verifyPayment(reference).unwrap();

            if (response.success && response.data) {
                setVerificationState("success");
                setOrderNumber(response.data.order.orderNumber);
                clearCart().catch(() => {});
                dispatch(dealsApi.util.invalidateTags([{ type: 'ActiveDeal', id: 'CURRENT' }]));
            } else {
                setVerificationState("error");
                setErrorMessage("Payment verification failed");
            }
        } catch (error: unknown) {
            console.error("Payment verification failed:", error);
            setVerificationState("error");
            const err = error as { data?: { message?: string } };
            setErrorMessage(err?.data?.message || "Failed to verify payment");
        }
    }, [verifyPayment, dispatch]);

    useEffect(() => {
        // Check if this is a wallet payment (has orderId instead of reference)
        const orderId = searchParams.get("orderId");
        const orderNumber = searchParams.get("orderNumber");

        if (orderId && orderNumber) {
            // Wallet payment - already completed, show success immediately
            setVerificationState("success");
            setOrderNumber(orderNumber);
            return;
        }

        // Paystack payment - needs verification
        const reference = searchParams.get("reference") || searchParams.get("trxref");

        if (!reference) {
            setVerificationState("error");
            setErrorMessage("No payment reference found");
            return;
        }

        handleVerifyPayment(reference);
    }, [searchParams, handleVerifyPayment]);

    // Verifying state
    if (verificationState === "verifying" || isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Verifying Payment...
                    </h2>
                    <p className="text-gray-600">
                        Please wait while we confirm your payment
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (verificationState === "error") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <div className="mb-6">
                        <AlertCircle className="mx-auto text-red-500" size={64} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Payment Verification Failed
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {errorMessage || "We couldn't verify your payment. Please contact support."}
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate("/orders")}
                            className="w-full px-6 py-3 bg-[#1D7B3C] text-white rounded-lg hover:bg-green-700 transition"
                        >
                            View My Orders
                        </button>
                        <button
                            onClick={() => navigate("/")}
                            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                {/* Success Icon */}
                <div className="mb-6">
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-green-600" size={48} />
                    </div>
                </div>

                {/* Success Message */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Payment Successful! 
                </h2>
                <p className="text-gray-600 mb-6">
                    Your order has been placed successfully
                </p>

                {/* Order Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Order Number:</span>
                        <span className="font-semibold text-gray-900">{orderNumber}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-[#1D7B3C] mt-3">
                        <Package size={16} />
                        <span>Order is being processed</span>
                    </div>
                </div>

                {/* Confirmation Message */}
                <div className="bg-green-50 border rounded-lg p-4 mb-6">
                    <p className="text-sm ">
                         A confirmation email has been sent to your email address with order details.
                    </p>
                </div>

                {/* Action Buttons */}
                                <div className="space-y-3">
                    <button
                        onClick={() => navigate("/profile/orders")}
                        className="w-full px-6 py-3 bg-[#1D7B3C] text-white rounded-lg hover:bg-green-700 transition font-medium"
                    >
                        View My Orders
                    </button>
                    <button
                        onClick={() => navigate("/products")}
                        className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                        Continue Shopping
                    </button>
                </div>


                {/* What's Next */}
                <div className="mt-8 pt-6 border-t">
                    <h3 className="font-semibold text-gray-900 mb-3">What's Next?</h3>
                    <div className="text-left space-y-2 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span>Your order is being prepared</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span>You'll receive shipping updates via email</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span>Track your order anytime from your orders page</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;