// import React from "react";
// import filter from "../../assets/featureIcon/Filter.png";

// interface SortBarProps {
//     totalResults: number;
// }

// export const SortBar: React.FC<SortBarProps> = ({ totalResults }) => {
//     return (
//         <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-green-50">
//             {/* Filter Button */}
//             <button className="px-3 py-2 mt-2 rounded-full bg-[#1D7B3C] text-white text-sm font-light hover:bg-[#20571E] transition flex gap-2">
//                 Filter <img src={filter} alt="filter icon" />
//             </button>


// //Search input here. 

//             {/* Sort Dropdown */}
//             <div className="flex items-center gap-2 relative">
//                 <span className="text-[#808080]">Sort by:</span>
//                 <div className="relative">
//                     <select
//                         className="
//                             appearance-none
//                             p-2
//                             pr-2
//                             rounded-lg
//                             text-[#4D4D4D]
//                             bg-green-50
//                             hover:bg-green-50
//                             focus:outline-none
//                             transition-all duration-200
//                             cursor-pointer
//                         "
//                     >
//                         <option className="bg-white text-[#4D4D4D] hover:bg-green-100">Latest</option>
//                         <option className="bg-white text-[#4D4D4D] hover:bg-green-100">Price: Low to High</option>
//                         <option className="bg-white text-[#4D4D4D] hover:bg-green-100">Price: High to Low</option>
//                     </select>

//                     {/* Custom Dropdown Arrow */}
//                     <svg
//                         className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A] pointer-events-none"
//                         fill="none"
//                         stroke="currentColor"
//                         strokeWidth={2}
//                         viewBox="0 0 24 24"
//                     >
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
//                     </svg>
//                 </div>
//             </div>

//             {/* Results Count */}
//             <p className="text-[#666666]"><span className="text-[#1A1A1A]">{totalResults} </span>Results Found</p>
//         </div>
//     );
// };












// src/components/Product/SortBar.tsx
import React from "react"
import { Search } from "lucide-react"
import filter from "../../assets/featureIcon/Filter.png"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface SortBarProps {
    totalResults: number
    searchTerm: string
    onSearchChange: (term: string) => void
    sortBy: string
    onSortChange: (sort: string) => void
}

export const SortBar: React.FC<SortBarProps> = ({
    searchTerm,
    onSearchChange,
    sortBy,
    onSortChange,
}) => {
    return (
        <div className="bg-green-50 p-4 md:px-8">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                {/* Left side - aligned with sidebar (25% width on large screens) */}
                <div className="lg:w-1/4 flex items-center">
                    {/* Filter Button (Mobile) */}
                    <button type="button" className="px-3 py-2 rounded-full bg-[#1D7B3C] text-white text-sm font-light hover:bg-[#20571E] transition flex gap-2">
                        Filter <img src={filter} alt="filter icon" className="w-4 h-4" />
                    </button>
                </div>

                {/* Right side - aligned with products grid (75% width on large screens) */}
                <div className="flex-1 flex flex-col sm:flex-row items-center gap-4">
                    {/* Search and Sort - left aligned */}
                    <div className="flex items-stretch border border-gray-300 rounded-lg overflow-hidden bg-white">
                        {/* Search */}
                        <div className="relative w-56 sm:w-64">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full h-full pr-10 pl-4 py-2 bg-white focus:outline-none placeholder:text-sm border-none"
                            />
                        </div>

                        {/* Divider */}
                        <div className="w-px bg-gray-300"></div>

                        {/* Sort Dropdown with shadcn Select */}
                        <div className="flex items-center">
                            <Select value={sortBy} onValueChange={onSortChange}>
                                <SelectTrigger className="w-[140px] sm:w-[180px] bg-white border-none h-full rounded-none focus:ring-0">
                                    <SelectValue placeholder="Latest" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="latest">Latest</SelectItem>
                                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                                    <SelectItem value="name">Name: A-Z</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
