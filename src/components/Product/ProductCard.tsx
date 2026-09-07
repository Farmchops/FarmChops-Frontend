// src/components/Product/ProductCard.tsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Product, BulkTier } from "../../types/product";
import { BulkBuying } from "./BulkBuying";
import { ChevronDown, CheckCircle, Users, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    const isGroupBuy =
        product.groupConfig?.enabled || (product as { groupBuyingEnabled?: boolean }).groupBuyingEnabled;

    // Create retail tier for non-bulk products
    const retailMinQuantity = product.pricing.retail.minQuantity || 1;
    const retailUnit = product.pricing.retail.unit || "piece";

    // Helper to determine if we need space between quantity and unit
    const needsSpace = (unit: string) => {
        const lowerUnit = unit.toLowerCase();
        const measurementUnits = ['g', 'kg', 'mg', 'ton', 'l', 'ml', 'litre', 'liter'];
        return !measurementUnits.includes(lowerUnit);
    };

    // Display retail tier name as "500g" or "3 Pieces" format when minQuantity > 1
    const retailTierName = retailMinQuantity > 1
        ? `${retailMinQuantity}${needsSpace(retailUnit) ? ' ' : ''}${retailUnit}`
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

    // Badges: fixed set, highest-priority two only (see DESIGN_SYSTEM_PLAN.md §3.6)
    const badges: React.ReactNode[] = [];
    if (isOutOfStock) {
        badges.push(<Badge key="oos" variant="danger">Out of stock</Badge>);
    }
    if (isGroupBuy) {
        badges.push(
            <Badge key="group" variant="brandSoft">
                <Users aria-hidden="true" />
                Group buy
            </Badge>
        );
    }
    if (canBuyBulk && bulkSavings > 0) {
        badges.push(<Badge key="bulk" variant="brand">Bulk −{bulkSavings}%</Badge>);
    }
    if (product.isLowStock && !isOutOfStock) {
        badges.push(<Badge key="low" variant="warning">Low stock</Badge>);
    }

    return (
        <>
            <div className="relative flex h-full flex-col overflow-hidden rounded-card border border-line-strong bg-surface transition-colors md:hover:border-line-input">
                {/* Image (navigates to detail) with a floating add button */}
                <div className="relative">
                    {badges.length > 0 && (
                        <div className="absolute left-1.5 top-1.5 z-10 flex flex-col items-start gap-1">
                            {badges.slice(0, 2)}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleProductClick}
                        aria-label={`View ${product.name}`}
                        className="block aspect-square w-full overflow-hidden bg-surface-sunken outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
                    >
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            loading="lazy"
                            onError={(e) => { e.currentTarget.src = ''; }}
                            className={`h-full w-full object-cover ${isOutOfStock ? "opacity-50 grayscale" : ""}`}
                        />
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowBulkModal(true)}
                        disabled={isOutOfStock}
                        aria-label={isOutOfStock ? "Out of stock" : `Add ${product.name} to cart`}
                        className={`absolute bottom-1.5 right-1.5 flex h-11 w-11 items-center justify-center rounded-pill shadow-e2 outline-none ring-2 ring-surface transition-colors focus-visible:ring-brand ${
                            isOutOfStock
                                ? "cursor-not-allowed bg-surface-sunken text-ink-muted"
                                : "bg-brand text-brand-fg hover:bg-brand-hover"
                        }`}
                    >
                        <Plus size={20} aria-hidden="true" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col gap-0.5 p-2 sm:gap-1 sm:p-2.5">
                    <button
                        type="button"
                        onClick={handleProductClick}
                        className="line-clamp-2 text-left text-fine font-medium text-ink outline-none hover:text-brand-ink focus-visible:underline sm:text-meta"
                    >
                        {product.name}
                    </button>

                    <div className="mt-auto flex items-baseline gap-1 pt-0.5">
                        <span className="text-meta font-semibold text-ink sm:text-body">
                            ₦{product.pricing.retail.price.toLocaleString()}
                        </span>
                        <span className="text-fine text-ink-muted">
                            / {product.pricing.retail.unit}
                        </span>
                    </div>

                    {/* Options — compact inline disclosure (only when there's a choice) */}
                    {allTiers.length > 1 && (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={handleOptionsClick}
                            aria-expanded={showOptionsDropdown}
                            className="-mx-1 flex items-center gap-1 rounded-control px-1 py-1 text-fine text-ink-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-brand"
                        >
                            {allTiers.length} options
                            <ChevronDown
                                size={13}
                                className={`transition-transform ${showOptionsDropdown ? "rotate-180" : ""}`}
                            />
                        </button>

                        {showOptionsDropdown && (
                            <div className="absolute bottom-full left-0 right-0 z-50 mb-2 max-h-64 overflow-y-auto rounded-card border border-line-strong bg-surface shadow-e2">
                                <div className="space-y-1 p-2">
                                    {allTiers.map((tier) => (
                                        <button
                                            key={tier.name}
                                            type="button"
                                            onClick={handleTierSelect}
                                            className="flex w-full items-center gap-2 rounded-control p-2 text-left transition-colors hover:bg-surface-sunken"
                                        >
                                            <img
                                                src={product.images[0]}
                                                alt=""
                                                className="h-9 w-9 rounded-control object-cover"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-meta font-medium text-ink">
                                                    {formatTierName(tier)}
                                                </p>
                                                <p className="text-fine text-ink-muted">
                                                    ₦{tier.price.toLocaleString()}
                                                </p>
                                            </div>
                                            <CheckCircle size={16} className="shrink-0 text-brand" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    )}
                </div>
            </div>

            {/* Bulk Buying Drawer - opens when clicking a tier */}
            {showBulkModal && (
                <BulkBuying product={product} onClose={() => setShowBulkModal(false)} />
            )}
        </>
    );
};
