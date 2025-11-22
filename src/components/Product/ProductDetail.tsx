// src/pages/ProductDetail.tsx - UPDATED for bulkTiers
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Star, Flame } from "lucide-react";
import cartImg from "../../assets/cart.svg";
import { useGetProductBySlugQuery } from "../../redux/api/productApi";
import { BulkBuying } from "../../components/Product/BulkBuying";
import { useGetActiveDealQuery } from "@/redux/api/dealsApi";
import { normalizeActiveDealPayload } from "@/lib/deals";
import type { Deal, DealMetrics } from "@/types/deals";
import { useAddToCartMutation, useGetCartQuery } from "@/redux/api/cartApi";
import { CartSidebar } from "@/components/Cart/CartSidebar";

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

const formatNaira = (value?: number | null): string => {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return "—";
    }
    return value.toLocaleString();
};

const ProductDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const { data, isLoading, error } = useGetProductBySlugQuery(slug || "", {
        skip: !slug,
    });

    const { data: activeDealResponse, refetch: refetchActiveDeal } = useGetActiveDealQuery(undefined, {
        pollingInterval: 60_000,
    });

    const { data: cartSnapshot } = useGetCartQuery();

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

    const activeDealId = activeDealForProduct?._id
        ?? (activeDealForProduct as { id?: string; dealId?: string })?.id
        ?? (activeDealForProduct as { dealId?: string })?.dealId
        ?? null;

    const dealMetrics = activeDealForProduct ? activeDealPayload.metrics ?? activeDealForProduct.metrics : undefined;

    const [selectedImage, setSelectedImage] = useState(0);
    const [showBulkDrawer, setShowBulkDrawer] = useState(false);
    const [showCartSidebar, setShowCartSidebar] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [recentlyAdded, setRecentlyAdded] = useState(false);

    const [addToCart] = useAddToCartMutation();
    const dealRemainingUnits = activeDealForProduct
        ? computeDealRemaining(activeDealForProduct, dealMetrics)
        : null;
    const dealSoldOut = activeDealForProduct
        ? dealMetrics?.soldOut ?? (typeof dealRemainingUnits === "number" && dealRemainingUnits <= 0)
        : false;
    const dealPerUserLimit = activeDealForProduct?.perUserLimit ?? null;

    const dealUnitsInCart = useMemo(() => {
        if (!activeDealId) return 0;
        const items = cartSnapshot?.cart?.items ?? [];
        return items
            .filter((item) => item.dealId === activeDealId)
            .reduce((total, item) => total + (item.quantity ?? 0), 0);
    }, [cartSnapshot, activeDealId]);

    const perUserRemaining = dealPerUserLimit !== null
        ? Math.max(dealPerUserLimit - dealUnitsInCart, 0)
        : null;
    const dealLimitReached = perUserRemaining !== null && perUserRemaining <= 0;

    const isOutOfStock = product?.status === "out_of_stock" || (product?.inventory?.availableStock ?? 0) === 0;
    const hasBulkTiers = Array.isArray(product?.pricing?.bulkTiers) && (product?.pricing?.bulkTiers?.length ?? 0) > 0;
    const showBulkPricing = !activeDealForProduct && hasBulkTiers;
    const bulkSavings = typeof product?.bulkSavings?.percentage === "number"
        ? product.bulkSavings.percentage
        : 0;
    const canBuyBulk = Boolean(
        showBulkPricing &&
        product?.pricing?.bulkTiers?.some((tier) => {
            const minQty = typeof tier.minQuantity === "number" && tier.minQuantity > 0 ? tier.minQuantity : 0;
            return minQty > 0 && (product?.inventory?.availableStock ?? 0) >= minQty;
        }) &&
        !isOutOfStock
    );

    useEffect(() => {
        if (!canBuyBulk && showBulkDrawer) {
            setShowBulkDrawer(false);
        }
    }, [canBuyBulk, showBulkDrawer]);

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

    const retailPrice = typeof product.pricing.retail?.price === "number" ? product.pricing.retail.price : null;
    const retailUnit = product.pricing.retail?.unit ?? "unit";
    const retailMinQuantity = typeof product.pricing.retail?.minQuantity === "number" && product.pricing.retail.minQuantity > 0
        ? product.pricing.retail.minQuantity
        : 1;

    const primaryButtonLabel = activeDealForProduct
        ? dealSoldOut
            ? "Sold Out"
            : isSubmitting
                ? "Claiming..."
                : recentlyAdded
                    ? "Deal Claimed"
                    : dealLimitReached
                        ? "Limit Reached"
                        : "Claim Deal"
        : isOutOfStock
            ? "Out of Stock"
            : isSubmitting
                ? "Adding..."
                : recentlyAdded
                    ? "Added to Cart"
                    : "Buy Retail";

    const primaryButtonDisabled = Boolean(
        (isOutOfStock && !activeDealForProduct) ||
        isSubmitting ||
        (activeDealForProduct && (dealSoldOut || dealLimitReached))
    );

    const handleRetailAddToCart = async () => {
        if (isOutOfStock && !activeDealForProduct) return;
        if (activeDealForProduct && dealSoldOut) return;
        if (activeDealForProduct && dealLimitReached) {
            alert(`You have reached the limit for this deal.`);
            return;
        }
        if (isSubmitting) return;

        const effectivePrice = activeDealForProduct
            ? (typeof activeDealForProduct.dealPrice === "number" ? activeDealForProduct.dealPrice : null)
            : retailPrice;

        if (effectivePrice === null) {
            alert("Price information for this product is unavailable. Please try again later.");
            return;
        }

        let quantity = retailMinQuantity;
        const unit = retailUnit;

        if (activeDealForProduct && dealPerUserLimit !== null) {
            const maxAdditional = Math.max(dealPerUserLimit - dealUnitsInCart, 0);
            if (maxAdditional <= 0) {
                alert(`You have already claimed the maximum of ${dealPerUserLimit} for this deal.`);
                return;
            }
            if (quantity > maxAdditional) {
                quantity = maxAdditional;
            }
        }

        if (quantity <= 0) {
            alert("Unable to add more of this deal to your cart.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: import("@/redux/api/cartApi").AddToCartRequest = {
                productId: product._id,
                name: product.name,
                image: product.images[0],
                price: effectivePrice,
                quantity,
                unit,
                priceType: "retail",
                minQuantity: quantity,
            };
            // If claiming a deal, always include dealId and tierName
            if (activeDealForProduct && activeDealId) {
                payload.dealId = activeDealId;
                payload.tierName = "deal-of-the-day";
            }
            await addToCart(payload).unwrap();

            setRecentlyAdded(true);
            refetchActiveDeal();
            setTimeout(() => setRecentlyAdded(false), 1500);
            setShowCartSidebar(true);
        } catch (cartError) {
            console.error("Failed to add item to cart", cartError);
            alert("Unable to add item to cart. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
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
                                    {typeof dealRemainingUnits === "number" ? (
                                        <div className="flex flex-col items-start gap-1 text-[#0F2E19] sm:items-end">
                                            <span className="text-xs uppercase tracking-wide text-[#1D7B3C]">Live now</span>
                                            <span className="font-mono text-lg font-semibold">
                                                {dealSoldOut ? "Sold out" : `${dealRemainingUnits} left`}
                                            </span>
                                        </div>
                                    ) : null}
                                </div>
                                <div className="mt-4 flex flex-wrap items-baseline gap-3">
                                    <span className="text-3xl font-bold text-[#0F2E19]">
                                        {typeof activeDealForProduct.dealPrice === "number"
                                            ? `₦${formatNaira(activeDealForProduct.dealPrice)}`
                                            : "Deal price unavailable"}
                                    </span>
                                    {retailPrice !== null ? (
                                        <span className="text-sm text-gray-500 line-through">
                                            ₦{formatNaira(retailPrice)}
                                        </span>
                                    ) : null}
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
                                    Deal price applies automatically at checkout while stock lasts.
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
                                            Min: {retailMinQuantity} {retailUnit}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-2xl font-bold ${activeDealForProduct ? "text-gray-400 line-through" : "text-gray-900"}`}>
                                            {retailPrice !== null ? `₦${formatNaira(retailPrice)}` : "Price unavailable"}
                                        </p>
                                        <p className="text-sm text-gray-500">per {retailUnit}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bulk Tiers Display */}
                            {showBulkPricing && product.pricing.bulkTiers?.map((tier, index) => {
                                const tierMinQty = typeof tier.minQuantity === "number" && tier.minQuantity > 0 ? tier.minQuantity : 0;
                                const tierUnit = tier.unit || retailUnit;
                                const tierPrice = typeof tier.price === "number" && Number.isFinite(tier.price) ? tier.price : null;
                                if (!tierPrice || tierMinQty === 0) {
                                    return null;
                                }

                                const canUseTier = product.inventory.availableStock >= tierMinQty && !isOutOfStock;
                                const tierSavings = retailPrice !== null ? retailPrice - tierPrice : null;
                                const tierSavingsPercent = tierSavings !== null && retailPrice
                                    ? Math.round((tierSavings / retailPrice) * 100)
                                    : null;

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
                                                    {canUseTier && tierSavingsPercent !== null && tierSavingsPercent > 0 && (
                                                        <span className="bg-[#1D7B3C] text-white px-2 py-0.5 rounded text-xs font-medium">
                                                            SAVE {tierSavingsPercent}%
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Min: {tierMinQty} {tierUnit}
                                                </p>
                                                {!canUseTier && (
                                                    <p className="text-xs text-red-600 mt-1">
                                                        Insufficient stock for this tier
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-2xl font-bold ${canUseTier ? "text-[#1D7B3C]" : "text-gray-600"}`}>
                                                    ₦{formatNaira(tierPrice)}
                                                </p>
                                                <p className="text-sm text-gray-600">per {tierUnit}</p>
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

                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Buying Drawer - Slides in from right */}
            {canBuyBulk && showBulkDrawer && (
                <BulkBuying product={product} onClose={() => setShowBulkDrawer(false)} />
            )}

            <CartSidebar isOpen={showCartSidebar} onClose={() => setShowCartSidebar(false)} />
        </div>
    );
};

export default ProductDetail;