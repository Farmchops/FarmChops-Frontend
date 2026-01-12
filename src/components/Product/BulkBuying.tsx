// src/components/Product/BulkBuying.tsx
import React, { useState, useEffect } from "react";
import { X, Minus, Plus } from "lucide-react";
import type { Product, BulkTier } from "../../types/product";
import cartImg from "../../assets/cart.svg";
import { useAddToCartMutation } from "@/redux/api/cartApi";
import { CartSidebar } from "@/components/Cart/CartSidebar";
import { Toast } from "@/components/ui/toast";

interface BulkBuyingDrawerProps {
    product: Product;
    onClose: () => void;
}

const formatNaira = (value?: number | null): string => {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return "—";
    }
    return value.toLocaleString();
};

export const BulkBuying: React.FC<BulkBuyingDrawerProps> = ({ product, onClose }) => {
    const [addToCart, { isLoading: adding }] = useAddToCartMutation();
    const [showCartSidebar, setShowCartSidebar] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const sanitizedBulkTiers = (product.pricing.bulkTiers ?? []).filter((tier): tier is BulkTier =>
        typeof tier?.price === "number" && Number.isFinite(tier.price)
    );

    const hasBulkTiers = sanitizedBulkTiers.length > 0;

    const retailPrice = typeof product.pricing.retail?.price === "number" ? product.pricing.retail.price : 0;
    const retailMinQuantity = typeof product.pricing.retail?.minQuantity === "number" && product.pricing.retail.minQuantity > 0
        ? product.pricing.retail.minQuantity
        : 1;
    const retailUnit = product.pricing.retail?.unit || "piece";
    // Display retail tier name as "500g" format when minQuantity > 1
    const retailTierName = retailMinQuantity > 1
        ? `${retailMinQuantity}${retailUnit}`
        : product.pricing.retail?.unit || "Retail";

    // For non-bulk products, create a retail tier to show in the modal
    const retailTier: BulkTier = {
        name: retailTierName,
        price: retailPrice,
        minQuantity: retailMinQuantity,
        unit: retailUnit,
    };

    // Default to retail tier (user can then select bulk if they want)
    const [selectedTier, setSelectedTier] = useState<BulkTier>(retailTier);

    // Initialize multipliers for all tiers (1, 2, 3... instead of minQuantity, minQuantity*2, etc.)
    const [tierMultipliers, setTierMultipliers] = useState<Record<string, number>>(() => {
        const initialMultipliers: Record<string, number> = {
            [retailTier.name]: 1, // Always include retail tier
        };

        if (hasBulkTiers) {
            sanitizedBulkTiers.forEach(tier => {
                initialMultipliers[tier.name] = 1;
            });
        }

        return initialMultipliers;
    });

    const [open, setOpen] = useState(false);
    const [backdropVisible, setBackdropVisible] = useState(false);

    // Get the tiers to display - ALWAYS show retail + bulk tiers (if available)
    const displayTiers = hasBulkTiers
        ? [retailTier, ...sanitizedBulkTiers]
        : [retailTier];

    // Calculate actual quantity and total price from multiplier
    const currentMultiplier = tierMultipliers[selectedTier.name] ?? 1;
    const selectedMinQuantity = typeof selectedTier.minQuantity === "number" && selectedTier.minQuantity > 0
        ? selectedTier.minQuantity
        : 1;
    const selectedUnitPrice = typeof selectedTier.price === "number" && Number.isFinite(selectedTier.price)
        ? selectedTier.price
        : retailPrice;
    const actualQuantity = currentMultiplier * selectedMinQuantity;
    const totalPrice = selectedUnitPrice * currentMultiplier;

    // Helper function to pluralize units
    const pluralize = (unit: string, quantity: number): string => {
        if (quantity <= 1) return unit;

        // Don't pluralize weight/volume units
        const lowerUnit = unit.toLowerCase();
        const noPluralizationUnits = ['g', 'kg', 'mg', 'ton', 'l', 'ml', 'litre', 'liter'];
        if (noPluralizationUnits.includes(lowerUnit)) {
            return unit;
        }

        // Handle common irregular plurals and simple pluralization
        if (lowerUnit.endsWith('s') || lowerUnit.endsWith('x') || lowerUnit.endsWith('z') || lowerUnit.endsWith('ch') || lowerUnit.endsWith('sh')) {
            return unit + 'es';
        }
        if (lowerUnit.endsWith('y') && !['ay', 'ey', 'iy', 'oy', 'uy'].some(ending => lowerUnit.endsWith(ending))) {
            return unit.slice(0, -1) + 'ies';
        }
        return unit + 's';
    };

    // Helper function to format tier name with quantity
    const formatTierName = (tier: BulkTier) => {
        const minQty = typeof tier.minQuantity === "number" && tier.minQuantity > 0 ? tier.minQuantity : 1;
        const unitLabel = tier.unit || product.inventory.unit || retailUnit;

        // Check if this is the retail tier (by comparing with retailTier)
        const isRetailTier = tier.name === retailTier.name && tier.price === retailTier.price;

        // Check if tier name already contains the quantity (e.g., "500g")
        const nameContainsQuantity = tier.name?.includes(minQty.toString());

        // Only add quantity in parentheses for actual bulk tiers (not retail) that don't already show the quantity
        if (hasBulkTiers && minQty > 1 && !isRetailTier && !nameContainsQuantity) {
            return `${tier.name} (${minQty} ${pluralize(unitLabel, minQty)})`;
        }
        return tier.name;
    };

    useEffect(() => {
        setOpen(true);
        const timer = setTimeout(() => setBackdropVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleQuantityChange = (tier: BulkTier, type: "add" | "subtract") => {
        setTierMultipliers((prev) => {
            const currentMultiplier = prev[tier.name] ?? 1;
            let newMultiplier = type === "add" ? currentMultiplier + 1 : currentMultiplier - 1;

            // Prevent going below 1
            if (newMultiplier < 1) newMultiplier = 1;

            // Prevent exceeding stock
            const minQty = typeof tier.minQuantity === "number" && tier.minQuantity > 0 ? tier.minQuantity : 1;
            const maxMultiplier = Math.max(1, Math.floor(product.inventory.availableStock / minQty));
            if (newMultiplier > maxMultiplier) newMultiplier = maxMultiplier;

            return { ...prev, [tier.name]: newMultiplier };
        });
    };

    const handleTierChange = (tier: BulkTier) => {
        setSelectedTier(tier);
    };

    const handleAddToCart = async () => {
        if (!selectedTier) return;

        const multiplier = tierMultipliers[selectedTier.name] ?? 1;
        // Check if the selected tier is NOT in the bulk tiers array (making it retail)
        const isRetailTier = !hasBulkTiers || !product.pricing.bulkTiers?.some(t => t.name === selectedTier.name);

        // Format the tier name to include quantity (e.g., "Bucket of Mango (14 pieces)")
        const formattedTierName = formatTierName(selectedTier);

        const unitPrice = typeof selectedTier.price === "number" ? selectedTier.price : retailPrice;
        if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
            alert("Price information for this option is unavailable. Please try again later.");
            return;
        }

        const minQty = typeof selectedTier.minQuantity === "number" && selectedTier.minQuantity > 0
            ? selectedTier.minQuantity
            : 1;

        try {
            await addToCart({
                productId: product._id,
                name: isRetailTier ? product.name : `${product.name} (${formattedTierName})`,
                image: product.images[0],
                price: unitPrice,
                quantity: multiplier, // Use multiplier as quantity (1, 2, 3...)
                unit: selectedTier.unit || retailUnit,
                priceType: isRetailTier ? "retail" : "bulk",
                minQuantity: minQty,
                tierName: selectedTier.name,
            }).unwrap();

            // Show success toast and then cart sidebar
            setShowToast(true);
            handleClose();
            setTimeout(() => {
                setShowCartSidebar(true);
            }, 2000); // Delay to allow toast to be visible before cart sidebar opens
        } catch (error) {
            console.error("Failed to add to cart:", error);
            alert("Failed to add item to cart. Please try again.");
        }
    };

    const handleClose = () => {
        setBackdropVisible(false);
        setTimeout(() => setOpen(false), 150);
        setTimeout(() => onClose(), 450);
    };

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black transition-opacity duration-300 ${backdropVisible ? "opacity-40" : "opacity-0"
                    }`}
                onClick={handleClose}
            />

            {/* Drawer - Nearly full width on mobile, fixed width on larger screens */}
            <div
                className={`ml-auto w-[95%] sm:w-[90%] md:w-[420px] h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"
                    } overflow-y-auto relative flex flex-col`}
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 z-10"
                    aria-label="Close options drawer"
                >
                    <X size={20} className="sm:w-6 sm:h-6" />
                </button>

                <div className="p-4 sm:p-6">
                    {/* Header */}
                    <div className="mb-4 sm:mb-6 pr-8">
                        <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-2">
                            {product.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-600">
                            {hasBulkTiers
                                ? "Pick an option. Please choose your preferred quantity from the options provided"
                                : "Select quantity for this product"}
                        </p>
                    </div>

                    {/* Tier Selection */}
                    <div className="space-y-4">
                        {displayTiers.map((tier) => {
                            const isSelected = selectedTier.name === tier.name;
                            const multiplier = tierMultipliers[tier.name] ?? 1;
                            const minQty = typeof tier.minQuantity === "number" && tier.minQuantity > 0 ? tier.minQuantity : 1;
                            const tierPrice = typeof tier.price === "number" ? tier.price : 0;
                            const maxMultiplier = Math.max(1, Math.floor(product.inventory.availableStock / minQty));

                            return (
                                <div
                                    key={tier.name}
                                    className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 rounded-lg transition-all cursor-pointer ${isSelected ? "bg-gray-50 border border-gray-300" : "border border-transparent"
                                        }`}
                                    onClick={() => handleTierChange(tier)}
                                >
                                    {/* Top row on mobile - Image and Info */}
                                    <div className="flex items-center gap-3 flex-1">
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-16 h-16 sm:w-12 sm:h-12 object-cover rounded-lg flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-xs sm:text-sm text-gray-900 line-clamp-2">
                                                {formatTierName(tier)}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-0.5">₦{formatNaira(tierPrice)}</p>
                                        </div>
                                    </div>

                                    {/* Bottom row on mobile - Quantity and Select button */}
                                    <div className="flex items-center justify-between sm:justify-end gap-3">
                                        {/* Quantity Selector - shows multiplier */}
                                        <div className="flex items-center bg-[#E6E6E6] p-1.5 sm:p-2 rounded-full">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleQuantityChange(tier, "subtract");
                                                }}
                                                disabled={multiplier <= 1}
                                                className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus size={14} className="sm:w-4 sm:h-4" />
                                            </button>

                                            <p className="px-2 text-xs sm:text-sm font-medium">{multiplier}</p>

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleQuantityChange(tier, "add");
                                                }}
                                                disabled={multiplier >= maxMultiplier}
                                                className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                aria-label="Increase quantity"
                                            >
                                                <Plus size={14} className="sm:w-4 sm:h-4" />
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTierChange(tier);
                                            }}
                                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-medium ${isSelected
                                                ? "bg-[#1D7B3C] text-white"
                                                : "bg-[#F5F6F7]"
                                                }`}
                                        >
                                            Select
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary */}
                    <div className="bg-[#F5F5F5] rounded-lg p-3 sm:p-4 my-4 sm:my-6 space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-600">{hasBulkTiers ? "Tier" : "Option"}</span>
                            <span className="font-medium text-right">{formatTierName(selectedTier)}</span>
                        </div>

                        {/* Only show quantity row if multiplier > 1 (buying multiples) */}
                        {currentMultiplier > 1 && (
                            <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-600">Quantity</span>
                                <span className="font-medium">
                                    {selectedMinQuantity > 1
                                        ? `${currentMultiplier} × ${selectedTier.name}`
                                        : `${actualQuantity} ${pluralize(selectedTier.unit || product.inventory.unit || retailUnit, actualQuantity)}`
                                    }
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-600">Unit Price</span>
                            <span className="font-medium">
                                ₦{formatNaira(typeof selectedTier.price === "number" ? selectedTier.price : 0)}
                            </span>
                        </div>
                        <div className="border-t border-gray-300 pt-2 mt-2">
                            <div className="flex justify-between">
                                <span className="font-semibold text-sm sm:text-base text-gray-900">Total</span>
                                <span className="font-bold text-base sm:text-lg text-[#1D7B3C]">
                                    ₦{formatNaira(totalPrice)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Add to Cart Button */}
                    {/* add top margin so the button isn't too close to the summary block above */}
                    <div className="flex items-center justify-center mt-4 sm:mt-6">
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={adding}
                            className="w-full sm:w-auto flex items-center justify-center bg-[#1D7B3C] text-white py-2.5 sm:py-2 px-4 sm:px-3 gap-2 sm:gap-3 font-light text-sm sm:text-base rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {adding ? "Adding..." : "Add to Cart"}{" "}
                            <img src={cartImg} alt="cart" className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Cart Sidebar - shows after adding to cart */}
            <CartSidebar
                isOpen={showCartSidebar}
                onClose={() => setShowCartSidebar(false)}
            />

            {/* Success Toast */}
            {showToast && (
                <Toast
                    message={`${product.name} added to cart successfully!`}
                    onClose={() => setShowToast(false)}
                    duration={5000} // Increased from 4000ms to 5000ms (5 seconds)
                />
            )}
        </div>
    );
};
