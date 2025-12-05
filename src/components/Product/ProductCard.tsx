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
            (tier) => product.inventory.availableStock >= tier.minQuantity
        ) &&
        !isOutOfStock;

    const bulkSavings = product.bulkSavings?.percentage || 0;

    // Create retail tier for non-bulk products
    const retailTier: BulkTier = {
        name: product.pricing.retail.unit || "1 Unit",
        price: product.pricing.retail.price,
        minQuantity: product.pricing.retail.minQuantity || 1,
        unit: product.pricing.retail.unit || "piece",
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
        if (hasBulkTiers && tier.minQuantity > 1) {
            return `${tier.name} (${tier.minQuantity} ${product.inventory.unit})`;
        }
        return tier.name;
    };

    return (
        <>
            <div className="max-w-72 bg-white rounded-xl shadow hover:-translate-y-2 hover:shadow-lg transition-transform duration-300 overflow-hidden relative p-1 md:p-3 flex flex-col h-full">
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
                    <div className="flex items-baseline gap-1">
                        <p className="text-base md:text-lg font-semibold text-[#1A1A1A]">
                            ₦{product.pricing.retail.price.toLocaleString()}
                        </p>
                        <span className="text-sm md:text-base text-gray-500">
                            ({product.pricing.retail.unit})
                        </span>
                    </div>

                    {/* Options button - shows dropdown preview first */}
                    <button
                        type="button"
                        onClick={handleOptionsClick}
                        className="flex items-center justify-center gap-1 text-sm text-gray-700 hover:text-[#1D7B3C] transition w-full py-3"
                    >
                        Options: {allTiers.length}
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
                        className={`w-full flex items-center justify-center gap-1 px-4 py-3 rounded-md text-white text-xs transition ${isOutOfStock
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-[#1D7B3C] hover:bg-green-700"
                            }`}
                    >
                        {isOutOfStock ? "Out of Stock" : "Add to cart"}
                        {!isOutOfStock && <img src={cartImg} alt="cart" className="w-3 h-3" />}
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
