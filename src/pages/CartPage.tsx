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
import type { Deal, DealMetrics } from "@/types/deals";

type DealCartAlert = {
  status: "active" | "soldOut" | "unknown";
  remainingUnits?: number | null;
  dealId?: string | null;
  perUserLimit?: number | null;
  perUserRemaining?: number | null;
};

type ExtendedCartItem = CartItem & {
  _id?: string;
  total?: number;
};

const resolveDealIdentifier = (deal: Deal | null | undefined): string | null => {
  if (!deal) return null;
  const reference = deal as Deal & { id?: string };
  return reference._id ?? reference.id ?? null;
};

const computeRemainingUnits = (deal: Deal, metrics?: DealMetrics): number | null => {
  if (metrics && typeof metrics.remainingUnits === "number") {
    return Math.max(metrics.remainingUnits, 0);
  }

  if (typeof deal.maxUnits === "number") {
    const sold = metrics?.soldUnits ?? deal.soldUnits ?? 0;
    const reserved = metrics?.reservedUnits ?? deal.reservedUnits ?? 0;
    const remaining = deal.maxUnits - sold - reserved;
    return Number.isFinite(remaining) ? Math.max(remaining, 0) : null;
  }

  return null;
};

const formatNaira = (value?: number | null) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }
  return value.toLocaleString();
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

  const activeDealsById = useMemo(() => {
    const record: Record<string, Deal> = {};
    const normalized = normalizeActiveDealPayload(activeDealsResponse);
    (normalized.deals ?? []).forEach((deal) => {
      const id = resolveDealIdentifier(deal);
      if (id) {
        record[id] = deal;
      }
    });
    const primaryId = resolveDealIdentifier(normalized.deal ?? null);
    if (primaryId && normalized.deal) {
      record[primaryId] = normalized.deal;
    }
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
      return { map, hasSoldOut: false, pending: true } as const;
    }

    let hasSoldOut = false;

    cartItems.forEach((item) => {
      if (item.tierName !== "deal-of-the-day") return;

      const key = `${item.productId}-${item.priceType}-${item.tierName || "default"}`;
      const itemDealId = (item as { dealId?: string | null }).dealId ?? null;

      let matchingDeal: Deal | undefined;

      if (itemDealId) {
        matchingDeal = activeDealsById[itemDealId] ?? normalized.deals?.find((deal) => resolveDealIdentifier(deal) === itemDealId);
        if (!matchingDeal && normalized.deal && resolveDealIdentifier(normalized.deal) === itemDealId) {
          matchingDeal = normalized.deal;
        }
      }

      if (!matchingDeal) {
        matchingDeal = activeDealsByProductId[item.productId] ?? normalized.deals?.find((deal) => deal.productId === item.productId);
      }

      if (!matchingDeal) {
        map.set(key, { status: "soldOut", remainingUnits: 0, dealId: itemDealId, perUserLimit: null, perUserRemaining: 0 });
        hasSoldOut = true;
        return;
      }

      const dealId = resolveDealIdentifier(matchingDeal) ?? itemDealId;
      const metrics = (dealId && normalized.metricsByDealId ? normalized.metricsByDealId[dealId] : undefined) ?? matchingDeal.metrics;
      const remainingUnits = computeRemainingUnits(matchingDeal, metrics ?? undefined);
      const soldOut = matchingDeal.status !== "active" || metrics?.soldOut === true || (remainingUnits !== null && remainingUnits <= 0);
      const perUserLimit = typeof matchingDeal.perUserLimit === "number" ? matchingDeal.perUserLimit : null;
      const perUserRemainingFromMetrics = typeof metrics?.perUserRemaining === "number" ? metrics.perUserRemaining : null;
      const perUserRemaining = perUserLimit !== null
        ? Math.max(
            perUserRemainingFromMetrics ?? perUserLimit - item.quantity,
            0,
          )
        : null;

      if (soldOut) {
        map.set(key, {
          status: "soldOut",
          remainingUnits: remainingUnits ?? 0,
          perUserLimit,
          perUserRemaining: 0,
          dealId,
        });
        hasSoldOut = true;
        return;
      }

      map.set(key, {
        status: "active",
        remainingUnits,
        perUserLimit,
        perUserRemaining,
        dealId,
      });
    });

    return { map, hasSoldOut, pending: false } as const;
  }, [cartItems, activeDealsByProductId, activeDealsById, dealsReady, activeDealsResponse]);

  const handleQuantityChange = async (
    item: ExtendedCartItem,
    type: "add" | "subtract"
  ) => {
    const currentQty = item.quantity;
    // For bulk items, we're using multipliers (1, 2, 3...), so increment by 1
    // For retail items, also increment by 1
    const changeBy = 1;

    const itemKey = `${item.productId}-${item.priceType}-${item.tierName || "default"}`;
    const dealAlert = dealInsights.map.get(itemKey);
    const dealIdForItem = dealAlert?.dealId ?? item.dealId;
    const perUserLimit = dealAlert?.perUserLimit ?? null;
    const remainingGlobal = typeof dealAlert?.remainingUnits === "number" ? dealAlert.remainingUnits : null;
    const perUserRemainingFromAlert = typeof dealAlert?.perUserRemaining === "number" ? dealAlert.perUserRemaining : null;

    const newQty = type === "add" ? currentQty + changeBy : currentQty - changeBy;

    if (perUserLimit !== null && newQty > perUserLimit) {
      alert(`This deal is limited to ${perUserLimit} unit${perUserLimit > 1 ? "s" : ""} per customer.`);
      return;
    }

    if (perUserRemainingFromAlert !== null && type === "add" && perUserRemainingFromAlert <= 0) {
      alert("You have reached the per-customer limit for this deal.");
      return;
    }

    if (type === "add" && remainingGlobal !== null && remainingGlobal <= 0) {
      alert("This deal has sold out. You can't add more units.");
      return;
    }

    if (type === "add" && remainingGlobal !== null) {
      const maxTotal = currentQty + remainingGlobal;
      if (newQty > maxTotal) {
        alert("Not enough deal stock left to increase the quantity.");
        return;
      }
    }

    // If quantity goes below 1, remove the item
    if (newQty < 1) {
      try {
        await removeFromCart({
          productId: item.productId,
          body: { priceType: item.priceType, tierName: item.tierName, dealId: dealIdForItem ?? undefined },
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
        dealId: dealIdForItem ?? undefined,
        tierName: item.tierName,
      }).unwrap();
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const handleRemoveItem = async (
    productId: string,
    priceType: "retail" | "bulk",
    tierName?: string,
    dealId?: string | null,
  ) => {
    try {
      await removeFromCart({
        productId,
        body: { priceType, tierName, dealId: dealId ?? undefined },
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
    if (!dealInsights.pending && dealInsights.hasSoldOut) {
      alert(
        "One or more deal offers in your cart have sold out. Remove sold-out deals before proceeding to checkout."
      );
      return;
    }
    navigate("/checkout");
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
        {!dealInsights.pending && dealInsights.hasSoldOut && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            A deal in your cart has sold out. Remove it to avoid unexpected price changes at checkout.
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
                  const dealStatus = (() => {
                    if (!dealAlert) {
                      return {
                        color: "text-gray-500",
                        message: "Deal status pending confirmation at checkout.",
                        badge: null as string | null,
                      };
                    }
                    if (dealAlert.status === "soldOut") {
                      return {
                        color: "text-red-600",
                        message: "This deal has sold out. Price may update at checkout.",
                        badge: "Deal sold out",
                      };
                    }
                    if (dealAlert.status === "active") {
                      const remainingText = typeof dealAlert.remainingUnits === "number"
                        ? `${Math.max(dealAlert.remainingUnits, 0)} left`
                        : "While stocks last";
                      const limitText = typeof dealAlert.perUserLimit === "number"
                        ? ` Limit ${dealAlert.perUserLimit} per customer${typeof dealAlert.perUserRemaining === "number" ? ` (${dealAlert.perUserRemaining} left for you).` : "."}`
                        : "";
                      return {
                        color: "text-[#1D7B3C]",
                        message: `Deal price locked in. ${remainingText}.${limitText}`,
                        badge: remainingText,
                      };
                    }
                    return {
                      color: "text-gray-500",
                      message: "Deal status pending confirmation at checkout.",
                      badge: "Checking availability",
                    };
                  })();

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
                                <p className={`mt-1 text-xs ${dealStatus.color}`}>
                                  {dealStatus.message}
                                </p>
                              )}
                              
                              {/* Mobile Layout */}
                              <div className="mt-2 space-y-2 md:hidden">
                                {/* Price and Subtotal */}
                                <div className="flex justify-between items-center">
                                  <div>
                                    <span className="text-sm text-gray-500">Unit Price:</span>
                                    <span className="ml-2 font-medium">₦{formatNaira(item.price)}</span>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm text-gray-500">Subtotal</div>
                                    <div className="font-medium">₦{formatNaira(itemSubtotal)}</div>
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
                                    onClick={() => handleRemoveItem(item.productId, item.priceType, item.tierName, item.dealId ?? null)}
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
                            <span className="font-medium">₦{formatNaira(item.price)}</span>
                            {dealAlert && dealStatus.badge && (
                              <span className={`block text-xs mt-1 md:mt-2 ${dealStatus.color}`}>
                                {dealStatus.badge}
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
                            <div className="font-medium">₦{formatNaira(itemSubtotal)}</div>
                          </div>

                          {/* Remove button - Desktop only (mobile version is now in the product info section) */}
                          <div className="hidden md:block ml-4">
                            <button
                              onClick={() => handleRemoveItem(item.productId, item.priceType, item.tierName, item.dealId ?? null)}
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
                  <span className="font-medium">₦{formatNaira(totalAmount)}</span>
                </div>
                <div className="h-px bg-gray-200 my-3"></div>
                <div className="flex justify-between text-base font-semibold text-gray-900">
                  <span>Total</span>
                  <span>₦{formatNaira(totalAmount)}</span>
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