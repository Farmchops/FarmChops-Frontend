// src/pages/ProductDetail.tsx - UPDATED for bulkTiers
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addItem } from "../../redux/features/cart/cartSlice";
import { Heart, ArrowLeft, Star, Truck, Shield, RefreshCw } from "lucide-react";
import cartImg from "../../assets/cart.svg";
import { useGetProductBySlugQuery } from "../../redux/api/productApi";
import { BulkBuying } from "../../components/Product/BulkBuying";

const ProductDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { data, isLoading, error } = useGetProductBySlugQuery(slug || "", {
        skip: !slug,
    });

    const product = data?.data;

    const [selectedImage, setSelectedImage] = useState(0);
    const [showBulkDrawer, setShowBulkDrawer] = useState(false);
    const [adding, setAdding] = useState(false);

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

    const handleRetailAddToCart = () => {
        if (isOutOfStock) return;

        setAdding(true);
        dispatch(
            addItem({
                id: product._id,
                name: product.name,
                price: product.pricing.retail.price,
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

                        {/* Pricing Section */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-900">Pricing Options</h3>

                            {/* Retail Price */}
                            <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-[#1D7B3C] transition-colors">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Retail Price</p>
                                        <p className="text-sm text-gray-500">
                                            Min: {product.pricing.retail.minQuantity} {product.pricing.retail.unit}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900">
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

                        {/* Stock Info */}
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
                                        disabled={adding || isOutOfStock}
                                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white bg-[#1D7B3C] hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Buy Retail
                                        <img src={cartImg} alt="cart" className="w-4 h-4" />
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
                                    disabled={adding || isOutOfStock}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white bg-[#1D7B3C] hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isOutOfStock ? "Out of Stock" : adding ? "Added to Cart" : "Add to Cart"}
                                    {!isOutOfStock && <img src={cartImg} alt="cart" className="w-4 h-4" />}
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