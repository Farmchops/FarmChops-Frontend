import React from "react";
import filter from "../../assets/featureIcon/Filter.png";

interface SortBarProps {
    totalResults: number;
}

export const SortBar: React.FC<SortBarProps> = ({ totalResults }) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-green-50">
            {/* Filter Button */}
            <button className="px-3 py-2 mt-2 rounded-full bg-[#00B207] text-white text-sm font-light hover:bg-[#20571E] transition flex gap-2">
                Filter <img src={filter} alt="filter icon" />
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 relative">
                <span className="text-[#808080]">Sort by:</span>
                <div className="relative">
                    <select
                        className="
                            appearance-none
                            p-2
                            pr-2
                            rounded-lg
                            text-[#4D4D4D]
                            bg-green-50
                            hover:bg-green-50
                            focus:outline-none
                            transition-all duration-200
                            cursor-pointer
                        "
                    >
                        <option className="bg-white text-[#4D4D4D] hover:bg-green-100">Latest</option>
                        <option className="bg-white text-[#4D4D4D] hover:bg-green-100">Price: Low to High</option>
                        <option className="bg-white text-[#4D4D4D] hover:bg-green-100">Price: High to Low</option>
                    </select>

                    {/* Custom Dropdown Arrow */}
                    <svg
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A] pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Results Count */}
            <p className="text-[#666666]"><span className="text-[#1A1A1A]">{totalResults} </span>Results Found</p>
        </div>
    );
};
