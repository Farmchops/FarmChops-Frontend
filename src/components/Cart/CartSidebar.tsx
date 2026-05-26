// src/components/Cart/CartSidebar.tsx
import React, { useState, useEffect } from "react";
import { X, ShoppingCart, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetCartQuery, useClearCartMutation, useRemoveFromCartMutation, useUpdateCartItemMutation } from "@/redux/api/cartApi";
import type { CartItem } from "@/redux/api/cartApi";

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    showQuantityControls?: boolean;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, showQuantityControls = true }) => {
    const [updateCartItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
    const navigate = useNavigate();
    const { data: cartData, refetch } = useGetCartQuery();
    // Ensure showQuantityControls is defined
    const [clearCart, { isLoading: isClearing }] = useClearCartMutation();
    const [removeFromCart] = useRemoveFromCartMutation();
    const [open, setOpen] = useState(false);
    const [backdropVisible, setBackdropVisible] = useState(false);
    const [removingKey, setRemovingKey] = useState<string | null>(null);
    const [showClearModal, setShowClearModal] = useState(false);

    const cart = cartData?.cart;
    type SidebarCartItem = CartItem & { _id?: string; total?: number }; // server enriches items with _id/total
    const items = (cart?.items ?? []) as SidebarCartItem[];
    const subtotal = typeof cart?.totalAmount === "number" ? cart.totalAmount : 0;

    const formatNaira = (value?: number | null) => {
        if (typeof value !== "number" || !Number.isFinite(value)) {
            return "—";
        }
        return value.toLocaleString();
    };

    useEffect(() => {
        if (isOpen) {
            setOpen(true);
            refetch(); // Force cart query to update when sidebar opens
            const timer = setTimeout(() => setBackdropVisible(true), 100);
            return () => clearTimeout(timer);
        } else {
            setBackdropVisible(false);
            setTimeout(() => setOpen(false), 150);
        }
    }, [isOpen, refetch]);

    const handleViewCart = () => {
        onClose();
        navigate("/cart");
    };

    const handleCheckout = () => {
        onClose();
        navigate("/checkout");
    };

    const handleClearCart = async () => {
        try {
            await clearCart().unwrap();
            setShowClearModal(false);
        } catch (error) {
            console.error("Failed to clear cart:", error);
        }
    };

    const handleRemoveItem = async (item: SidebarCartItem) => {
        const key = item._id || `${item.productId}-${item.priceType}-${item.tierName ?? "retail"}`;
        setRemovingKey(key);
        try {
            await removeFromCart({
                productId: item.productId,
                body: {
                    priceType: item.priceType,
                    tierName: item.tierName,
                    dealId: item.dealId,
                },
            }).unwrap();
        } catch (error) {
            console.error("Failed to remove item from cart:", error);
        } finally {
            setRemovingKey((current) => (current === key ? null : current));
        }
    };

    if (!isOpen && !open) return null;

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                    backdropVisible ? "opacity-40" : "opacity-0"
                }`}
                onClick={onClose}
            />

            {/* Sidebar - Nearly full width on mobile, fixed width on larger screens */}
            <div
                className={`ml-auto w-[95%] sm:w-[90%] md:w-[420px] h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
                    open ? "translate-x-0" : "translate-x-full"
                } overflow-y-auto relative flex flex-col`}
            >
                {/* Header - sticky on mobile */}
                <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-4 sm:p-6">
                    {/* Close Button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        aria-label="Close cart sidebar"
                    >
                        <X size={24} />
                    </button>

                    <div className="pr-8">
                        <div className="flex items-center gap-2 mb-2">
                            <ShoppingCart size={20} className="text-[#1D7B3C]" />
                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                                Order summary
                            </h2>
                        </div>
                        <p className="text-sm text-gray-600">
                            You have {items.length} {items.length === 1 ? "item" : "items"} on your list
                        </p>
                    </div>
                </div>

                {/* Content - scrollable */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {items.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">Your cart is empty</p>
                        </div>
                    ) : (
                        <>
                            {/* Cart Items */}
                            <div className="space-y-4 mb-6">
                                {items.map((item) => {
                                    const key = item._id || `${item.productId}-${item.tierName ?? "retail"}`;
                                    const itemSubtotal = typeof item.total === "number"
                                        ? item.total
                                        : typeof item.price === "number" && typeof item.quantity === "number"
                                            ? item.price * item.quantity
                                            : null;

                                    return (
                                    <div
                                        key={key}
                                        className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                                    >
                                        {/* Product Row */}
                                        <div className="p-3 flex items-center gap-3">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-20 h-20 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-gray-900 line-clamp-1">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {item.unit}
                                                    {item.tierName === "deal-of-the-day" && (
                                                        <span className="text-[#1D7B3C] font-medium ml-1">• Deal</span>
                                                    )}
                                                </p>
                                                <p className="text-sm font-semibold text-[#1D7B3C] mt-1">
                                                    ₦{formatNaira(item.price)}
                                                </p>
                                            </div>
                                            {/* Delete Button */}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(item)}
                                                disabled={removingKey === key}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                aria-label="Remove item"
                                            >
                                                <Trash2 size={18} className={removingKey === key ? "opacity-50" : undefined} />
                                            </button>
                                        </div>

                                        {/* Quantity Controls & Subtotal Row */}
                                        <div className="px-3 pb-3 flex items-center justify-between">
                                            {showQuantityControls ? (
                                                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                                                    <button
                                                        type="button"
                                                        className="w-10 h-10 flex items-center justify-center rounded-md bg-white text-gray-700 hover:bg-gray-200 disabled:opacity-50 text-lg font-medium shadow-sm"
                                                        disabled={isUpdating || item.quantity <= 1}
                                                        onClick={async () => {
                                                            if (item.quantity > 1) {
                                                                await updateCartItem({
                                                                    productId: item.productId,
                                                                    quantity: item.quantity - 1,
                                                                    priceType: item.priceType,
                                                                    dealId: item.dealId,
                                                                    tierName: item.tierName,
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        −
                                                    </button>
                                                    <span className="text-sm font-semibold text-gray-900 min-w-[32px] text-center">{item.quantity}</span>
                                                    <button
                                                        type="button"
                                                        className="w-10 h-10 flex items-center justify-center rounded-md bg-white text-gray-700 hover:bg-gray-200 disabled:opacity-50 text-lg font-medium shadow-sm"
                                                        disabled={isUpdating}
                                                        onClick={async () => {
                                                            await updateCartItem({
                                                                productId: item.productId,
                                                                quantity: item.quantity + 1,
                                                                priceType: item.priceType,
                                                                dealId: item.dealId,
                                                                tierName: item.tierName,
                                                            });
                                                        }}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            ) : (
                                                <div />
                                            )}
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">Subtotal</p>
                                                <p className="text-sm font-bold text-green-700">
                                                    ₦{formatNaira(itemSubtotal)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>

                            {/* Clear Cart Button */}
                            {items.length > 0 && (
                                <div className="mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowClearModal(true)}
                                        disabled={isClearing}
                                        className="w-full text-sm text-red-600 hover:text-red-700 py-2 px-4 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={16} />
                                        {isClearing ? "Clearing..." : "Clear Cart"}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer - sticky at bottom */}
                {items.length > 0 && (
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6">
                        {/* Cart Total */}
                        <div className="bg-green-50 rounded-lg p-3 sm:p-4 mb-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Items ({items.length}):</span>
                                    <span className="font-medium">₦{formatNaira(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping:</span>
                                    <span className="text-gray-400 font-medium text-xs">Calculated at checkout</span>
                                </div>
                                <div className="flex justify-between font-bold text-base sm:text-lg border-t border-gray-200 pt-2 mt-2">
                                    <span>Total:</span>
                                    <span className="text-[#1D7B3C]">₦{formatNaira(subtotal)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2 sm:space-y-3">
                            <button
                                type="button"
                                onClick={handleCheckout}
                                className="w-full bg-[#1D7B3C] text-white py-2.5 sm:py-3 rounded-lg font-medium hover:bg-green-800 transition-colors text-sm sm:text-base"
                            >
                                Proceed to Checkout
                            </button>
                            <button
                                type="button"
                                onClick={handleViewCart}
                                className="w-full bg-white border-2 border-[#1D7B3C] text-[#1D7B3C] py-2.5 sm:py-3 rounded-lg font-medium hover:bg-green-50 transition-colors text-sm sm:text-base"
                            >
                                View Cart
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full text-gray-600 py-2 text-xs sm:text-sm hover:text-gray-900 transition-colors"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Clear Cart Confirmation Modal */}
            {showClearModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
                    onClick={() => setShowClearModal(false)}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Clear Cart?</h3>
                        <p className="text-gray-600 text-sm mb-6">
                            Are you sure you want to remove all items from your cart? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowClearModal(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleClearCart}
                                disabled={isClearing}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isClearing ? "Clearing..." : "Clear Cart"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
