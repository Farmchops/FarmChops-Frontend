// src/components/Product/FilterBar.tsx
import React, { useRef, useState } from "react";

interface Category {
    _id: string;
    name: string;
    slug: string;
    image?: string;
    productCount: number;
}

interface CategoryTabsProps {
    categories: Category[];
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
}

const tabClass = (active: boolean) =>
    `shrink-0 whitespace-nowrap border-b-2 px-0.5 py-3.5 text-body font-semibold outline-none transition-colors focus-visible:text-brand-ink ${
        active
            ? "border-brand text-brand-ink"
            : "border-transparent text-ink-muted hover:text-ink"
    }`;

/** Full-width horizontal category tab strip (all breakpoints), drag- and wheel-scrollable. */
export const CategoryTabs: React.FC<CategoryTabsProps> = ({
    categories,
    selectedCategory,
    onCategoryChange,
}) => {
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

    const tabs = [
        { key: "all", label: "All Categories" },
        ...categories.map((c) => ({ key: c.slug, label: c.name })),
    ];

    return (
        <div className="-mx-4 border-b border-line-strong px-4 sm:-mx-5 sm:px-5">
            <div
                ref={scrollRef}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={stopDrag}
                onMouseLeave={stopDrag}
                role="tablist"
                aria-label="Product categories"
                className="flex select-none gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        role="tab"
                        aria-selected={selectedCategory === tab.key}
                        onClick={() => onCategoryChange(tab.key)}
                        className={tabClass(selectedCategory === tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
