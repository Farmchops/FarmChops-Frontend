// src/pages/Checkout.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGetCartQuery } from "@/redux/api/cartApi";
import {
    useCheckoutMutation,
    useCreateOrderMutation,
} from "@/redux/api/orderApi";
import { useGetWalletBalanceQuery, useCreatePaymentLinkMutation } from "@/redux/api/walletApi";
import type { CheckoutResponse } from "@/types/orders";
import type { CreatePaymentLinkResponse } from "@/types/wallet";
import { Wallet, AlertCircle, Link2, Copy, Check, Share2, X, Loader2 } from "lucide-react";


// Google Maps types (for TypeScript)
interface GoogleMapsAutocomplete {
    getPlace: () => GooglePlaceResult;
    addListener: (event: string, callback: () => void) => void;
}

interface GooglePlaceResult {
    formatted_address?: string;
    address_components?: GoogleAddressComponent[];
    geometry?: unknown;
    place_id?: string;
}
import CartHero from "@/components/Cart/CartHero";
import Footer from "@/components/Footer";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { HybridAddressInput } from "@/components/Checkout/HybridAddressInput";

const GOOGLE_API_KEY = 'AIzaSyA8z6nFDQAVB7blbyRiKXU8ooksT72-cu4';

const loadGoogleMapsScript = (apiKey?: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!apiKey) {
            reject(new Error("Google Maps API key not provided"));
            return;
        }

        // avoid loading twice
        const windowWithGoogle = window as typeof window & {
            google?: {
                maps?: unknown;
            };
        };
        if (windowWithGoogle.google?.maps) {
            resolve();
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

// Google Maps type interfaces
interface GoogleAddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
}

interface GooglePlace {
    formatted_address?: string;
    address_components?: GoogleAddressComponent[];
}

// Helper to read address components returned by Places API
const parseAddressComponents = (place: GooglePlace) => {
    // default empty values
    const components: { [k: string]: string } = {
        street_number: "",
        route: "",
        locality: "", // city
        sublocality: "",
        administrative_area_level_1: "", // state
        country: "",
        postal_code: "",
    };

    if (!place || !place.address_components) return components;

    place.address_components.forEach((c: GoogleAddressComponent) => {
        const types = c.types;
        if (types.includes("street_number")) components.street_number = c.long_name;
        if (types.includes("route")) components.route = c.long_name;
        if (types.includes("locality")) components.locality = c.long_name;
        if (types.includes("sublocality") || types.includes("sublocality_level_1")) components.sublocality = c.long_name;
        if (types.includes("administrative_area_level_1")) components.administrative_area_level_1 = c.long_name;
        if (types.includes("country")) components.country = c.long_name;
        if (types.includes("postal_code")) components.postal_code = c.long_name;
    });

    return components;
};

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const { data: cartData, isLoading: cartLoading } = useGetCartQuery();

    const [checkout] = useCheckoutMutation();
    const [createOrder] = useCreateOrderMutation();
    const { data: walletData, isLoading: walletLoading } = useGetWalletBalanceQuery();
    const [createPaymentLink, { isLoading: creatingPaymentLink }] = useCreatePaymentLinkMutation();

    // Pay-for-Me modal state
    const [showPayForMeModal, setShowPayForMeModal] = useState(false);
    const [payForMeLink, setPayForMeLink] = useState<CreatePaymentLinkResponse | null>(null);
    const [payForMeCopied, setPayForMeCopied] = useState(false);

    // Pre-fill form with user data
    const [formData, setFormData] = useState({
        name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "",
        phone: user?.phone || "",
        address: "",
        city: "",
        state: "",
        notes: "",
    });

    const addressRef = useRef<HTMLInputElement | null>(null);
    const autocompleteRef = useRef<GoogleMapsAutocomplete | null>(null);

    const [paymentMethod, setPaymentMethod] = useState<"paystack" | "wallet" | "pay_later">("paystack");

    // Wallet data
    const walletBalance = walletData?.data?.balance ?? 0;
    const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);

    const cart = cartData?.cart;
    const totalItems = cartData?.cart?.totalItems || 0;
    const totalAmount = cartData?.cart?.totalAmount || 0;

    // Redirect if cart is empty
    useEffect(() => {
        if (!cart || cart.items.length === 0) {
            navigate("/cart");
        }
    }, [cart, navigate]);


    // Initialize Google Autocomplete
    useEffect(() => {
        let mounted = true;

        const initAutocomplete = async () => {
            try {
                console.log("🔄 Loading Google Maps script...");
                await loadGoogleMapsScript(GOOGLE_API_KEY);

                if (!mounted) return;

                // Small delay to ensure ref is attached
                await new Promise(resolve => setTimeout(resolve, 100));

                if (!addressRef.current) {
                    console.error("❌ Address input ref not found");
                    return;
                }

                const googleMaps = (window as typeof window & { google?: { maps?: { places?: unknown } } }).google;

                if (!googleMaps?.maps?.places) {
                    console.error("❌ Google Maps Places library not loaded");
                    return;
                }

                if (autocompleteRef.current) {
                    console.log("⚠️ Autocomplete already initialized");
                    return;
                }

                console.log("✅ Initializing autocomplete...");

                // create autocomplete bound to the address input
                // Using type assertion since Google Maps is loaded dynamically
                const googleWindow = window as typeof window & {
                    google: {
                        maps: {
                            places: {
                                Autocomplete: new (element: HTMLInputElement, options: unknown) => GoogleMapsAutocomplete;
                            };
                        };
                    };
                };

                autocompleteRef.current = new googleWindow.google.maps.places.Autocomplete(addressRef.current, {
                    types: ["geocode"], // More flexible than "address"
                    componentRestrictions: { country: 'ng' },
                    fields: ['formatted_address', 'address_components', 'geometry', 'place_id']
                });

                console.log("✅ Autocomplete initialized successfully");

                // When user selects an address
                autocompleteRef.current.addListener("place_changed", async () => {
                    const place = autocompleteRef.current?.getPlace();
                    if (!place) return;
                    console.log("📍 Place selected:", place);

                    if (!place || !place.formatted_address) {
                        console.warn("⚠️ No formatted address");
                        return;
                    }

                    // parse components to city/state
                    const parsed = parseAddressComponents(place);

                    const updatedFormData = {
                        name: formData.name,
                        phone: formData.phone,
                        address: place.formatted_address,
                        city: parsed.locality || parsed.sublocality || formData.city,
                        state: parsed.administrative_area_level_1 || formData.state,
                        notes: formData.notes,
                    };

                    setFormData(updatedFormData);

                    // Auto-calculate delivery fee after address selection
                    if (updatedFormData.name && updatedFormData.phone && updatedFormData.address) {
                        console.log("🔄 Auto-calculating delivery fee...");
                        setIsCalculatingDelivery(true);

                        try {
                            const checkoutResponse = await checkout({
                                name: updatedFormData.name,
                                phone: updatedFormData.phone,
                                address: updatedFormData.address,
                                notes: updatedFormData.notes,
                            }).unwrap();

                            if (checkoutResponse.success && checkoutResponse.data) {
                                setCheckoutData(checkoutResponse.data);
                                console.log("✅ Delivery fee calculated:", checkoutResponse.data.delivery.fee);
                            }
                        } catch (error) {
                            console.error("❌ Auto-delivery calculation failed:", error);
                        } finally {
                            setIsCalculatingDelivery(false);
                        }
                    }
                });
            } catch (err) {
                console.error("❌ Google Maps autocomplete failed:", err);
            }
        };

        initAutocomplete();

        return () => {
            mounted = false;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });

        // If address changes, reset delivery calculation
        if (name === "address" || name === "city" || name === "state") {
            setCheckoutData(null);
        }
    };

    // Place Order - Create Order and Process Payment
        const handlePlaceOrder = async () => {
        // Validation
        if (!formData.name || !formData.phone || !formData.address) {
            alert("Please fill in all required fields (Name, Phone, Address)");
            return;
        }

        setIsProcessing(true);

        try {
            // If delivery not calculated yet, calculate it now
            if (!checkoutData) {
                console.log("🔄 Calculating delivery fee before order placement...");
                const checkoutResponse = await checkout({
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    notes: formData.notes,
                }).unwrap();

                if (!checkoutResponse.success || !checkoutResponse.data) {
                    throw new Error("Failed to calculate delivery fee");
                }

                setCheckoutData(checkoutResponse.data);

                // Continue with the calculated data
                await createOrderWithDeliveryFee(checkoutResponse.data);
            } else {
                // Use existing delivery calculation
                await createOrderWithDeliveryFee(checkoutData);
            }
        } catch (error: unknown) {
            console.error("Order placement failed:", error);
            const errorMessage = error && typeof error === 'object' && 'data' in error
                ? (error as { data?: { message?: string } }).data?.message
                : error && typeof error === 'object' && 'message' in error
                ? (error as { message?: string }).message
                : "Order placement failed. Please try again.";
            alert(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    // Helper function to create order with delivery fee
        const createOrderWithDeliveryFee = async (deliveryData: CheckoutResponse) => {
        if (!deliveryData) {
            throw new Error("Delivery data not available");
        }

        // Extract city and state robustly
        let city = (formData.city || "").trim();
        let state = (formData.state || "").trim();

        if (!city || !state) {
            const parts = formData.address.split(",").map(p => p.trim()).filter(Boolean);
            if (parts.length >= 2) {
                const last = parts[parts.length - 1];
                const prev = parts[parts.length - 2];
                // If last token is 'Nigeria', assume state is prev and city is also prev if unknown
                if (/nigeria/i.test(last)) {
                    state = state || prev;
                    city = city || prev;
                } else {
                    // Fallback: use last as state and prev as city
                    state = state || last;
                    city = city || prev;
                }
            }
        }

        if (!city || !state) {
            throw new Error("Delivery information (city/state) could not be determined. Please include city and state in the address.");
        }

        // Include cart items in the order payload, with dealId/tierName if present
        const items = (cart?.items ?? []).map(item => ({
            productId: item.productId,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
            unit: item.unit,
            priceType: item.priceType,
            minQuantity: item.minQuantity,
            dealId: item.dealId,
            tierName: item.tierName,
            multiplier: item.multiplier,
        }));

        const orderResponse = await createOrder({
            deliveryInfo: {
                address: formData.address,
                city,
                state,
                phoneNumber: formData.phone,
            },
            paymentMethod,
            deliveryFee: deliveryData.delivery.fee ?? 0,
            notes: formData.notes || undefined,
            items,
        }).unwrap();

        if (orderResponse.success && orderResponse.data) {
            const { order, payment } = orderResponse.data;

            if (paymentMethod === "paystack" && payment) {
                // Redirect to Paystack
                window.location.href = payment.authorizationUrl;
            } else if (paymentMethod === "wallet") {
                // Wallet payment - backend debits wallet and marks order as paid immediately
                // Show success page with order details
                navigate(`/order/success/wallet?orderId=${order._id}&orderNumber=${order.orderNumber}`);
            } else if (paymentMethod === "pay_later") {
                // Redirect to order details page
                navigate(`/orders/${order._id}`);
            }
        }
    };

    // Handle Pay-for-Me - Create payment link with current order details
    const handlePayForMe = async () => {
        // Need delivery fee calculated first
        if (!checkoutData) {
            alert("Please enter your delivery address first to calculate the total amount.");
            return;
        }

        try {
            // Build description from cart items
            const itemNames = cart?.items.map(item => item.name).slice(0, 3).join(", ") || "Order";
            const description = cart?.items.length && cart.items.length > 3
                ? `${itemNames} and ${cart.items.length - 3} more items`
                : itemNames;

            const response = await createPaymentLink({
                amount: checkoutData.totals.grandTotal,
                description: `Help me pay for: ${description}`,
                expiresInDays: 7,
            }).unwrap();

            if (response.success && response.data) {
                setPayForMeLink(response.data);
                setShowPayForMeModal(true);
            }
        } catch (err: unknown) {
            const errorMsg = err && typeof err === 'object' && 'data' in err
                ? (err as { data?: { message?: string } }).data?.message
                : 'Failed to create payment link';
            alert(errorMsg || 'Failed to create payment link');
        }
    };

    // Copy payment link
    const handleCopyPayForMeLink = async () => {
        if (!payForMeLink) return;
        try {
            await navigator.clipboard.writeText(payForMeLink.shareableUrl);
            setPayForMeCopied(true);
            setTimeout(() => setPayForMeCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Share payment link
    const handleSharePayForMeLink = async () => {
        if (!payForMeLink) return;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Help me pay for my order',
                    text: payForMeLink.description,
                    url: payForMeLink.shareableUrl,
                });
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    handleCopyPayForMeLink();
                }
            }
        } else {
            handleCopyPayForMeLink();
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
                                    <label htmlFor="checkout-name" className="block text-sm font-medium mb-2">Full Name *</label>
                                    <input
                                        id="checkout-name"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter your full name"
                                        autoComplete="name"
                                        className="w-full px-4 py-3 md:py-2 border- border-gray-300 rounded-lg focus:outline-none bg-white- placeholder:text-sm text-sm bg-green-50"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="checkout-phone" className="block text-sm font-medium mb-2">Phone Number *</label>
                                    <input
                                        id="checkout-phone"
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+234 812 345 6789"
                                        autoComplete="tel"
                                        className="w-full px-4 py-3 md:py-2 border- border-gray-300 rounded-lg focus:outline-none bg-white- placeholder:text-sm text-sm bg-green-50"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="checkout-address" className="block text-sm font-medium mb-2">Delivery Address *</label>
                                    <HybridAddressInput
                                        value={formData.address}
                                        onAddressChange={(address) => {
                                            setFormData(prev => ({ ...prev, address }));
                                            setCheckoutData(null); // Reset delivery calculation
                                        }}
                                        onAddressSelect={async (addressDetails) => {
                                            // Update form with selected address details
                                            setFormData(prev => ({
                                                ...prev,
                                                address: addressDetails.fullAddress,
                                                city: addressDetails.city || prev.city,
                                                state: addressDetails.state || prev.state,
                                            }));

                                            // Auto-calculate delivery if all required fields are filled
                                            if (formData.name && formData.phone && addressDetails.fullAddress) {
                                                console.log("🔄 Auto-calculating delivery fee...");
                                                setIsCalculatingDelivery(true);

                                                try {
                                                    const checkoutResponse = await checkout({
                                                        name: formData.name,
                                                        phone: formData.phone,
                                                        address: addressDetails.fullAddress,
                                                        notes: formData.notes,
                                                    }).unwrap();

                                                    if (checkoutResponse.success && checkoutResponse.data) {
                                                        setCheckoutData(checkoutResponse.data);
                                                        console.log("✅ Delivery fee calculated:", checkoutResponse.data.delivery.fee);
                                                    }
                                                } catch (error) {
                                                    console.error("❌ Auto-delivery calculation failed:", error);
                                                } finally {
                                                    setIsCalculatingDelivery(false);
                                                }
                                            }
                                        }}
                                        googleApiKey={GOOGLE_API_KEY}
                                        customApiEndpoint="/api/addresses/search"
                                        placeholder="Search: Wuse 2, Gwarinpa, Jabi, etc..."
                                    />
                                </div>

                                {/* Optional: Separate city/state fields */}
                                <div className="grid md:grid-cols-2 gap-4 hidden">
                                    <div>
                                        <label htmlFor="checkout-city" className="block text-sm font-medium mb-2">City (Optional)</label>
                                        <input
                                            id="checkout-city"
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Lagos"
                                            autoComplete="address-level2"
                                            className="w-full px-4 py-2 border- border-gray-300 rounded-lg focus:outline-none bg-white- placeholder:text-sm text-sm bg-green-50"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="checkout-state" className="block text-sm font-medium mb-2">State (Optional)</label>
                                        <input
                                            id="checkout-state"
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Lagos"
                                            autoComplete="address-level1"
                                            className="w-full px-4 py-3 border- border-gray-300 rounded-lg focus:outline-none   bg-white- placeholder:text-sm text-sm bg-green-50"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="checkout-notes" className="block text-sm font-medium mb-2">
                                        Delivery Notes (Optional)
                                    </label>
                                    <textarea
                                        id="checkout-notes"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows={3}
                                        placeholder="E.g., Please deliver between 2-4 PM"
                                        autoComplete="off"
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
                                    <span className="font-medium">
                                        {isCalculatingDelivery ? (
                                            <span className="text-gray-400">Calculating...</span>
                                        ) : checkoutData ? (
                                            <span className="text-green-600">₦{checkoutData.delivery.fee.toLocaleString()}</span>
                                        ) : (
                                            <span className="text-gray-400">Enter address</span>
                                        )}
                                    </span>
                                </div>
                                {checkoutData && !isCalculatingDelivery && (
                                    <div className="text-xs text-gray-500 animate-fade-in">
                                        <p>📍 Distance: {checkoutData.delivery.distanceText}</p>
                                        <p>🕒 Duration: {checkoutData.delivery.durationText}</p>
                                    </div>
                                )}
                                {checkoutData && checkoutData.totals.tax !== undefined && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tax (7.5%):</span>
                                        <span className="font-medium">₦{checkoutData.totals.tax.toLocaleString()}</span>
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
                                    {/* Wallet Payment Option */}
                                    <label className={`flex items-center p-3 rounded-lg cursor-pointer transition ${paymentMethod === "wallet" ? "bg-green-100 border-2 border-[#1D7B3C]" : "bg-green-50 border-2 border-transparent"}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="wallet"
                                            checked={paymentMethod === "wallet"}
                                            onChange={(e) => setPaymentMethod(e.target.value as "wallet")}
                                            className="mr-3 accent-[#1D7B3C]"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Wallet className="w-4 h-4 text-[#1D7B3C]" />
                                                <span className="font-medium">Pay with Wallet</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Balance: {walletLoading ? "Loading..." : `₦${walletBalance.toLocaleString()}`}
                                            </p>
                                            {checkoutData && walletBalance < checkoutData.totals.grandTotal && (
                                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Insufficient balance
                                                </p>
                                            )}
                                        </div>
                                    </label>

                                    {/* Card/Transfer Payment */}
                                    <label className={`flex items-center p-3 rounded-lg cursor-pointer transition ${paymentMethod === "paystack" ? "bg-green-100 border-2 border-[#1D7B3C]" : "bg-green-50 border-2 border-transparent"}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="paystack"
                                            checked={paymentMethod === "paystack"}
                                            onChange={(e) => setPaymentMethod(e.target.value as "paystack")}
                                            className="mr-3 accent-[#1D7B3C]"
                                        />
                                        <div className="flex-1">
                                            <span className="font-medium">Pay with Card/Transfer</span>
                                            <p className="text-xs text-gray-500">Secure payment via Paystack</p>
                                        </div>
                                    </label>

                                    {/* Pay-for-Me Link */}
                                    <button
                                        type="button"
                                        onClick={handlePayForMe}
                                        disabled={creatingPaymentLink || !checkoutData}
                                        className="w-full flex items-center p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {creatingPaymentLink ? (
                                            <Loader2 className="w-4 h-4 text-purple-600 mr-3 animate-spin" />
                                        ) : (
                                            <Link2 className="w-4 h-4 text-purple-600 mr-3" />
                                        )}
                                        <div className="flex-1">
                                            <span className="font-medium text-purple-900">Pay-for-Me</span>
                                            <p className="text-xs text-purple-600">
                                                {checkoutData
                                                    ? `Create a ₦${checkoutData.totals.grandTotal.toLocaleString()} payment link`
                                                    : "Enter address first to create link"
                                                }
                                            </p>
                                        </div>
                                    </button>

                                    <label className="hidden flex items-center p-3 rounded-lg cursor-pointer transition bg-green-50">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="pay_later"
                                            checked={paymentMethod === "pay_later"}
                                            onChange={(e) => setPaymentMethod(e.target.value as "pay_later")}
                                            className="mr-3 accent-[#1D7B3C]"
                                        />
                                        <div className="flex-1 ">
                                            <span className="font-medium">Pay Later</span>
                                            <p className="text-xs text-gray-500">Pay on delivery</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handlePlaceOrder}
                                disabled={
                                    isProcessing ||
                                    isCalculatingDelivery ||
                                    (paymentMethod === "wallet" && checkoutData !== null && walletBalance < checkoutData.totals.grandTotal)
                                }
                                className="w-full text-sm mt-6 bg-[#1D7B3C] text-white py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? "Processing Order..." : isCalculatingDelivery ? "Calculating..." : paymentMethod === "wallet" ? "Pay with Wallet" : "Place Order"}
                            </button>


                            <p className="text-xs text-gray-500 text-center mt-4">
                                By placing your order, you agree to our terms and conditions
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />

            {/* Pay-for-Me Modal */}
            {showPayForMeModal && payForMeLink && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
                        <button
                            onClick={() => {
                                setShowPayForMeModal(false);
                                setPayForMeLink(null);
                            }}
                            className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Link2 className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">Payment Link Created!</h3>
                            <p className="text-gray-600 mt-1">Share this link with whoever will pay for you</p>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Amount:</span>
                                <span className="font-bold text-[#1D7B3C]">₦{payForMeLink.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Items:</span>
                                <span className="text-gray-900">{totalItems} items</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Expires:</span>
                                <span className="text-gray-900">1hr</span>
                            </div>
                        </div>

                        {/* Link Display */}
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-4">
                            <p className="text-sm text-purple-800 font-mono break-all text-center">
                                {payForMeLink.shareableUrl}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleCopyPayForMeLink}
                                className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
                            >
                                {payForMeCopied ? (
                                    <>
                                        <Check className="w-4 h-4 text-green-600" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        Copy Link
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleSharePayForMeLink}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition"
                            >
                                <Share2 className="w-4 h-4" />
                                Share
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            Once paid, the funds will be added to your wallet and you can complete the order.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;


