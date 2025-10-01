// import React, { useState } from "react";
// import icon1 from "../../assets/productIcon/icon1.png";
// import icon2 from "../../assets/productIcon/icon2.png";
// import icon3 from "../../assets/productIcon/icon3.png";
// import cartImg from "../../assets/cart.svg";
// import { DualRangeSlider } from "./DualRangeSlider";
// export const FilterSidebar: React.FC = () => {
//     const [minPrice, setMinPrice] = useState(500);
//     const [maxPrice, setMaxPrice] = useState(1000);
//     const [condition, setCondition] = useState<string[]>([]);

//     const categories = [
//         { name: "Milks & Dairies", count: 11, icon: icon1 },
//         { name: "Clothing", count: 13, icon: icon2 },
//         { name: "Pet Foods", count: 15, icon: icon3 },
//         { name: "Baking Material", count: 25, icon: icon1 },
//         { name: "Fresh Fruit", count: 32, icon: icon2 },
//     ];

//     const toggleCondition = (value: string) => {
//         setCondition((prev) =>
//             prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
//         );
//     };

//     return (
//         <aside className="h-full bg-white rounded-xl shadow-sm p-4 flex flex-col gap-6">
//             {/* Categories */}
//             <div>
//                 <h3 className="font-semibold mb-4 pb-4 text-[#253D4E] text-xl inline-block border-b-2 border-[#BCE3C9]">
//                     Category
//                 </h3>
//                 <ul className="space-y-2">
//                     {categories.map((cat, i) => (
//                         <li
//                             key={i}
//                             className="flex items-center justify-between text-sm text-[#1A1A1A] cursor-pointer hover:bg-green-50 px-2 py-2 rounded-lg"
//                         >
//                             <div className="gap-2 flex items-center">
//                                 <img src={cat.icon} alt="category icon" />
//                                 <span>{cat.name}</span>
//                             </div>
//                             <div className="bg-[#BCE3C9] w-8 h-8 flex items-center justify-center rounded-full">
//                                 <span className="text-[#253D4E] font-medium text-xs">
//                                     {cat.count}
//                                 </span>
//                             </div>
//                         </li>
//                     ))}
//                 </ul>
//             </div>

//             {/* Price Filter */}
//             <div className="mt-4">
//                 <h3 className="font-semibold mb-10 pb-4 text-[#253D4E] text-xl inline-block border-b-2 border-[#BCE3C9]">
//                     Fill by price
//                 </h3>
//                 <DualRangeSlider
//                     min={0}
//                     max={10000}
//                     step={50}
//                     initialMin={minPrice}
//                     initialMax={maxPrice}
//                     minGap={100}
//                     currency="₦"
//                     onChange={({ min, max }) => {
//                         setMinPrice(min);
//                         setMaxPrice(max);
//                         console.log('Price range changed:', { min, max });
//                     }}
//                 />
//             </div>

//             {/* Condition */}
//             <div className="mt-4">
//                 <h3 className="font-semibold mb-4 pb-4 text-[#253D4E] text-xl inline-block border-b-2 border-[#BCE3C9]">
//                     Item Condition
//                 </h3>
//                 <div className="space-y-2 text-sm">
//                     <label className="flex items-center gap-2 cursor-pointer">
//                         <input
//                             type="checkbox"
//                             checked={condition.includes("in-stock")}
//                             onChange={() => toggleCondition("in-stock")}
//                             className="w-5 h-5 appearance-none rounded border border-[#CCCCCC] bg-[#F5F5F5] checked:bg-[#1D7B3C] checked:border-[#1D7B3C]"
//                         />
//                         In Stock
//                     </label>
//                     <label className="flex items-center gap-2 cursor-pointer">
//                         <input
//                             type="checkbox"
//                             checked={condition.includes("out-of-stock")}
//                             onChange={() => toggleCondition("out-of-stock")}
//                             className="w-5 h-5 appearance-none rounded border border-[#CCCCCC] bg-[#F5F5F5] checked:bg-[#1D7B3C] checked:border-[#1D7B3C]"
//                         />
//                         Out of Stock
//                     </label>
//                 </div>
//             </div>

//             {/* Apply button */}
//             <button className="flex items-center w-fit gap-1 px-3 py-2 rounded-md bg-[#1D7B3C] text-white text-xs md:text-sm hover:bg-green-700 transition">
//                 Apply filters
//                 <img src={cartImg} alt="cart" className="w-3 h-3 md:w-4 md:h-4" />
//             </button>
//         </aside>
//     );
// };

















// src/components/Product/FilterSidebar.tsx (Updated to work with new product structure)
import React from 'react';
import { Search, Filter } from 'lucide-react';
import type { Product } from '../../types/product';

interface FilterSidebarProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    priceRange: [number, number];
    onPriceRangeChange: (range: [number, number]) => void;
    products: Product[];
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
    searchTerm,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    priceRange,
    onPriceRangeChange,
    products,
}) => {
    // Get unique categories from products
    const categories = ['all', ...new Set(products.map(p => p.category))];

    // Get price range from products
    const allPrices = products.flatMap(p => [p.pricing.retail.price, p.pricing.bulk.price]);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
            <div className="flex items-center gap-2">
                <Filter size={20} />
                <h2 className="text-lg font-semibold">Filters</h2>
            </div>

            {/* Search */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Search Products</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search by name, description..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]"
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <div className="space-y-2">
                    {categories.map((category) => (
                        <label key={category} className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="category"
                                value={category}
                                checked={selectedCategory === category}
                                onChange={(e) => onCategoryChange(e.target.value)}
                                className="text-[#1D7B3C] focus:ring-[#1D7B3C]"
                            />
                            <span className="text-sm capitalize">
                                {category} {category !== 'all' && `(${products.filter(p => p.category === category).length})`}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Price Range</label>
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) => onPriceRangeChange([parseInt(e.target.value) || 0, priceRange[1]])}
                            placeholder="Min"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]"
                        />
                        <span>-</span>
                        <input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value) || maxPrice])}
                            placeholder="Max"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]"
                        />
                    </div>
                    <div className="text-xs text-gray-500">
                        Range: ₦{minPrice.toLocaleString()} - ₦{maxPrice.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Stock Status */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Availability</label>
                <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" className="text-[#1D7B3C] focus:ring-[#1D7B3C]" />
                        <span className="text-sm">In Stock</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" className="text-[#1D7B3C] focus:ring-[#1D7B3C]" />
                        <span className="text-sm">On Sale</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" className="text-[#1D7B3C] focus:ring-[#1D7B3C]" />
                        <span className="text-sm">Bulk Available</span>
                    </label>
                </div>
            </div>
        </div>
    );
};