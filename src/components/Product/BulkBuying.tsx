// src/components/Product/BulkBuying.tsx
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
    const [quantity, setQuantity] = useState(bestTier?.minQuantity || 1);
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
                    

                    {/* Bulk Tier Selection */}
                    <div className="mb-8 border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <div className="space-y-4">
                            {product.pricing.bulkTiers.map((tier) => {
                                const isSelected = selectedTier.name === tier.name;

                                return (
                                    <div
                                        key={tier.name}
                                        className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all cursor-pointer ${isSelected
                                                ? "border-[#1D7B3C] bg-green-50"
                                                : "border-gray-200 bg-white hover:border-[#1D7B3C]"
                                            }`}
                                        onClick={() => handleTierChange(tier)}
                                    >
                                        {/* Tier Info */}
                                        <div>
                                            <p className={`font-medium text-sm ${isSelected ? "text-[#1D7B3C]" : "text-gray-900"
                                                }`}>
                                                {tier.name}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                ₦{tier.price.toLocaleString()}
                                            </p>
                                        </div>

                                        {/* Quantity Selector for this tier */}
                                        {isSelected && (
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleQuantityChange(quantity / 2);
                                                    }}
                                                    disabled={quantity <= selectedTier.minQuantity}
                                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Minus size={16} />
                                                </button>

                                                <input
                                                    type="number"
                                                    value={quantity}
                                                    onChange={(e) => {
                                                        handleQuantityChange(parseInt(e.target.value) || selectedTier.minQuantity);
                                                    }}
                                                    min={selectedTier.minQuantity}
                                                    max={product.inventory.availableStock}
                                                    className="w-12 text-center text-lg font-semibold border-0 focus:outline-none"
                                                />

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleQuantityChange(quantity * 2);
                                                    }}
                                                    disabled={quantity * 2 > product.inventory.availableStock}
                                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Plus size={16} />
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                    className="px-4 py-2 bg-[#1D7B3C] text-white rounded text-xs font-medium hover:bg-green-700"
                                                >
                                                    Select
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-[#F5F5F5] rounded-lg p-4 mb-6 space-y-2">
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
                        <div className="border-t border-gray-300 pt-2 mt-2">
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-900">Total</span>
                                <span className="font-bold text-lg text-[#1D7B3C]">
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