import React, { useState } from "react";
import icon1 from "../../assets/productIcon/icon1.png";
import icon2 from "../../assets/productIcon/icon2.png";
import icon3 from "../../assets/productIcon/icon3.png";
import cartImg from "../../assets/cart.svg";
import { DualRangeSlider } from "./DualRangeSlider";
export const FilterSidebar: React.FC = () => {
    const [minPrice, setMinPrice] = useState(500);
    const [maxPrice, setMaxPrice] = useState(1000);
    const [condition, setCondition] = useState<string[]>([]);

    const categories = [
        { name: "Milks & Dairies", count: 11, icon: icon1 },
        { name: "Clothing", count: 13, icon: icon2 },
        { name: "Pet Foods", count: 15, icon: icon3 },
        { name: "Baking Material", count: 25, icon: icon1 },
        { name: "Fresh Fruit", count: 32, icon: icon2 },
    ];

    const toggleCondition = (value: string) => {
        setCondition((prev) =>
            prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
        );
    };

    return (
        <aside className="h-full bg-white rounded-xl shadow-sm p-4 flex flex-col gap-6">
            {/* Categories */}
            <div>
                <h3 className="font-semibold mb-4 pb-4 text-[#253D4E] text-xl inline-block border-b-2 border-[#BCE3C9]">
                    Category
                </h3>
                <ul className="space-y-2">
                    {categories.map((cat, i) => (
                        <li
                            key={i}
                            className="flex items-center justify-between text-sm text-[#1A1A1A] cursor-pointer hover:bg-green-50 px-2 py-2 rounded-lg"
                        >
                            <div className="gap-2 flex items-center">
                                <img src={cat.icon} alt="category icon" />
                                <span>{cat.name}</span>
                            </div>
                            <div className="bg-[#BCE3C9] w-8 h-8 flex items-center justify-center rounded-full">
                                <span className="text-[#253D4E] font-medium text-xs">
                                    {cat.count}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Price Filter */}
            <div className="mt-4">
                <h3 className="font-semibold mb-10 pb-4 text-[#253D4E] text-xl inline-block border-b-2 border-[#BCE3C9]">
                    Fill by price
                </h3>
                <DualRangeSlider
                    min={0}
                    max={10000}
                    step={50}
                    initialMin={minPrice}
                    initialMax={maxPrice}
                    minGap={100}
                    currency="₦"
                    onChange={({ min, max }) => {
                        setMinPrice(min);
                        setMaxPrice(max);
                        console.log('Price range changed:', { min, max });
                    }}
                />
            </div>

            {/* Condition */}
            <div className="mt-4">
                <h3 className="font-semibold mb-4 pb-4 text-[#253D4E] text-xl inline-block border-b-2 border-[#BCE3C9]">
                    Item Condition
                </h3>
                <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={condition.includes("in-stock")}
                            onChange={() => toggleCondition("in-stock")}
                            className="w-5 h-5 appearance-none rounded border border-[#CCCCCC] bg-[#F5F5F5] checked:bg-[#1D7B3C] checked:border-[#1D7B3C]"
                        />
                        In Stock
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={condition.includes("out-of-stock")}
                            onChange={() => toggleCondition("out-of-stock")}
                            className="w-5 h-5 appearance-none rounded border border-[#CCCCCC] bg-[#F5F5F5] checked:bg-[#1D7B3C] checked:border-[#1D7B3C]"
                        />
                        Out of Stock
                    </label>
                </div>
            </div>

            {/* Apply button */}
            <button className="flex items-center w-fit gap-1 px-3 py-2 rounded-md bg-[#1D7B3C] text-white text-xs md:text-sm hover:bg-green-700 transition">
                Apply filters
                <img src={cartImg} alt="cart" className="w-3 h-3 md:w-4 md:h-4" />
            </button>
        </aside>
    );
};
