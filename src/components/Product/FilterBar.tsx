import React, { useState } from "react";

export const FilterSidebar: React.FC = () => {
    const [minPrice, setMinPrice] = useState(500);
    const [maxPrice, setMaxPrice] = useState(5000);

    const sliderMin = 0;
    const sliderMax = 10000;

    return (
        <div className="p-4">
            {/* Categories */}
            <div className="mb-6">
                <h3 className="font-medium mb-2 text-[#1A1A1A]">All Categories</h3>
                {Array(5)
                    .fill("Vegetables")
                    .map((cat, i) => (
                        <label
                            key={i}
                            className="flex items-center gap-2 mb-1 text-sm hover:bg-green-50 p-1 rounded-lg cursor-pointer"
                        >
                            <input type="radio" name="category" />
                            <span>{cat}</span>{" "}
                            <span className="text-[#808080]">(54)</span>
                        </label>
                    ))}
            </div>

            {/* Price */}
            <div className="mb-6">
                <h3 className="font-medium mb-2">Price</h3>

                {/* Min Price Slider */}
                <input
                    type="range"
                    min={sliderMin}
                    max={maxPrice - 100} // prevent overlap
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="range-slider"
                />

                {/* Max Price Slider */}
                <input
                    type="range"
                    min={minPrice + 100} // prevent overlap
                    max={sliderMax}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="range-slider"
                />

                {/* Price display */}
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>₦{minPrice}</span>
                    <span className="font-semibold text-green-700">₦{maxPrice}</span>
                </div>
            </div>

            {/* Rating */}
            <div className="text-sm">
                <h3 className="font-medium mb-2">Rating</h3>
                {[5, 4, 3, 2, 1].map((star) => (
                    <label
                        key={star}
                        className="flex items-center gap-2 mb-1 hover:bg-green-50 p-1 rounded-lg cursor-pointer"
                    >
                        <input type="checkbox" />
                        <span>{"⭐".repeat(star)} & up</span>
                    </label>
                ))}
            </div>
        </div>
    );
};



