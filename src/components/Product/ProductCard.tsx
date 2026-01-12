// src/components/Product/ProductCard.tsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Product, BulkTier } from "../../types/product";
import cartImg from "../../assets/cart.svg";
import { BulkBuying } from "./BulkBuying";
import { ChevronDown, CheckCircle, Users } from "lucide-react";

interface ProductCardProps {
    product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const navigate = useNavigate();
    const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isOutOfStock =
        product.status === "out_of_stock" || product.inventory.availableStock === 0;

    const hasBulkTiers =
        product.pricing.bulkTiers && product.pricing.bulkTiers.length > 0;

    const canBuyBulk =
        hasBulkTiers &&
        product.pricing.bulkTiers?.some(
            (tier) => product.inventory.availableStock >= (tier.minQuantity || 1)
        ) &&
        !isOutOfStock;

    const bulkSavings = product.bulkSavings?.percentage || 0;

    // Create retail tier for non-bulk products
    const retailMinQuantity = product.pricing.retail.minQuantity || 1;
    const retailUnit = product.pricing.retail.unit || "piece";
    // Display retail tier name as "500g" format when minQuantity > 1
    const retailTierName = retailMinQuantity > 1
        ? `${retailMinQuantity}${retailUnit}`
        : retailUnit;

    const retailTier: BulkTier = {
        name: retailTierName,
        price: product.pricing.retail.price,
        minQuantity: retailMinQuantity,
        unit: retailUnit,
    };

    // Get all available tiers - ALWAYS show retail + bulk tiers (if available)
    const allTiers = hasBulkTiers ? [retailTier, ...product.pricing.bulkTiers!] : [retailTier];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowOptionsDropdown(false);
            }
        };

        if (showOptionsDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showOptionsDropdown]);

    const handleProductClick = () => {
        navigate(`/products/${product.slug}`);
    };

    const handleOptionsClick = () => {
        setShowOptionsDropdown(!showOptionsDropdown);
    };

    const handleTierSelect = () => {
        setShowOptionsDropdown(false);
        setShowBulkModal(true);
    };

    const formatTierName = (tier: BulkTier) => {
        const minQty = tier.minQuantity || 1;
        const unitLabel = tier.unit || product.inventory.unit || "piece";

        // Check if this is the retail tier
        const isRetailTier = tier.name === retailTier.name && tier.price === retailTier.price;

        // Check if tier name already contains the quantity (e.g., "500g")
        const nameContainsQuantity = tier.name?.includes(minQty.toString());

        // Only add quantity in parentheses for actual bulk tiers (not retail) that don't already show the quantity
        if (hasBulkTiers && minQty > 1 && !isRetailTier && !nameContainsQuantity) {
            return `${tier.name} (${minQty} ${unitLabel})`;
        }
        return tier.name;
    };

    return (
        <>
            <div className="max-w-72 bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden relative p-1 md:p-3 flex flex-col h-full">
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {(product.groupConfig?.enabled || (product as any).groupBuyingEnabled) && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md shadow font-medium flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            GROUP SHARING
                        </span>
                    )}
                    {canBuyBulk && bulkSavings > 0 && (
                        <span className="bg-[#1D7B3C] text-white text-xs px-2 py-1 rounded-md shadow font-medium">
                            SAVE {bulkSavings}%
                        </span>
                    )}
                    {isOutOfStock && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-md shadow">
                            OUT OF STOCK
                        </span>
                    )}
                    {product.isLowStock && !isOutOfStock && (
                        <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-md shadow">
                            LOW STOCK
                        </span>
                    )}
                </div>

                {/* Product Image */}
                <div onClick={handleProductClick} className="cursor-pointer">
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className={`w-full h-48 md:h-60 object-cover ${isOutOfStock ? "opacity-50 grayscale" : ""
                            }`}
                    />
                </div>

                {/* Info Section */}
                <div className="p-2 flex-grow border-t border-[#E6E6E6]">
                    <h3
                        onClick={handleProductClick}
                        className="text-base md:text-xl font-medium text-[#1A1A1A] line-clamp-2 cursor-pointer hover:text-[#1D7B3C] min-h-[48px]"
                    >
                        {product.name}
                    </h3>
                </div>

                {/* Price & Buttons */}
                <div className="px-3 pb-3 space-y-2 mt-auto relative" ref={dropdownRef}>
                    {/* Price Display with unit in parentheses - PricePally style */}
                    <div className="flex items-baseline gap-1.5">
                        <p className="text-lg md:text-xl font-bold text-[#1D7B3C]">
                            ₦{product.pricing.retail.price.toLocaleString()}
                        </p>
                        <span className="text-sm md:text-base text-gray-500 font-medium">
                            ({product.pricing.retail.unit})
                        </span>
                    </div>

                    {/* Options button - shows dropdown preview first */}
                    <button
                        type="button"
                        onClick={handleOptionsClick}
                        className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:text-[#1D7B3C] hover:bg-gray-50 rounded-lg transition-all w-full py-2.5 border border-gray-200"
                    >
                        <span className="font-semibold">{allTiers.length}</span> Options
                        <ChevronDown size={16} className={`text-gray-600 transition-transform ${showOptionsDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Options Dropdown Preview - PricePally style */}
                    {showOptionsDropdown && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                            <div className="p-2 space-y-1">
                                {allTiers.map((tier) => (
                                    <button
                                        key={tier.name}
                                        type="button"
                                        onClick={handleTierSelect}
                                        className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition text-left"
                                    >
                                        <img
                                            src={product.images[0]}
                                            alt={tier.name}
                                            className="w-10 h-10 object-cover rounded"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {formatTierName(tier)}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                ₦{tier.price.toLocaleString()}
                                            </p>
                                        </div>
                                        <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add to Cart Button - opens sidebar directly */}
                    <button
                        type="button"
                        onClick={() => setShowBulkModal(true)}
                        disabled={isOutOfStock}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg ${isOutOfStock
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-[#1D7B3C] hover:bg-green-700"
                            }`}
                    >
                        {isOutOfStock ? "Out of Stock" : "Add to cart"}
                        {!isOutOfStock && <img src={cartImg} alt="cart" className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Bulk Buying Drawer - opens when clicking a tier */}
            {showBulkModal && (
                <BulkBuying product={product} onClose={() => setShowBulkModal(false)} />
            )}
        </>
    );
};
