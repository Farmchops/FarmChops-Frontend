// src/components/Product/ProductGrid.tsx
import React from "react";
import type { Product } from "../../types/product";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
    products: Product[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((p) => (
                <ProductCard key={p._id} product={p} />
            ))}
        </div>
    );
};



