// src/pages/CartPage.tsx
import React, { useMemo, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import CartHero from "../components/Cart/CartHero";
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} from "@/redux/api/cartApi";
import type { CartItem } from "@/redux/api/cartApi";
import { useGetActiveDealQuery } from "@/redux/api/dealsApi";
import { normalizeActiveDealPayload } from "@/lib/deals";
import type { Deal } from "@/types/deals";

type DealCartAlert = {
  status: "expired" | "endingSoon" | "active" | "unknown";
  remainingMinutes?: number;
  endAt?: string;
};

type ExtendedCartItem = CartItem & {
  _id?: string;
  total?: number;
};

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: cartData, isLoading } = useGetCartQuery();
  const [updateCartItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
  const [removeFromCart, { isLoading: isRemoving }] = useRemoveFromCartMutation();
  const [clearCart] = useClearCartMutation();
  const [showClearModal, setShowClearModal] = useState(false);

  const {
    data: activeDealsResponse,
    isFetching: isFetchingDeals,
    isLoading: isLoadingDeals,
    isUninitialized: isDealsUninitialized,
  } = useGetActiveDealQuery();

  const activeDealsByProductId = useMemo(() => {
    const record: Record<string, Deal> = {};
    const normalized = normalizeActiveDealPayload(activeDealsResponse);
    (normalized.deals ?? []).forEach((deal) => {
      if (deal?.productId) {
        record[deal.productId] = deal;
      }
    });
    return record;
  }, [activeDealsResponse]);
  const dealsReady = !(isLoadingDeals || isFetchingDeals || isDealsUninitialized);

  const cartItems = useMemo(
    () => (cartData?.cart?.items ?? []) as ExtendedCartItem[],
    [cartData]
  );
  const totalItems = cartData?.cart?.totalItems || 0;
  const totalAmount = cartData?.cart?.totalAmount || 0;

  const dealInsights = useMemo(() => {
    const normalized = normalizeActiveDealPayload(activeDealsResponse);
    const map = new Map<string, DealCartAlert>();
    if (!dealsReady) {
      return { map, hasExpired: false, endingSoonCount: 0, pending: true } as const;
    }

    const now = Date.now();
    let hasExpired = false;
    let endingSoonCount = 0;

    cartItems.forEach((item) => {
      if (item.tierName !== "deal-of-the-day") return;

      const key = `${item.productId}-${item.priceType}-${item.tierName || "default"}`;
      const matchingDeal = activeDealsByProductId[item.productId] ?? normalized.deals?.find((deal) => deal.productId === item.productId);

      if (!matchingDeal || matchingDeal.status !== "active") {
        map.set(key, { status: "expired" });
        hasExpired = true;
        return;
      }

      const endTime = new Date(matchingDeal.endAt).getTime();
      if (!Number.isFinite(endTime)) {
        map.set(key, { status: "unknown" });
        return;
      }

      const remainingMs = endTime - now;
      if (remainingMs <= 0) {
        map.set(key, { status: "expired" });
        hasExpired = true;
        return;
      }

      const remainingMinutes = Math.ceil(remainingMs / 60000);
      const status = remainingMinutes <= 60 ? "endingSoon" : "active";
      if (status === "endingSoon") {
        endingSoonCount += 1;
      }
      map.set(key, { status, remainingMinutes, endAt: matchingDeal.endAt });
    });

    return { map, hasExpired, endingSoonCount, pending: false } as const;
  }, [cartItems, activeDealsByProductId, dealsReady, activeDealsResponse]);

  const handleQuantityChange = async (
    item: ExtendedCartItem,
    type: "add" | "subtract"
  ) => {
    const currentQty = item.quantity;
    // For bulk items, we're using multipliers (1, 2, 3...), so increment by 1
    // For retail items, also increment by 1
    const changeBy = 1;

    const newQty = type === "add" ? currentQty + changeBy : currentQty - changeBy;

    // If quantity goes below 1, remove the item
    if (newQty < 1) {
      try {
        await removeFromCart({
          productId: item.productId,
          body: { priceType: item.priceType, tierName: item.tierName },
        }).unwrap();
      } catch (error) {
        console.error("Failed to remove item:", error);
      }
      return;
    }

    try {
      await updateCartItem({
        productId: item.productId,
        quantity: newQty,
        priceType: item.priceType,
        tierName: item.tierName,
      }).unwrap();
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const handleRemoveItem = async (productId: string, priceType: "retail" | "bulk", tierName?: string) => {
    try {
      await removeFromCart({
        productId,
        body: { priceType, tierName },
      }).unwrap();
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart().unwrap();
      setShowClearModal(false);
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }
    if (!dealInsights.pending && dealInsights.hasExpired) {
      alert(
        "One or more deals in your cart have expired. Remove expired deals or refresh the offer before proceeding to checkout."
      );
      return;
    }
    navigate("/checkout");
  };

  const formatRemainingTime = (minutes: number | undefined) => {
    if (!minutes || minutes <= 0) return "0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  if (isLoading) {
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
    <div className="bg-gray-50 min-h-screen">
      <CartHero />
      <section className="max-w-6xl mx-auto px-2 sm:px-4 py-4 md:py-8">
        {!dealInsights.pending && dealInsights.hasExpired && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            A deal in your cart has expired. Remove it to avoid unexpected price changes at checkout.
          </div>
        )}
        {!dealInsights.pending && !dealInsights.hasExpired && dealInsights.endingSoonCount > 0 && (
          <div className="mb-4 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {dealInsights.endingSoonCount} {dealInsights.endingSoonCount === 1 ? "deal" : "deals"} will expire within the next hour.
          </div>
        )}
        <div className="mb-4 md:mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">My Cart</h2>
            <p className="text-sm text-gray-600 mt-1">
              {totalItems} {totalItems === 1 ? 'Item' : 'Items'} in your cart
            </p>
          </div>
          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearModal(true)}
              className="text-sm font-medium text-red-600 hover:text-red-800"
            >
              Clear All
            </button>
          )}
        </div>

    {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-900">Your cart is empty</h3>
            <p className="mt-2 text-gray-500">Start shopping to add items to your cart</p>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="mt-6 px-6 py-3 bg-[#1D7B3C] text-white rounded-lg hover:bg-green-700"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {/* Left - Cart Items */}
            <div className="md:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200">
                <div className="col-span-5 font-medium text-gray-600">Product</div>
                <div className="col-span-2 font-medium text-gray-600 text-center">Price</div>
                <div className="col-span-3 font-medium text-gray-600 text-center">Quantity</div>
                <div className="col-span-2 font-medium text-gray-600 text-right">Subtotal</div>
              </div>
              
              {/* Cart Items */}
              <div>
                {cartItems.map((item) => {
                  const itemSubtotal = item.price * item.quantity;

                  // Since we're now storing multipliers (1, 2, 3...) directly as quantity,
                  // we display the quantity as-is without any division
                  const displayQuantity = item.quantity;
                  const itemKey = `${item.productId}-${item.priceType}-${item.tierName || 'default'}`;
                  const dealAlert = dealInsights.map.get(itemKey);

                  return (
                    <div key={`${item.productId}-${item.priceType}-${item.tierName || 'default'}`} className="border-b border-gray-100 last:border-0">
                      <div className="p-4">
                        <div className="flex flex-col md:flex-row w-full items-start md:items-center">
                          {/* Product Info - Takes remaining space */}
                          <div className="flex-1 flex items-center w-full md:w-auto">
                            <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="ml-4 flex-1">
                              <h3 className="font-medium text-gray-900">
                                {item.name}
                              </h3>
                              <p className="text-sm text-gray-500">{item.unit} • <span className="capitalize">{item.priceType}</span></p>
                              {dealAlert && (
                                <p
                                  className={`mt-1 text-xs ${
                                    dealAlert.status === "expired"
                                      ? "text-red-600"
                                      : dealAlert.status === "endingSoon"
                                        ? "text-amber-600"
                                        : dealAlert.status === "active"
                                          ? "text-[#1D7B3C]"
                                          : "text-gray-500"
                                  }`}
                                >
                                  {dealAlert.status === "expired"
                                    ? "This deal has ended. Price may update at checkout."
                                    : dealAlert.status === "endingSoon"
                                      ? `Deal expires in ${formatRemainingTime(dealAlert.remainingMinutes)}.`
                                      : dealAlert.status === "active"
                                        ? "Deal price locked in while the offer is active."
                                        : "Deal status pending confirmation at checkout."}
                                </p>
                              )}
                              
                              {/* Mobile Layout */}
                              <div className="mt-2 space-y-2 md:hidden">
                                {/* Price and Subtotal */}
                                <div className="flex justify-between items-center">
                                  <div>
                                    <span className="text-sm text-gray-500">Unit Price:</span>
                                    <span className="ml-2 font-medium">₦{item.price.toLocaleString()}</span>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm text-gray-500">Subtotal</div>
                                    <div className="font-medium">₦{itemSubtotal.toLocaleString()}</div>
                                  </div>
                                </div>
                                
                                {/* Quantity Controls */}
                                <div className="flex items-center justify-between pt-2">
                                  <span className="text-sm font-medium">Quantity:</span>
                                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden w-32">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleQuantityChange(item, "subtract");
                                      }}
                                      disabled={isUpdating || isRemoving || item.quantity <= 1}
                                      className="flex-1 px-3 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                      aria-label="Decrease quantity"
                                    >
                                      <Minus size={16} />
                                    </button>
                                    <span className="flex-1 text-center font-medium text-gray-900">
                                      {displayQuantity}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleQuantityChange(item, "add");
                                      }}
                                      disabled={isUpdating || isRemoving}
                                      className="flex-1 px-3 py-2 text-gray-600 hover:bg-gray-50"
                                      aria-label="Increase quantity"
                                    >
                                      <Plus size={16} />
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Remove Button */}
                                <div className="pt-2">
                                  <button
                                    onClick={() => handleRemoveItem(item.productId, item.priceType, item.tierName)}
                                    className="w-full py-2 px-4 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-200 flex items-center justify-center space-x-2"
                                    disabled={isRemoving}
                                  >
                                    <Trash2 size={16} />
                                    <span>Remove Item</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Desktop Price */}
                          <div className="hidden md:block w-32 text-center">
                            <span className="font-medium">₦{item.price.toLocaleString()}</span>
                            {dealAlert && (
                              <span className="block text-xs mt-1 text-amber-600 md:mt-2">
                                {dealAlert.status === "endingSoon"
                                  ? `Ends in ${formatRemainingTime(dealAlert.remainingMinutes)}`
                                  : dealAlert.status === "expired"
                                    ? "Deal expired"
                                    : dealAlert.status === "active"
                                      ? "Deal price"
                                      : "Deal pending"}
                              </span>
                            )}
                          </div>

                          {/* Desktop Quantity */}
                          <div className="hidden md:block w-40">
                            <div className="flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(item, "subtract");
                                }}
                                disabled={isUpdating || isRemoving || item.quantity <= 1}
                                className="px-3 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="w-8 text-center font-medium text-gray-900">
                                {displayQuantity}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(item, "add");
                                }}
                                disabled={isUpdating || isRemoving}
                                className="px-3 py-2 text-gray-600 hover:bg-gray-50"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Desktop Subtotal */}
                          <div className="hidden md:flex items-center w-32 justify-end pr-4">
                            <div className="font-medium">₦{itemSubtotal.toLocaleString()}</div>
                          </div>

                          {/* Remove button - Desktop only (mobile version is now in the product info section) */}
                          <div className="hidden md:block ml-4">
                            <button
                              onClick={() => handleRemoveItem(item.productId, item.priceType, item.tierName)}
                              className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors duration-200"
                              disabled={isRemoving}
                              aria-label="Remove item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="p-4">
                <button
                  onClick={() => navigate("/products")}
                  className="w-full px-6 py-3 text-[#1D7B3C] font-medium border-2 border-[#1D7B3C] rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>

            {/* Cart Summary - Sticky on mobile */}
            <div className="bg-white rounded-xl shadow-sm p-6 h-fit md:sticky md:top-4">
              <h3 className="text-lg font-semibold mb-4">Cart Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                  <span className="font-medium">₦{totalAmount.toLocaleString()}</span>
                </div>
                <div className="h-px bg-gray-200 my-3"></div>
                <div className="flex justify-between text-base font-semibold text-gray-900">
                  <span>Total</span>
                  <span>₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-6 px-6 py-3 bg-[#1D7B3C] text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
              >
                Proceed to Checkout
              </button>

              <p className="text-xs text-center text-gray-500 mt-4">
                Tax included and shipping calculated at checkout
              </p>
            </div>
          </div>
        )}
      </section>
      <Footer />

      {/* Clear Cart Confirmation Modal */}
      {showClearModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowClearModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Clear Cart?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove all items from your cart? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearCart}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;