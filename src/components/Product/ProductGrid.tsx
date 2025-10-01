// import React from "react";
// import type { Product } from "../../pages/Products";
// import { ProductCard } from "./ProductCard";

// interface ProductGridProps {
//     products: Product[];
// }

// export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
//     return (
//         <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
//             {products.map((p) => (
//                 <ProductCard key={p.id} product={p} />
//             ))}
//         </div>
//     );
// };








// src/components/Product/ProductGrid.tsx (Updated)
import React from 'react';
import type { Product } from '../../types/product';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
    products: Product[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-xl font-medium text-gray-600 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
            {products.map((product) => (
                <ProductCard key={product._id} product={product} />
            ))}
        </div>
    );
};