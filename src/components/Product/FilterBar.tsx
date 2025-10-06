// import React, { useState } from "react";
// import icon1 from "../../assets/productIcon/icon1.png";
// import icon2 from "../../assets/productIcon/icon2.png";
// import icon3 from "../../assets/productIcon/icon3.png";
// import cartImg from "../../assets/cart.svg";
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
// {/* //min price, max price */}

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







// // src/components/Product/FilterBar.tsx - Updated with API data
// import React from "react";
// import type { Category } from "../../types/category";


// interface FilterSidebarProps {
//     categories: Category[];
//     selectedCategory: string;
//     onCategoryChange: (category: string) => void;
//     priceRange: [number, number];
//     onPriceRangeChange: (range: [number, number]) => void;
//     stockFilter: string[];
//     onStockFilterChange: (filter: string[]) => void;
// }

// export const FilterSidebar: React.FC<FilterSidebarProps> = ({
//     categories,
//     selectedCategory,
//     onCategoryChange,
//     priceRange,
//     onPriceRangeChange,
//     stockFilter,
//     onStockFilterChange,
// }) => {
//     const toggleStockFilter = (value: string) => {
//         if (stockFilter.includes(value)) {
//             onStockFilterChange(stockFilter.filter((f) => f !== value));
//         } else {
//             onStockFilterChange([...stockFilter, value]);
//         }
//     };

//     return (
//         <aside className="h-full bg-white rounded-xl shadow-sm p-4 flex flex-col gap-6">
//             {/* Categories */}
//             <div>
//                 <h3 className="font-semibold mb-4 pb-4 text-[#253D4E] text-xl inline-block border-b-2 border-[#BCE3C9]">
//                     Category
//                 </h3>
//                 <ul className="space-y-2">
//                     <li
//                         onClick={() => onCategoryChange("all")}
//                         className={`flex items-center justify-between text-sm cursor-pointer hover:bg-green-50 px-2 py-2 rounded-lg ${selectedCategory === "all" ? "bg-green-50 text-[#1D7B3C] font-medium" : "text-[#1A1A1A]"
//                             }`}
//                     >
//                         <span>All Products</span>
//                         <div className="bg-[#BCE3C9] w-8 h-8 flex items-center justify-center rounded-full">
//                             <span className="text-[#253D4E] font-medium text-xs">
//                                 {categories.reduce((sum, cat) => sum + cat.productCount, 0)}
//                             </span>
//                         </div>
//                     </li>
//                     {categories.map((cat) => (
//                         <li
//                             key={cat._id}
//                             onClick={() => onCategoryChange(cat._id)}
//                             className={`flex items-center justify-between text-sm cursor-pointer hover:bg-green-50 px-2 py-2 rounded-lg ${selectedCategory === cat._id ? "bg-green-50 text-[#1D7B3C] font-medium" : "text-[#1A1A1A]"
//                                 }`}
//                         >
//                             <div className="gap-2 flex items-center">

//                                 {cat.image && (
//                                     <img src={cat.image} alt={cat.name} className="w-6 h-6 rounded" />
//                                 )}
//                                 <span>{cat.name}</span>
//                             </div>
//                             <div className="bg-[#BCE3C9] w-8 h-8 flex items-center justify-center rounded-full">
//                                 <span className="text-[#253D4E] font-medium text-xs">{cat.productCount}</span>
//                             </div>
//                         </li>
//                     ))}
//                 </ul>
//             </div>

//             {/* Price Filter */}
//             <div className="hidden">
//                 <h3 className="font-semibold mb-4 pb-4 text-[#253D4E] text-xl inline-block border-b-2 border-[#BCE3C9]">
//                     Price Range
//                 </h3>
//                 <div className="space-y-3">
//                     <div className="flex items-center gap-2">
//                         <input
//                             type="number"
//                             value={priceRange[0]}
//                             onChange={(e) => onPriceRangeChange([parseInt(e.target.value) || 0, priceRange[1]])}
//                             placeholder="Min"
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
//                         />
//                         <span className="text-gray-500">-</span>
//                         <input
//                             type="number"
//                             value={priceRange[1]}
//                             onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value) || 1000000])}
//                             placeholder="Max"
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
//                         />
//                     </div>
//                 </div>
//             </div>

//             {/* Stock Condition */}

//         </aside>
//     );
// };









// src/components/Product/FilterBar.tsx
import React from "react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"; // ✅ make sure Shadcn Select is installed

interface Category {
    _id: string;
    name: string;
    image?: string;
    productCount: number;
}

interface FilterSidebarProps {
    categories: Category[];
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    priceRange: [number, number];
    onPriceRangeChange: (range: [number, number]) => void;
    stockFilter: string[];
    onStockFilterChange: (filter: string[]) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
    categories,
    selectedCategory,
    onCategoryChange,
    priceRange,
    onPriceRangeChange,
    stockFilter,
    onStockFilterChange,
}) => {
    const toggleStockFilter = (value: string) => {
        if (stockFilter.includes(value)) {
            onStockFilterChange(stockFilter.filter((f) => f !== value));
        } else {
            onStockFilterChange([...stockFilter, value]);
        }
    };

    const totalProducts = categories.reduce(
        (sum, cat) => sum + cat.productCount,
        0
    );

    return (
        <aside className="h-full md:bg-white rounded-xl shadow-sm p-4 flex flex-col gap-6">
            {/* Categories */}
            <div>
                <h3 className="font-semibold mb-4 pb-4 text-[#253D4E] text-xl inline-block border-b-2 border-[#BCE3C9]">
                    Category
                </h3>

                {/* ✅ Mobile Dropdown */}
                <div className="block md:hidden">
                    <Select
                        value={selectedCategory}
                        onValueChange={(value) => onCategoryChange(value)}
                    >
                        <SelectTrigger className="w-full-  rounded-md text-sm">
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Products ({totalProducts})</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat._id} value={cat._id}>
                                    <div className="flex items-center gap-2">
                                        {cat.image && (
                                            <img
                                                src={cat.image}
                                                alt={cat.name}
                                                className="w-5 h-5 rounded"
                                            />
                                        )}
                                        <span>{cat.name}</span>
                                        <span className="ml-auto text-xs text-gray-500">
                                            ({cat.productCount})
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* ✅ Desktop List */}
                <ul className="space-y-2 hidden lg:block">
                    <li
                        onClick={() => onCategoryChange("all")}
                        className={`flex items-center justify-between text-sm cursor-pointer hover:bg-green-50 px-2 py-2 rounded-lg ${selectedCategory === "all"
                            ? "bg-green-50 text-[#1D7B3C] font-medium"
                            : "text-[#1A1A1A]"
                            }`}
                    >
                        <span>All Products</span>
                        <div className="bg-[#BCE3C9] w-8 h-8 flex items-center justify-center rounded-full">
                            <span className="text-[#253D4E] font-medium text-xs">
                                {totalProducts}
                            </span>
                        </div>
                    </li>
                    {categories.map((cat) => (
                        <li
                            key={cat._id}
                            onClick={() => onCategoryChange(cat._id)}
                            className={`flex items-center justify-between text-sm cursor-pointer hover:bg-green-50 px-2 py-2 rounded-lg ${selectedCategory === cat._id
                                ? "bg-green-50 text-[#1D7B3C] font-medium"
                                : "text-[#1A1A1A]"
                                }`}
                        >
                            <div className="gap-2 flex items-center">
                                {cat.image && (
                                    <img
                                        src={cat.image}
                                        alt={cat.name}
                                        className="w-6 h-6 rounded"
                                    />
                                )}
                                <span>{cat.name}</span>
                            </div>
                            <div className="bg-[#BCE3C9] w-8 h-8 flex items-center justify-center rounded-full">
                                <span className="text-[#253D4E] font-medium text-xs">
                                    {cat.productCount}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Hidden for now — you can enable later */}

            <div className="hidden">
                <h3 className="font-semibold mb-4 pb-4 text-[#253D4E] text-xl inline-block border-b-2 border-[#BCE3C9]">
                    Price Range
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) => onPriceRangeChange([parseInt(e.target.value) || 0, priceRange[1]])}
                            placeholder="Min"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value) || 1000000])}
                            placeholder="Max"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                    </div>
                </div>
            </div>
            <div className="hidden">
                <h3 className="font-semibold mb-4 pb-4 text-[#253D4E] text-xl inline-block border-b-2 border-[#BCE3C9]">
                    Item Condition
                </h3>
                <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={stockFilter.includes("in-stock")}
                            onChange={() => toggleStockFilter("in-stock")}
                            className="w-5 h-5 rounded border-[#CCCCCC] text-[#1D7B3C] focus:ring-[#1D7B3C]"
                        />
                        In Stock
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={stockFilter.includes("out-of-stock")}
                            onChange={() => toggleStockFilter("out-of-stock")}
                            className="w-5 h-5 rounded border-[#CCCCCC] text-[#1D7B3C] focus:ring-[#1D7B3C]"
                        />
                        Out of Stock
                    </label>
                </div>
            </div>
        </aside>
    );
};
