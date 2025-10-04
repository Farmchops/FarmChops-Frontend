// src/components/Product/BulkBuyingDrawer.tsx
import React, { useState, useEffect } from "react";
import { X, Minus, Plus } from "lucide-react";
import type { Product } from "../../types/product";
import { useDispatch } from "react-redux";
import { addItem } from "../../redux/features/cart/cartSlice";

interface BulkBuyingDrawerProps {
    product: Product;
    onClose: () => void;
}

export const BulkBuying: React.FC<BulkBuyingDrawerProps> = ({
    product,
    onClose,
}) => {
    const dispatch = useDispatch();
    const [quantity, setQuantity] = useState(product.pricing.bulk.minQuantity);
    const [adding, setAdding] = useState(false);

    const [open, setOpen] = useState(false); // controls drawer
    const [backdropVisible, setBackdropVisible] = useState(false); // controls backdrop fade

    const totalPrice = product.pricing.bulk.price * quantity;
    const savings = product.pricing.retail.price * quantity - totalPrice;
    const savingsPercent = (
        (savings / (product.pricing.retail.price * quantity)) *
        100
    ).toFixed(0);


    useEffect(() => {
        // slide in drawer first
        setOpen(true);
        // then fade backdrop slightly later
        const timer = setTimeout(() => setBackdropVisible(true), 300);
        return () => clearTimeout(timer);
    }, []);

    const handleQuantityChange = (newQty: number) => {
        if (
            newQty >= product.pricing.bulk.minQuantity &&
            newQty <= product.inventory.availableStock
        ) {
            setQuantity(newQty);
        }
    };

    const handleAddToCart = () => {
        setAdding(true);
        dispatch(
            addItem({
                id: product._id,
                name: product.name,
                price: product.pricing.bulk.price,
                image: product.images[0],
                quantity,
                quantityType: "bulk",
                unit: product.pricing.bulk.unit,
            })
        );
        setTimeout(() => {
            setAdding(false);
            handleClose();
        }, 500);
    };

    const handleClose = () => {
        // fade backdrop first
        setBackdropVisible(false);
        // then slide drawer
        setTimeout(() => setOpen(false), 150);
        // finally unmount component
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
                className={`ml-auto w-full sm:w-[400px] h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"
                    } overflow-y-auto relative`}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>

                <div className="p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                            Bulk Purchase
                        </h2>
                        <p className="text-sm text-gray-600">
                            Choose your preferred quantity
                        </p>
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

                    {/* Quantity Selector */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Quantity
                        </label>
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => handleQuantityChange(quantity - 1)}
                                disabled={quantity <= product.pricing.bulk.minQuantity}
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
                                            parseInt(e.target.value) ||
                                            product.pricing.bulk.minQuantity
                                        )
                                    }
                                    min={product.pricing.bulk.minQuantity}
                                    max={product.inventory.availableStock}
                                    className="w-20 text-center text-2xl font-semibold border-0 focus:outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {product.inventory.unit}
                                </p>
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
                            Min: {product.pricing.bulk.minQuantity} | Available:{" "}
                            {product.inventory.availableStock}
                        </p>
                    </div>

                    {/* Summary */}
                    <div className="bg-green-50 rounded-lg p-4 mb-6 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Quantity</span>
                            <span className="font-medium">
                                {quantity} {product.inventory.unit}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Unit Price</span>
                            <span className="font-medium">
                                ₦{product.pricing.bulk.price.toLocaleString()}
                            </span>
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
