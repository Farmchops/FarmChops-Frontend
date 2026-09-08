// src/components/Product/SortBar.tsx
import React from "react"
import { Search } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface SortBarProps {
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
        <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative min-w-0 flex-1">
                <Search
                    size={18}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
                />
                <input
                    type="search"
                    placeholder="Search products…"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    aria-label="Search products"
                    className="h-11 w-full rounded-control border border-line-input bg-surface pl-10 pr-3 text-body text-ink outline-none transition-colors placeholder:text-ink-muted focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/40"
                />
            </div>

            <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="h-11 w-[130px] shrink-0 rounded-control border-line-input bg-surface text-meta text-ink sm:w-[170px]">
                    <SelectValue placeholder="Latest" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="price-low">Price: low to high</SelectItem>
                    <SelectItem value="price-high">Price: high to low</SelectItem>
                    <SelectItem value="name">Name: A–Z</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}
