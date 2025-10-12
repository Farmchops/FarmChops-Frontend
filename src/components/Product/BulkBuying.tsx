// src/components/Product/BulkBuying.tsx
import React, { useState, useEffect } from "react";
import { X, Minus, Plus } from "lucide-react";
import type { Product, BulkTier } from "../../types/product";
import { useDispatch } from "react-redux";
import { addItem } from "../../redux/features/cart/cartSlice";
import cartImg from "../../assets/cart.svg";

interface BulkBuyingDrawerProps {
    product: Product;
    onClose: () => void;
}

export const BulkBuying: React.FC<BulkBuyingDrawerProps> = ({
    product,
    onClose,
}) => {
    const dispatch = useDispatch();

    // Find best (cheapest) tier as default
    const bestTier =
        product.pricing.bulkTiers && product.pricing.bulkTiers.length > 0
            ? product.pricing.bulkTiers.reduce((best, tier) => {
                const bestPerUnit = best.price / best.minQuantity;
                const tierPerUnit = tier.price / tier.minQuantity;
                return tierPerUnit < bestPerUnit ? tier : best;
            })
            : null;

    const [selectedTier, setSelectedTier] = useState<BulkTier | null>(bestTier);
    const [tierQuantities, setTierQuantities] = useState<Record<string, number>>(
        () =>
            (product.pricing.bulkTiers ?? []).reduce(
                (acc, tier) => ({
                    ...acc,
                    [tier.name]: tier.minQuantity,
                }),
                {}
            )
    );
    const [adding, setAdding] = useState(false);
    const [open, setOpen] = useState(false);
    const [backdropVisible, setBackdropVisible] = useState(false);

    if (!selectedTier || !product.pricing.bulkTiers?.length) {
        useEffect(() => {
            onClose();
        }, [onClose]);
        return null;
    }

    const totalPrice = selectedTier.price * tierQuantities[selectedTier.name];

    useEffect(() => {
        setOpen(true);
        const timer = setTimeout(() => setBackdropVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleQuantityChange = (tier: BulkTier, type: "add" | "subtract") => {
        setTierQuantities((prev) => {
            const currentQty = prev[tier.name];
            const changeBy = tier.minQuantity;
            let newQty =
                type === "add" ? currentQty + changeBy : currentQty - changeBy;

            // Prevent going below minQuantity
            if (newQty < tier.minQuantity) newQty = tier.minQuantity;

            // Prevent exceeding stock
            if (newQty > product.inventory.availableStock)
                newQty = product.inventory.availableStock;

            return { ...prev, [tier.name]: newQty };
        });
    };

    const handleTierChange = (tier: BulkTier) => {
        setSelectedTier(tier);
    };

    const handleAddToCart = () => {
        if (!selectedTier) return;
        setAdding(true);
        const qty = tierQuantities[selectedTier.name];

        dispatch(
            addItem({
                id: product._id,
                name: `${product.name} (${selectedTier.name})`,
                price: selectedTier.price,
                image: product.images[0],
                quantity: qty,
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
                            {product.name}
                        </h2>
                        <p className="">
                            Pick an option. 
                        </p>
                        <p className="text-sm text-gray-600">
                            Pick an option. Please choose your preferred quantity from the option provided
                        </p>
                    </div>


                    {/* Bulk Tier Selection */}
                    <div className="space-y-4">
                        {product.pricing.bulkTiers?.map((tier) => {
                            const isSelected = selectedTier.name === tier.name;
                            const quantity = tierQuantities[tier.name];

                            return (
                                <div
                                    key={tier.name}
                                    className={`flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer ${isSelected ? "bg-gray-50 border border-gray-300" : ""
                                        }`}
                                    onClick={() => handleTierChange(tier)}
                                >
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-10 h-10 object-cover rounded-lg"
                                    />
                                    <div>
                                        <p
                                            className={`font-medium text-sm text-gray-900 ${isSelected ? "" : ""
                                                }`}
                                        >
                                            {tier.name}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            ₦{tier.price.toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Quantity Selector */}
                                    <div className="flex items-center bg-[#E6E6E6] p-2 rounded-full">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleQuantityChange(tier, "subtract");
                                            }}
                                            disabled={quantity <= tier.minQuantity}
                                            className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Minus size={16} />
                                        </button>

                                        <p className="px-2 text-sm font-medium">{quantity}</p>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleQuantityChange(tier, "add");
                                            }}
                                            disabled={
                                                quantity + tier.minQuantity >
                                                product.inventory.availableStock
                                            }
                                            className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleTierChange(tier);
                                        }}
                                        className={`px-4 py-2 rounded-full text-xs font-medium ${isSelected
                                            ? "bg-[#1D7B3C] text-white"
                                            : "bg-[#F5F6F7]"
                                            }`}
                                    >
                                        Select
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary */}
                    <div className="bg-[#F5F5F5] rounded-lg p-4 my-6 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tier</span>
                            <span className="font-medium">{selectedTier.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Quantity</span>
                            <span className="font-medium">
                                {tierQuantities[selectedTier.name]} {product.inventory.unit}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Unit Price</span>
                            <span className="font-medium">
                                ₦{selectedTier.price.toLocaleString()}
                            </span>
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
                    <div className="flex items-center  justify-center">
                        <button
                            onClick={handleAddToCart}
                            disabled={adding}
                            className="flex items-center bg-[#1D7B3C] text-white py-2 px-3 gap-3 font-light rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {adding ? "Adding..." : "Add to Cart"} <img src={cartImg} alt="cart" className="w-3 h-3" />
                        </button>
                    </div>

                </div>
            </div>


        </div>
    );
};
