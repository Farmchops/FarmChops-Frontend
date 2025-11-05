// src/components/Cart/CartSidebar.tsx
import React, { useState, useEffect } from "react";
import { X, ShoppingCart, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetCartQuery, useClearCartMutation, useRemoveFromCartMutation } from "@/redux/api/cartApi";
import type { CartItem } from "@/redux/api/cartApi";

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { data: cartData } = useGetCartQuery();
    const [clearCart, { isLoading: isClearing }] = useClearCartMutation();
    const [removeFromCart] = useRemoveFromCartMutation();
    const [open, setOpen] = useState(false);
    const [backdropVisible, setBackdropVisible] = useState(false);
    const [removingKey, setRemovingKey] = useState<string | null>(null);

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
            const timer = setTimeout(() => setBackdropVisible(true), 100);
            return () => clearTimeout(timer);
        } else {
            setBackdropVisible(false);
            setTimeout(() => setOpen(false), 150);
        }
    }, [isOpen]);

    const handleViewCart = () => {
        onClose();
        navigate("/cart");
    };

    const handleCheckout = () => {
        onClose();
        navigate("/checkout");
    };

    const handleClearCart = async () => {
        if (window.confirm("Are you sure you want to clear your cart?")) {
            try {
                await clearCart().unwrap();
            } catch (error) {
                console.error("Failed to clear cart:", error);
            }
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

            {/* Sidebar - Full width on mobile, fixed width on larger screens */}
            <div
                className={`ml-auto w-full sm:w-[90%] md:w-[420px] h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
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
                            {/* Cart Items Header */}
                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                                <div className="grid grid-cols-12 w-full text-xs sm:text-sm font-medium text-gray-600">
                                    <div className="col-span-6">Product</div>
                                    <div className="col-span-3 text-center">Price</div>
                                    <div className="col-span-2 text-center">Quantity</div>
                                    <div className="col-span-1"></div>
                                </div>
                            </div>

                            {/* Cart Items */}
                            <div className="space-y-3 mb-6">
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
                                        className="grid grid-cols-12 gap-2 items-center bg-green-50 p-2 sm:p-3 rounded-lg"
                                    >
                                        {/* Product Info */}
                                        <div className="col-span-6 flex items-center gap-2">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg flex-shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <p className="font-medium text-xs sm:text-sm text-gray-900 line-clamp-2">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {item.unit}
                                                    {item.tierName === "deal-of-the-day" && (
                                                        <span className="text-[#1D7B3C] font-medium ml-1">• Deal price</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="col-span-3 text-center">
                                            <p className="text-xs sm:text-sm font-semibold text-gray-900">
                                                ₦{formatNaira(item.price)}
                                            </p>
                                            {item.tierName === "deal-of-the-day" && (
                                                <p className="text-[11px] text-amber-600 mt-1">Limited-time offer</p>
                                            )}
                                        </div>

                                        {/* Quantity */}
                                        <div className="col-span-2 text-center">
                                            <p className="text-xs sm:text-sm font-medium text-gray-700">
                                                {item.quantity}
                                            </p>
                                        </div>

                                        {/* Remove button */}
                                        <div className="col-span-1 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(item)}
                                                disabled={removingKey === key}
                                                className="text-red-500 hover:text-red-700 p-1"
                                                aria-label="Remove item"
                                            >
                                                <Trash2 size={14} className={removingKey === key ? "opacity-50" : undefined} />
                                            </button>
                                        </div>

                                        {/* Subtotal - Full width below on mobile */}
                                        <div className="col-span-12 mt-1 pt-2 border-t border-gray-200 flex justify-between items-center">
                                            <span className="text-xs text-gray-600">Subtotal</span>
                                            <span className="text-sm font-bold text-[#1D7B3C]">
                                                ₦{formatNaira(itemSubtotal)}
                                            </span>
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
                                        onClick={handleClearCart}
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
                                    <span className="text-green-600 font-medium">Free</span>
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
        </div>
    );
};
