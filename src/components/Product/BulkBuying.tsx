import React, { useState, useEffect } from "react";
import { X, Minus, Plus } from "lucide-react";
import type { Product, BulkTier } from "../../types/product";
import { useDispatch } from "react-redux";
import { addItem } from "../../redux/features/cart/cartSlice";

interface BulkBuyingDrawerProps {
    product: Product;
    onClose: () => void;
}

export const BulkBuying: React.FC<BulkBuyingDrawerProps> = ({ product, onClose }) => {
    const dispatch = useDispatch();

    // Find the best (cheapest per unit) bulk tier as default
    const bestTier = product.pricing.bulkTiers && product.pricing.bulkTiers.length > 0
        ? product.pricing.bulkTiers.reduce((best, tier) => {
            const bestPerUnit = best.price / best.minQuantity;
            const tierPerUnit = tier.price / tier.minQuantity;
            return tierPerUnit < bestPerUnit ? tier : best;
        })
        : null;

    const [selectedTier, setSelectedTier] = useState<BulkTier | null>(bestTier);
    const [quantity, setQuantity] = useState(bestTier?.minQuantity || 10);
    const [adding, setAdding] = useState(false);
    const [open, setOpen] = useState(false);
    const [backdropVisible, setBackdropVisible] = useState(false);

    // If no bulk tiers, don't render
    if (!selectedTier || !product.pricing.bulkTiers || product.pricing.bulkTiers.length === 0) {
        useEffect(() => {
            onClose();
        }, [onClose]);
        return null;
    }

    const totalPrice = selectedTier.price * quantity;
    const retailTotalPrice = product.pricing.retail.price * quantity;
    const savings = retailTotalPrice - totalPrice;
    const savingsPercent = ((savings / retailTotalPrice) * 100).toFixed(0);

    useEffect(() => {
        setOpen(true);
        const timer = setTimeout(() => setBackdropVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleQuantityChange = (newQty: number) => {
        if (newQty >= selectedTier.minQuantity && newQty <= product.inventory.availableStock) {
            setQuantity(newQty);
        }
    };

    const handleTierChange = (tier: BulkTier) => {
        setSelectedTier(tier);
        if (quantity < tier.minQuantity) {
            setQuantity(tier.minQuantity);
        }
    };

    const handleAddToCart = () => {
        setAdding(true);
        dispatch(
            addItem({
                id: product._id,
                name: `${product.name} (${selectedTier.name})`,
                price: selectedTier.price,
                image: product.images[0],
                quantity,
                quantityType: "bulk",
                unit: selectedTier.unit,
            })
        );
        setTimeout(() => {
            setAdding(false);
            handleClose();
        }, 500);
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

            {/* Drawer */}
            <div
                className={`ml-auto w-full sm:w-[420px] h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"
                    } overflow-y-auto relative`}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
                >
                    <X size={24} />
                </button>

                <div className="p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                            Bulk Purchase
                        </h2>
                        <p className="text-sm text-gray-600">Choose your preferred bulk tier</p>
                    </div>

                    {/* Product Info */}
                    <div className="flex gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                            <p className="text-sm text-gray-600">by {product.category.name}</p>
                        </div>
                    </div>

                    {/* Retail Price Reference */}
                    <div className="mb-4 p-3 border border-gray-200 rounded-lg bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Retail Price</p>
                                <p className="text-xs text-gray-500">{product.pricing.retail.unit}</p>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">
                                ₦{product.pricing.retail.price.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Bulk Tier Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Select Bulk Tier
                        </label>
                        <div className="space-y-2">
                            {product.pricing.bulkTiers.map((tier) => {
                                const isSelected = selectedTier.name === tier.name;
                                const tierSavings = product.pricing.retail.price - tier.price;
                                const tierSavingsPercent = ((tierSavings / product.pricing.retail.price) * 100).toFixed(0);

                                return (
                                    <button
                                        key={tier.name}
                                        onClick={() => handleTierChange(tier)}
                                        className={`w-full p-3 border-2 rounded-lg text-left transition-all ${isSelected
                                            ? 'border-[#1D7B3C] bg-green-50'
                                            : 'border-gray-200 hover:border-[#1D7B3C] bg-white'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-1">
                                            <div>
                                                <p className={`font-medium text-sm ${isSelected ? 'text-[#1D7B3C]' : 'text-gray-900'}`}>
                                                    {tier.name}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    Min: {tier.minQuantity} {tier.unit}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-base font-semibold ${isSelected ? 'text-[#1D7B3C]' : 'text-gray-900'}`}>
                                                    ₦{tier.price.toLocaleString()}
                                                </p>
                                                {parseFloat(tierSavingsPercent) > 0 && (
                                                    <span className="inline-block bg-[#1D7B3C] text-white px-2 py-0.5 rounded text-xs font-medium mt-1">
                                                        Save {tierSavingsPercent}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Quantity
                        </label>
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => handleQuantityChange(quantity - 1)}
                                disabled={quantity <= selectedTier.minQuantity}
                                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Minus size={18} />
                            </button>

                            <div className="text-center">
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) =>
                                        handleQuantityChange(
                                            parseInt(e.target.value) || selectedTier.minQuantity
                                        )
                                    }
                                    min={selectedTier.minQuantity}
                                    max={product.inventory.availableStock}
                                    className="w-20 text-center text-2xl font-semibold border-0 focus:outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">{product.inventory.unit}</p>
                            </div>

                            <button
                                onClick={() => handleQuantityChange(quantity + 1)}
                                disabled={quantity >= product.inventory.availableStock}
                                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                        <p className="text-xs text-center text-gray-500 mt-2">
                            Min: {selectedTier.minQuantity} | Available: {product.inventory.availableStock}
                        </p>
                    </div>

                    {/* Summary */}
                    <div className="bg-green-50 rounded-lg p-4 mb-6 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tier</span>
                            <span className="font-medium">{selectedTier.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Quantity</span>
                            <span className="font-medium">{quantity} {product.inventory.unit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Unit Price</span>
                            <span className="font-medium">₦{selectedTier.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">You Save</span>
                            <span className="font-medium text-[#1D7B3C]">
                                ₦{savings.toLocaleString()} ({savingsPercent}%)
                            </span>
                        </div>
                        <div className="border-t border-green-200 pt-2 mt-2">
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-900">Total</span>
                                <span className="font-bold text-xl text-[#1D7B3C]">
                                    ₦{totalPrice.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        disabled={adding}
                        className="w-full bg-[#1D7B3C] text-white py-3 rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {adding ? "Adding..." : "Add to Cart"}
                    </button>
                </div>
            </div>
        </div>
    );
};