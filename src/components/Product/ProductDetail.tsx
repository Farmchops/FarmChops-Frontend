// src/pages/ProductDetail.tsx - UPDATED for bulkTiers
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addItem } from "../../redux/features/cart/cartSlice";
import { Heart, ArrowLeft, Star, Truck, Shield, RefreshCw, Flame } from "lucide-react";
import cartImg from "../../assets/cart.svg";
import { useGetProductBySlugQuery } from "../../redux/api/productApi";
import { BulkBuying } from "../../components/Product/BulkBuying";
import { useGetActiveDealQuery } from "@/redux/api/dealsApi";
import { normalizeActiveDealPayload } from "@/lib/deals";
import type { Deal, DealMetrics } from "@/types/deals";

const formatDealCountdown = (seconds: number | null): string => {
    if (seconds === null || seconds <= 0) {
        return "";
    }

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (days > 0) {
        parts.push(`${days}d`);
    }
    parts.push(`${hours.toString().padStart(2, "0")}h`);
    parts.push(`${minutes.toString().padStart(2, "0")}m`);
    if (days === 0) {
        parts.push(`${secs.toString().padStart(2, "0")}s`);
    }

    return parts.join(" ");
};

const resolveDealProductId = (deal: Deal | null | undefined): string | null => {
    if (!deal) return null;
    if (deal.productId) return deal.productId;
    const reference = deal.product as unknown as { id?: string; _id?: string } | undefined;
    return reference?.id ?? reference?._id ?? null;
};

const computeDealRemaining = (deal: Deal, metrics?: DealMetrics): number | null => {
    if (!deal) {
        return null;
    }

    if (typeof metrics?.remainingUnits === "number") {
        return Math.max(metrics.remainingUnits, 0);
    }

    const sold = deal.soldUnits ?? 0;
    const reserved = deal.reservedUnits ?? 0;
    const available = deal.maxUnits - sold - reserved;

    if (!Number.isFinite(available)) {
        return null;
    }

    return Math.max(available, 0);
};

const ProductDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();

    const { data, isLoading, error } = useGetProductBySlugQuery(slug || "", {
        skip: !slug,
    });

    const { data: activeDealResponse } = useGetActiveDealQuery(undefined, {
        pollingInterval: 60_000,
    });

    const activeDealPayload = useMemo(() => normalizeActiveDealPayload(activeDealResponse), [activeDealResponse]);

    const product = data?.data;
    const productId = product?._id ?? null;

    const highlightedDealId = searchParams.get("deal");

    const activeDealForProduct = useMemo(() => {
        if (!productId) return null;
        const candidate = activeDealPayload.deal;
        if (!candidate) return null;
        const candidateProductId = resolveDealProductId(candidate);
        if (candidateProductId !== productId) return null;
        if (highlightedDealId && candidate._id !== highlightedDealId) return null;
        return candidate;
    }, [activeDealPayload.deal, productId, highlightedDealId]);

    const dealMetrics = activeDealForProduct ? activeDealPayload.metrics ?? activeDealForProduct.metrics : undefined;

    const [dealCountdown, setDealCountdown] = useState<number | null>(
        dealMetrics?.countdownSeconds ?? null,
    );

    const [selectedImage, setSelectedImage] = useState(0);
    const [showBulkDrawer, setShowBulkDrawer] = useState(false);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (typeof dealMetrics?.countdownSeconds === "number") {
            setDealCountdown(dealMetrics.countdownSeconds);
        } else {
            setDealCountdown(null);
        }
    }, [dealMetrics?.countdownSeconds, activeDealForProduct?._id]);

    useEffect(() => {
        if (dealCountdown === null || dealCountdown <= 0) {
            return;
        }

        const timer = window.setInterval(() => {
            setDealCountdown((previous) => {
                if (previous === null) return previous;
                return previous > 0 ? previous - 1 : 0;
            });
        }, 1000);

        return () => window.clearInterval(timer);
    }, [dealCountdown]);

    const dealCountdownLabel = formatDealCountdown(dealCountdown);
    const dealRemainingUnits = activeDealForProduct
        ? computeDealRemaining(activeDealForProduct, dealMetrics)
        : null;
    const dealSoldOut = activeDealForProduct
        ? dealMetrics?.soldOut ?? (typeof dealRemainingUnits === "number" && dealRemainingUnits <= 0)
        : false;
    const dealPerUserLimit = activeDealForProduct?.perUserLimit ?? null;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1D7B3C] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading product...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
                <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
                <button
                    onClick={() => navigate("/products")}
                    className="bg-[#1D7B3C] text-white px-6 py-2 rounded-lg hover:bg-green-800"
                >
                    Back to Products
                </button>
            </div>
        );
    }

    const isOutOfStock = product.status === "out_of_stock" || product.inventory.availableStock === 0;

    // Check if ANY bulk tier is available
    const hasBulkTiers = product.pricing.bulkTiers && product.pricing.bulkTiers.length > 0;
    const canBuyBulk = hasBulkTiers &&
        product.pricing.bulkTiers?.some(tier =>
            product.inventory.availableStock >= tier.minQuantity
        ) &&
        !isOutOfStock;

    const bulkSavings = product.bulkSavings?.percentage || 0;

    const primaryButtonLabel = activeDealForProduct
        ? dealSoldOut
            ? "Sold Out"
            : adding
                ? "Deal Claimed"
                : "Claim Deal"
        : isOutOfStock
            ? "Out of Stock"
            : adding
                ? "Added to Cart"
                : "Buy Retail";

    const primaryButtonDisabled = Boolean(
        (isOutOfStock && !activeDealForProduct) ||
        adding ||
        (activeDealForProduct && dealSoldOut)
    );

    const handleRetailAddToCart = () => {
        if (isOutOfStock && !activeDealForProduct) return;
        if (activeDealForProduct && dealSoldOut) return;

        setAdding(true);
        dispatch(
            addItem({
                id: product._id,
                name: product.name,
                price: activeDealForProduct ? activeDealForProduct.dealPrice : product.pricing.retail.price,
                image: product.images[0],
                quantity: product.pricing.retail.minQuantity,
                quantityType: "retail",
                unit: product.pricing.retail.unit,
            })
        );
        setTimeout(() => setAdding(false), 700);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Back Button */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate("/products")}
                        className="flex items-center gap-2 text-gray-600 hover:text-[#1D7B3C] transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Products</span>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Images */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg overflow-hidden border">
                            <img
                                src={product.images[selectedImage]}
                                alt={product.name}
                                className="w-full h-96 object-cover"
                            />
                        </div>

                        {product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`border-2 rounded-lg overflow-hidden ${selectedImage === idx ? "border-[#1D7B3C]" : "border-gray-200"
                                            }`}
                                    >
                                        <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-20 object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Details */}
                    <div className="space-y-6">
                        {/* Badges */}
                        <div className="flex gap-2 flex-wrap">
                            {product.category && (
                                <span className="bg-green-100 text-[#1D7B3C] px-3 py-1 rounded-full text-sm font-medium">
                                    {product.category.name}
                                </span>
                            )}
                            {isOutOfStock && (
                                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                                    Out of Stock
                                </span>
                            )}
                            {product.isLowStock && !isOutOfStock && (
                                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                                    Low Stock
                                </span>
                            )}
                            {canBuyBulk && bulkSavings > 0 && (
                                <span className="bg-[#1D7B3C] text-white px-3 py-1 rounded-full text-sm font-medium">
                                    Save up to {bulkSavings}%
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                    <span>4.5 (125 reviews)</span>
                                </div>
                                <span>•</span>
                                <span>{product.stats.orderCount} orders</span>
                                <span>•</span>
                                <span>{product.stats.viewCount} views</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                            <p className="text-gray-600">{product.description}</p>
                        </div>

                        {activeDealForProduct ? (
                            <div className="rounded-xl border-2 border-[#1D7B3C] bg-emerald-50 px-4 py-5">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="space-y-1">
                                        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#0F2E19]">
                                            <Flame className="h-4 w-4 text-[#1D7B3C]" />
                                            Deal of the Day
                                        </span>
                                        <p className="text-lg font-semibold text-[#0F2E19]">
                                            {activeDealForProduct.headline || activeDealForProduct.title || product.name}
                                        </p>
                                        {activeDealForProduct.promoCopy || activeDealForProduct.shortDescription ? (
                                            <p className="text-sm text-[#0F2E19]/80">
                                                {activeDealForProduct.promoCopy ?? activeDealForProduct.shortDescription}
                                            </p>
                                        ) : null}
                                    </div>
                                    {dealCountdownLabel ? (
                                        <div className="flex flex-col items-start gap-1 text-[#0F2E19] sm:items-end">
                                            <span className="text-xs uppercase tracking-wide text-[#1D7B3C]">Ends in</span>
                                            <span className="font-mono text-lg font-semibold">{dealCountdownLabel}</span>
                                        </div>
                                    ) : null}
                                </div>
                                <div className="mt-4 flex flex-wrap items-baseline gap-3">
                                    <span className="text-3xl font-bold text-[#0F2E19]">₦{activeDealForProduct.dealPrice.toLocaleString()}</span>
                                    <span className="text-sm text-gray-500 line-through">
                                        ₦{product.pricing.retail.price.toLocaleString()}
                                    </span>
                                    {activeDealForProduct.discountPercentage ? (
                                        <span className="inline-flex items-center rounded-full bg-[#1D7B3C] px-3 py-1 text-xs font-semibold text-white">
                                            Save {activeDealForProduct.discountPercentage}%
                                        </span>
                                    ) : null}
                                    {typeof dealRemainingUnits === "number" ? (
                                        <span className="text-sm font-medium text-[#1D7B3C]">
                                            {dealSoldOut ? "Sold out" : `Only ${dealRemainingUnits} left at this price`}
                                        </span>
                                    ) : null}
                                </div>
                                {dealPerUserLimit ? (
                                    <p className="mt-2 text-xs text-[#0F2E19]/70">
                                        Limit {dealPerUserLimit} per customer while the offer lasts.
                                    </p>
                                ) : null}
                            </div>
                        ) : null}

                        {/* Pricing Section */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-900">Pricing Options</h3>
                            {activeDealForProduct ? (
                                <p className="text-sm text-[#1D7B3C]">
                                    Deal price applies automatically at checkout while the countdown is active.
                                </p>
                            ) : null}

                            {/* Retail Price */}
                            <div
                                className={`border-2 rounded-lg p-4 transition-colors ${
                                    activeDealForProduct
                                        ? "border-gray-200 bg-gray-50"
                                        : "border-gray-200 hover:border-[#1D7B3C]"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`font-medium ${activeDealForProduct ? "text-gray-600" : "text-gray-900"}`}>
                                            {activeDealForProduct ? "Original Price" : "Retail Price"}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Min: {product.pricing.retail.minQuantity} {product.pricing.retail.unit}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-2xl font-bold ${activeDealForProduct ? "text-gray-400 line-through" : "text-gray-900"}`}>
                                            ₦{product.pricing.retail.price.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-gray-500">per {product.pricing.retail.unit}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bulk Tiers Display */}
                            {hasBulkTiers && product.pricing.bulkTiers?.map((tier, index) => {
                                const canUseTier = product.inventory.availableStock >= tier.minQuantity && !isOutOfStock;
                                const tierSavings = product.pricing.retail.price - tier.price;
                                const tierSavingsPercent = ((tierSavings / product.pricing.retail.price) * 100).toFixed(0);

                                return (
                                    <div
                                        key={index}
                                        className={`border-2 rounded-lg p-4 transition-colors ${canUseTier
                                            ? "border-[#1D7B3C] bg-green-50 hover:bg-green-100"
                                            : "border-gray-200 bg-gray-50 opacity-60"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className={`font-medium ${canUseTier ? "text-[#1D7B3C]" : "text-gray-600"}`}>
                                                        {tier.name}
                                                    </p>
                                                    {canUseTier && parseFloat(tierSavingsPercent) > 0 && (
                                                        <span className="bg-[#1D7B3C] text-white px-2 py-0.5 rounded text-xs font-medium">
                                                            SAVE {tierSavingsPercent}%
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Min: {tier.minQuantity} {tier.unit}
                                                </p>
                                                {!canUseTier && (
                                                    <p className="text-xs text-red-600 mt-1">
                                                        Insufficient stock for this tier
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-2xl font-bold ${canUseTier ? "text-[#1D7B3C]" : "text-gray-600"}`}>
                                                    ₦{tier.price.toLocaleString()}
                                                </p>
                                                <p className="text-sm text-gray-600">per {tier.unit}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Stock / Deal Info */}
                        {activeDealForProduct ? (
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="text-sm font-medium text-[#0F2E19]">Deal availability</span>
                                    <span className={`text-sm font-semibold ${dealSoldOut ? "text-red-600" : "text-[#1D7B3C]"}`}>
                                        {dealSoldOut ? "Sold out" : `${dealRemainingUnits ?? 0} left`}
                                    </span>
                                </div>
                                {dealPerUserLimit ? (
                                    <p className="mt-1 text-xs text-[#0F2E19]/70">
                                        Limit {dealPerUserLimit} per customer while the offer is live.
                                    </p>
                                ) : null}
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700">Availability</span>
                                    <span className={`font-medium ${isOutOfStock ? "text-red-600" : "text-green-600"}`}>
                                        {isOutOfStock
                                            ? "Out of Stock"
                                            : `${product.inventory.availableStock} ${product.inventory.unit} in stock`
                                        }
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {product.tags.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.tags.map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-4">
                            {canBuyBulk ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={handleRetailAddToCart}
                                        disabled={primaryButtonDisabled}
                                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white bg-[#1D7B3C] hover:bg-green-800 transition-colors disabled:cursor-not-allowed disabled:bg-[#1D7B3C]/60"
                                    >
                                        {primaryButtonLabel}
                                        {!primaryButtonDisabled && !dealSoldOut && (
                                            <img src={cartImg} alt="cart" className="w-4 h-4" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowBulkDrawer(true)}
                                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white bg-[#1D7B3C] hover:bg-green-800 transition-colors border-2 border-[#1D7B3C]"
                                    >
                                        Buy Bulk
                                        <img src={cartImg} alt="cart" className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleRetailAddToCart}
                                    disabled={primaryButtonDisabled}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white bg-[#1D7B3C] hover:bg-green-800 transition-colors disabled:cursor-not-allowed disabled:bg-[#1D7B3C]/60"
                                >
                                    {primaryButtonLabel}
                                    {!primaryButtonDisabled && !dealSoldOut && (
                                        <img src={cartImg} alt="cart" className="w-4 h-4" />
                                    )}
                                </button>
                            )}

                            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                                <Heart size={20} />
                                Add to Wishlist
                            </button>
                        </div>

                        {/* Features */}
                        <div className="border-t pt-6 space-y-3">
                            <div className="flex items-center gap-3 text-gray-700">
                                <Truck className="text-[#1D7B3C]" size={20} />
                                <span className="text-sm">Free delivery for orders above ₦10,000</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <Shield className="text-[#1D7B3C]" size={20} />
                                <span className="text-sm">100% quality guarantee</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <RefreshCw className="text-[#1D7B3C]" size={20} />
                                <span className="text-sm">Easy returns within 7 days</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Buying Drawer - Slides in from right */}
            {showBulkDrawer && (
                <BulkBuying product={product} onClose={() => setShowBulkDrawer(false)} />
            )}
        </div>
    );
};

export default ProductDetail;