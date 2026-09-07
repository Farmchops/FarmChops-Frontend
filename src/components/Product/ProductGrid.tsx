// src/components/Product/ProductGrid.tsx
import React from "react";
import type { Product } from "../../types/product";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
    products: Product[];
    isSidebarVisible?: boolean;
}

// Compact grid — more product per screen (cf. Pricepally / Farm to People).
// gutter 10 / 12 / 16 ; columns without sidebar 2 / 3 / 4 / 5, with sidebar 2 / 2 / 3 / 4
export const ProductGrid: React.FC<ProductGridProps> = ({ products, isSidebarVisible = true }) => {
    return (
        <div
            className={`grid grid-cols-2 gap-2.5 sm:gap-3 lg:gap-4 ${
                isSidebarVisible
                    ? "lg:grid-cols-3 xl:grid-cols-4"
                    : "sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            }`}
        >
            {products.map((p) => (
                <ProductCard key={p._id} product={p} />
            ))}
        </div>
    );
};
