// src/pages/Checkout.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetCartQuery } from "@/redux/api/cartApi";
import {
  useCheckoutMutation,
  useCreateOrderMutation,
  useVerifyPaymentMutation,
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
  const [verifyPayment] = useVerifyPaymentMutation();

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

  // ✅ Handle payment verification on return from Paystack
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get("reference");

    if (reference) {
      handleVerifyPayment(reference);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Step 3: Verify Payment (after Paystack redirect)
  // const handleVerifyPayment = async (reference: string) => {
  //   setIsProcessing(true);
  //   try {
  //     const response = await verifyPayment(reference).unwrap();

  //     if (response.success && response.data) {
  //       // Clear URL params
  //       window.history.replaceState({}, document.title, window.location.pathname);
  //       // Redirect to thank you page
  //       navigate(`/thank-you?order=${response.data.order._id}`);
  //     }
  //   } catch (error: any) {
  //     console.error("Payment verification failed:", error);
  //     alert("Payment verification failed. Please contact support with reference: " + reference);
  //     navigate("/profile/orders");
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

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

  // Step 3: Verify Payment (called after Paystack redirect)
  const handleVerifyPayment = async (reference: string) => {
    try {
      const response = await verifyPayment(reference).unwrap();

      if (response.success && response.data) {
        navigate(`/order/success?reference=${reference}`);
      }
    } catch (error: any) {
      console.error("Payment verification failed:", error);
      alert("Payment verification failed. Please contact support.");
      navigate("/orders");
    }
  };


  // // ✅ Place Order - Combined checkout and create order
  // const handlePlaceOrder = async () => {
  //   // Validation
  //   if (!formData.name || !formData.phone || !formData.address) {
  //     alert("Please fill in all required fields");
  //     return;
  //   }

  //   // Extract city and state from address if not provided
  //   let city = formData.city;
  //   let state = formData.state;

  //   if (!city || !state) {
  //     const addressParts = formData.address.split(",").map(part => part.trim());
  //     if (addressParts.length >= 2) {
  //       // Try to extract from address (e.g., "Victoria Island, Lagos, Nigeria")
  //       state = state || addressParts[addressParts.length - 2]; // Lagos
  //       city = city || addressParts[addressParts.length - 3] || addressParts[0]; // Victoria Island
  //     }
  //   }

  //   if (!city || !state) {
  //     alert("Please provide city and state in your address");
  //     return;
  //   }

  //   setIsProcessing(true);

  //   try {
  //     // ✅ Step 1: Validate cart and calculate delivery
  //     const checkoutResponse = await checkout({
  //       name: formData.name,
  //       phone: formData.phone,
  //       address: formData.address,
  //       notes: formData.notes,
  //     }).unwrap();

  //     if (!checkoutResponse.success || !checkoutResponse.data) {
  //       throw new Error("Checkout validation failed");
  //     }

  //     setCheckoutData(checkoutResponse.data);
  //     const deliveryFee = checkoutResponse.data.delivery.fee;

  //     // ✅ Step 2: Create Order
  //     const orderResponse = await createOrder({
  //       deliveryInfo: {
  //         address: formData.address,
  //         city: city,
  //         state: state,
  //         phoneNumber: formData.phone,
  //       },
  //       paymentMethod: paymentMethod,
  //       deliveryFee: deliveryFee,
  //     }).unwrap();

  //     if (orderResponse.success && orderResponse.data) {
  //       const { order, payment } = orderResponse.data;

  //       if (paymentMethod === "paystack" && payment) {
  //         // Redirect to Paystack for payment
  //         window.location.href = payment.authorizationUrl;
  //       } else if (paymentMethod === "pay_later") {
  //         // Redirect to thank you page
  //         navigate(`/thank-you?order=${order._id}`);
  //       }
  //     }
  //   } catch (error: any) {
  //     console.error("Order creation failed:", error);
  //     alert(error?.data?.message || error?.message || "Order creation failed. Please try again.");
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="border border-[#9FA5A3]/30 bg-green-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Order Items</h3>
              <div className="space-y-3">
                {cart?.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white p-3 rounded">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">
                        {item.quantity} {item.unit} × ₦{item.price.toLocaleString()}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
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
                  <span className="text-green-600 font-medium">
                    {checkoutData ? `₦${checkoutData.delivery.fee.toLocaleString()}` : "Calculated at checkout"}
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
                  <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-green-600 transition bg-white">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paystack"
                      checked={paymentMethod === "paystack"}
                      onChange={(e) => setPaymentMethod(e.target.value as "paystack")}
                      className="mr-3 accent-green-600"
                    />
                    <div className="flex-1">
                      <span className="font-medium">Pay with Card</span>
                      <p className="text-xs text-gray-500">Secure payment via Paystack</p>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-green-600 transition bg-white">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="pay_later"
                      checked={paymentMethod === "pay_later"}
                      onChange={(e) => setPaymentMethod(e.target.value as "pay_later")}
                      className="mr-3 accent-green-600"
                    />
                    <div className="flex-1">
                      <span className="font-medium">Pay Later</span>
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













// // src/pages/Checkout.tsx
// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { useGetCartQuery } from "@/redux/api/cartApi";
// import {
//   useCheckoutMutation,
//   useCreateOrderMutation,
//   useVerifyPaymentMutation,
// } from "@/redux/api/orderApi";
// import type { CheckoutResponse } from "@/types/orders";
// import CartHero from "@/components/Cart/CartHero";
// import Footer from "@/components/Footer";
// import { useSelector } from "react-redux";
// import type { RootState } from "@/redux/store";

// const GOOGLE_API_KEY = 'AIzaSyA8z6nFDQAVB7blbyRiKXU8ooksT72-cu4';

// const loadGoogleMapsScript = (apiKey?: string): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     if (!apiKey) {
//       reject(new Error("Google Maps API key not provided"));
//       return;
//     }

//     // avoid loading twice
//     if ((window as any).google && (window as any).google.maps) {
//       resolve();
//       return;
//     }

//     const existing = document.getElementById("google-maps-script");
//     if (existing) {
//       existing.addEventListener("load", () => resolve());
//       existing.addEventListener("error", () => reject(new Error("Google Maps script failed to load")));
//       return;
//     }

//     const script = document.createElement("script");
//     script.id = "google-maps-script";
//     script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&loading=async&libraries=places&v=weekly`;
//     script.async = true;
//     script.defer = true;
//     script.onload = () => resolve();
//     script.onerror = () => reject(new Error("Google Maps script failed to load"));
//     document.head.appendChild(script);
//   });
// };

// // Helper to read address components returned by Places API
// const parseAddressComponents = (place: any) => {
//   // default empty values
//   const components: { [k: string]: string } = {
//     street_number: "",
//     route: "",
//     locality: "", // city
//     sublocality: "",
//     administrative_area_level_1: "", // state
//     country: "",
//     postal_code: "",
//   };

//   if (!place || !place.address_components) return components;

//   place.address_components.forEach((c: any) => {
//     const types = c.types;
//     if (types.includes("street_number")) components.street_number = c.long_name;
//     if (types.includes("route")) components.route = c.long_name;
//     if (types.includes("locality")) components.locality = c.long_name;
//     if (types.includes("sublocality") || types.includes("sublocality_level_1")) components.sublocality = c.long_name;
//     if (types.includes("administrative_area_level_1")) components.administrative_area_level_1 = c.long_name;
//     if (types.includes("country")) components.country = c.long_name;
//     if (types.includes("postal_code")) components.postal_code = c.long_name;
//   });

//   return components;
// };

// const Checkout: React.FC = () => {
//   const navigate = useNavigate();
//   const { user } = useSelector((state: RootState) => state.auth);
//   const { data: cartData, isLoading: cartLoading } = useGetCartQuery();

//   const [checkout] = useCheckoutMutation();
//   const [createOrder] = useCreateOrderMutation();
//   const [verifyPayment] = useVerifyPaymentMutation();

//   // Pre-fill form with user data
//   const [formData, setFormData] = useState({
//     name: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
//     phone: user?.phone || "",
//     address: "",
//     city: "",
//     state: "",
//     notes: "",
//   });

//   const addressRef = useRef<HTMLInputElement | null>(null);
//   const autocompleteRef = useRef<any>(null);

//   const [paymentMethod, setPaymentMethod] = useState<"paystack" | "pay_later">("paystack");
//   const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);

//   const cart = cartData?.cart;
//   const totalItems = cartData?.cart?.totalItems || 0;
//   const totalAmount = cartData?.cart?.totalAmount || 0;

//   // redirect if cart empty
//   useEffect(() => {
//     if (!cart || cart.items.length === 0) {
//       navigate("/cart");
//     }
//   }, [cart, navigate]);

//   // Handle paystack verification on return
//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const reference = urlParams.get("reference");

//     if (reference) {
//       handleVerifyPayment(reference);
//     }
//   }, []);

//   // --- Google Autocomplete init ---
//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         await loadGoogleMapsScript(GOOGLE_API_KEY);
//         if (!mounted) return;

//         if (addressRef.current && (window as any).google && !(autocompleteRef.current)) {
//           const google = (window as any).google;
//           // create autocomplete bound to the address input
//           autocompleteRef.current = new google.maps.places.Autocomplete(addressRef.current, {
//             types: ["address"], // restrict to address results
//             componentRestrictions: { country: [] }, // optional: restrict by country code(s) e.g. ['ng']
//           });

//           // When user selects an address
//           autocompleteRef.current.addListener("place_changed", () => {
//             const place = autocompleteRef.current.getPlace();
//             if (!place || !place.formatted_address) {
//               return;
//             }

//             // parse components to city/state
//             const parsed = parseAddressComponents(place);

//             // Build a reasonable address string (you may choose formatted_address instead)
//             const formattedAddress = place.formatted_address;

//             setFormData(prev => ({
//               ...prev,
//               address: formattedAddress,
//               city: parsed.locality || parsed.sublocality || prev.city,
//               state: parsed.administrative_area_level_1 || prev.state,
//             }));

//             // Reset previously calculated delivery info (user must re-calc)
//             setCheckoutData(null);
//             setShowDeliveryInfo(false);
//           });
//         }
//       } catch (err) {
//         console.warn("Google Maps script load failed:", err);
//       }
//     })();

//     return () => {
//       mounted = false;
//     };
//   }, []); // run once

//   // When the user types into the address field manually, clear checkoutData & hide Place Order
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;

//     setFormData(prev => ({
//       ...prev,
//       [name]: value,
//     }));

//     if (name === "address" || name === "city" || name === "state") {
//       setCheckoutData(null);
//       setShowDeliveryInfo(false);
//     }
//   };

//   // DELIVERY calculate
//   const handleCalculateDelivery = async () => {
//     if (!formData.name || !formData.phone || !formData.address) {
//       alert("Please fill in all required fields (Name, Phone, Address)");
//       return;
//     }

//     // Extract city/state from address if missing (safety)
//     let city = formData.city;
//     let state = formData.state;
//     if (!city || !state) {
//       const addressParts = formData.address.split(",").map(p => p.trim());
//       if (addressParts.length >= 2) {
//         state = state || addressParts[addressParts.length - 2];
//         city = city || addressParts[addressParts.length - 3] || addressParts[0];
//       }
//     }

//     if (!city || !state) {
//       alert("Please select a complete address with city and state");
//       return;
//     }

//     setIsProcessing(true);
//     try {
//       const checkoutResponse = await checkout({
//         name: formData.name,
//         phone: formData.phone,
//         address: formData.address,
//         notes: formData.notes,
//       }).unwrap();

//       if (checkoutResponse.success && checkoutResponse.data) {
//         setCheckoutData(checkoutResponse.data);
//         setShowDeliveryInfo(true);
//       }
//     } catch (error: any) {
//       console.error("Delivery calculation failed:", error);
//       alert(error?.data?.message || "Failed to calculate delivery fee. Please try again.");
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // PLACE ORDER
//   const handlePlaceOrder = async () => {
//     if (!checkoutData) {
//       alert("Please calculate delivery fee first");
//       return;
//     }

//     // Extract city and state (again for safety)
//     let city = formData.city;
//     let state = formData.state;
//     if (!city || !state) {
//       const addressParts = formData.address.split(",").map(p => p.trim());
//       if (addressParts.length >= 3) {
//         city = city || addressParts[addressParts.length - 3];
//         state = state || addressParts[addressParts.length - 2];
//       }
//     }

//     try {
//       setIsProcessing(true);

//       const orderResponse = await createOrder({
//         deliveryInfo: {
//           address: formData.address,
//           city: city,
//           state: state,
//           phoneNumber: formData.phone,
//         },
//         paymentMethod,
//         deliveryFee: checkoutData.delivery.fee,
//       }).unwrap();

//       if (orderResponse.success && orderResponse.data) {
//         const { order, payment } = orderResponse.data;

//         if (paymentMethod === "paystack" && payment) {
//           window.location.href = payment.authorizationUrl;
//         } else if (paymentMethod === "pay_later") {
//           navigate(`/orders/${order._id}`);
//         }
//       }
//     } catch (error: any) {
//       console.error("Order creation failed:", error);
//       alert(error?.data?.message || error?.message || "Order creation failed. Please try again.");
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleVerifyPayment = async (reference: string) => {
//     try {
//       const response = await verifyPayment(reference).unwrap();

//       if (response.success && response.data) {
//         navigate(`/order/success?reference=${reference}`);
//       }
//     } catch (error: any) {
//       console.error("Payment verification failed:", error);
//       alert("Payment verification failed. Please contact support.");
//       navigate("/orders");
//     }
//   };

//   // Loading UI
//   if (cartLoading || isProcessing) {
//     return (
//       <div>
//         <CartHero />
//         <section className="max-w-6xl min-h-[80vh] mx-auto py-10 px-4 my-10">
//           <div className="flex items-center justify-center py-20">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
//           </div>
//         </section>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div>
//       <CartHero />
//       <section className="max-w-6xl min-h-[60vh] mx-auto py-10 px-4">
//         <div className="mb-6">
//           <h2 className="text-3xl font-bold text-[#121212] mb-2">Order Review</h2>
//           <p className="text-[#737373]">
//             Complete your order - {totalItems} {totalItems === 1 ? "item" : "items"} in cart
//           </p>
//         </div>

//         <div className="grid md:grid-cols-3 gap-8">
//           {/* Left - Delivery Information */}
//           <div className="md:col-span-2 space-y-6">
//             {/* Delivery Info Form */}
//             <div className="border border-[#9FA5A3]/30 bg-green-100 rounded-lg p-6">
//               <h3 className="text-lg font-semibold mb-4">Delivery Information</h3>
//               <div className="space-y-4">
//                 {/* Name */}
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Full Name *</label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleInputChange}
//                     placeholder="Enter your full name"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
//                     required
//                   />
//                 </div>

//                 {/* Phone */}
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Phone Number *</label>
//                   <input
//                     type="tel"
//                     name="phone"
//                     value={formData.phone}
//                     onChange={handleInputChange}
//                     placeholder="+234 812 345 6789"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
//                     required
//                   />
//                 </div>

//                 {/* Address - wired to Google Autocomplete */}
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Delivery Address *</label>
//                   <input
//                     type="text"
//                     name="address"
//                     ref={addressRef}
//                     value={formData.address}
//                     onChange={handleInputChange}
//                     placeholder="E.g., Victoria Island, Lagos, Nigeria"
//                     autoComplete="off"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
//                     required
//                   />
//                   <p className="text-xs text-gray-500 mt-1">
//                     Start typing address and select suggestion. Include street, city, and state.
//                   </p>
//                 </div>

//                 {/* hidden city/state inputs optionally */}
//                 <div className="grid md:grid-cols-2 gap-4 hidden">
//                   <div>
//                     <label className="block text-sm font-medium mb-2">City (Optional)</label>
//                     <input
//                       type="text"
//                       name="city"
//                       value={formData.city}
//                       onChange={handleInputChange}
//                       placeholder="e.g., Lagos"
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-2">State (Optional)</label>
//                     <input
//                       type="text"
//                       name="state"
//                       value={formData.state}
//                       onChange={handleInputChange}
//                       placeholder="e.g., Lagos"
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
//                     />
//                   </div>
//                 </div>

//                 {/* Notes */}
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Delivery Notes (Optional)</label>
//                   <textarea
//                     name="notes"
//                     value={formData.notes}
//                     onChange={handleInputChange}
//                     rows={3}
//                     placeholder="E.g., Please deliver between 2-4 PM"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Order Items Preview */}
//             <div className="border border-[#9FA5A3]/30 bg-green-100 rounded-lg p-6">
//               <h3 className="text-lg font-semibold mb-4">Order Items</h3>
//               <div className="space-y-3">
//                 {cart?.items.map((item, index) => (
//                   <div key={index} className="flex items-center gap-3 bg-white p-3 rounded">
//                     <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
//                     <div className="flex-1">
//                       <h4 className="font-medium text-gray-900">{item.name}</h4>
//                       <p className="text-sm text-gray-600">
//                         {item.quantity} {item.unit} × ₦{item.price.toLocaleString()}
//                       </p>
//                     </div>
//                     <p className="font-semibold text-gray-900">₦{(item.price * item.quantity).toLocaleString()}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Right - Order Summary & Payment */}
//           <div className="space-y-6">
//             <div className="border border-[#9FA5A3]/30 bg-green-100 rounded-lg p-6 sticky top-4">
//               <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
//               <div className="space-y-3 text-sm">
//                 <div className="flex justify-between text-gray-600">
//                   <span>Items ({totalItems}):</span>
//                   <span className="font-medium">₦{totalAmount.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between text-gray-600">
//                   <span>Shipping:</span>
//                   <span className={`font-medium transition-all duration-300 ${checkoutData ? "text-green-600" : "text-gray-500"}`}>
//                     {checkoutData ? `₦${checkoutData.delivery.fee.toLocaleString()}` : "Calculated at checkout"}
//                   </span>
//                 </div>
//                 {checkoutData && (
//                   <div className="text-xs text-gray-500">
//                     <p>Distance: {checkoutData.delivery.distanceText}</p>
//                     <p>Duration: {checkoutData.delivery.durationText}</p>
//                   </div>
//                 )}
//                 <div className="flex justify-between font-bold text-lg border-t border-[#9FA5A3]/30 pt-3 mt-3">
//                   <span>Total:</span>
//                   <span className="text-[#1D7B3C]">
//                     ₦{checkoutData ? checkoutData.totals.grandTotal.toLocaleString() : totalAmount.toLocaleString()}
//                   </span>
//                 </div>
//               </div>

//               {/* Payment Method */}
//               <div className="mt-6">
//                 <h4 className="font-semibold mb-3">Payment Method</h4>
//                 <div className="space-y-2">
//                   <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-green-600 transition bg-white">
//                     <input
//                       type="radio"
//                       name="paymentMethod"
//                       value="paystack"
//                       checked={paymentMethod === "paystack"}
//                       onChange={(e) => setPaymentMethod(e.target.value as "paystack")}
//                       className="mr-3 accent-green-600"
//                     />
//                     <div className="flex-1">
//                       <span className="font-medium">Pay with Card</span>
//                       <p className="text-xs text-gray-500">Secure payment via Paystack</p>
//                     </div>
//                   </label>
//                   <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-green-600 transition bg-white">
//                     <input
//                       type="radio"
//                       name="paymentMethod"
//                       value="pay_later"
//                       checked={paymentMethod === "pay_later"}
//                       onChange={(e) => setPaymentMethod(e.target.value as "pay_later")}
//                       className="mr-3 accent-green-600"
//                     />
//                     <div className="flex-1">
//                       <span className="font-medium">Pay Later</span>
//                       <p className="text-xs text-gray-500">Pay on delivery</p>
//                     </div>
//                   </label>
//                 </div>
//               </div>

//               {/* Buttons: Calculate Delivery first, then Place Order */}
//               {!showDeliveryInfo ? (
//                 <button
//                   onClick={handleCalculateDelivery}
//                   disabled={isProcessing}
//                   className="w-full text-sm mt-6 bg-[#1D7B3C] text-white py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {isProcessing ? "Calculating..." : "Calculate Delivery"}
//                 </button>
//               ) : (
//                 <button
//                   onClick={handlePlaceOrder}
//                   disabled={isProcessing}
//                   className="w-full text-sm mt-6 bg-[#1D7B3C] text-white py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {isProcessing ? "Processing..." : "Place Order"}
//                 </button>
//               )}

//               <p className="text-xs text-gray-500 text-center mt-4">
//                 By placing your order, you agree to our terms and conditions
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       <Footer />
//     </div>
//   );
// };

// export default Checkout;
