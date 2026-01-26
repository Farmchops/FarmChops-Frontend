// src/components/Product/ProductGrid.tsx
import React from "react";
import type { Product } from "../../types/product";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
    products: Product[];
    isSidebarVisible?: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, isSidebarVisible = true }) => {
    return (
        <div className={`grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 ${isSidebarVisible ? 'md:grid-cols-3' : 'md:grid-cols-4'
            }`}>
            {products.map((p) => (
                <ProductCard key={p._id} product={p} />
            ))}
        </div>
    );
};



