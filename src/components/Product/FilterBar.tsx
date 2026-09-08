// src/components/Product/FilterBar.tsx
import React, { useRef, useState } from "react";

interface Category {
    _id: string;
    name: string;
    slug: string;
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
}) => {
    // Drag-to-scroll for the mobile chip row
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const onMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };
    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        scrollRef.current.scrollLeft = scrollLeft - (x - startX) * 1.5;
    };
    const stopDrag = () => setIsDragging(false);

    const chipClass = (active: boolean) =>
        `flex shrink-0 items-center gap-2 whitespace-nowrap rounded-pill px-3.5 py-2 text-meta font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand ${
            active
                ? "bg-brand text-brand-fg"
                : "border border-line-input bg-surface text-ink hover:border-brand hover:text-brand-ink"
        }`;

    const rowClass = (active: boolean) =>
        `flex w-full items-center gap-2 rounded-control px-2 py-2 text-left text-meta outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand ${
            active ? "bg-brand-tint font-medium text-brand-ink" : "text-ink hover:bg-surface-sunken"
        }`;

    return (
        <>
            {/* Mobile / tablet — horizontal chips */}
            <div
                ref={scrollRef}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={stopDrag}
                onMouseLeave={stopDrag}
                className="flex gap-2 overflow-x-auto pb-1 select-none lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                <button type="button" onClick={() => onCategoryChange("all")} className={chipClass(selectedCategory === "all")}>
                    All
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat._id}
                        type="button"
                        onClick={() => onCategoryChange(cat.slug)}
                        className={chipClass(selectedCategory === cat.slug)}
                    >
                        {cat.image && (
                            <img src={cat.image} alt="" className="h-5 w-5 rounded-pill object-cover" />
                        )}
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Desktop — vertical list */}
            <aside className="hidden rounded-card border border-line-strong bg-surface p-3 lg:block">
                <h2 className="px-2 pb-2 text-meta font-semibold text-ink">Categories</h2>
                <ul className="space-y-0.5">
                    <li>
                        <button type="button" onClick={() => onCategoryChange("all")} className={rowClass(selectedCategory === "all")}>
                            All products
                        </button>
                    </li>
                    {categories.map((cat) => (
                        <li key={cat._id}>
                            <button
                                type="button"
                                onClick={() => onCategoryChange(cat.slug)}
                                className={rowClass(selectedCategory === cat.slug)}
                            >
                                {cat.image && (
                                    <img src={cat.image} alt="" className="h-6 w-6 rounded-control object-cover" />
                                )}
                                <span className="truncate">{cat.name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>
        </>
    );
};
