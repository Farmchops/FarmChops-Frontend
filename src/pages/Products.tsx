// import React, { useState } from "react";
// import { FilterSidebar } from "../components/Product/FilterBar";
// import { SortBar } from "../components/Product/SortBar";
// import { ProductGrid } from "../components/Product/ProductGrid";
// // import image from "../assets/product.jpg"

// import { mockProducts } from "../data/productdata";
// import ProductPageHero from "../components/Product/ProductPageHero";

// export type ProductAvailability = "in stock" | "on sale" | "sharable product";

// export type ProductQuantityType = "bulk" | "retail";

// export interface Product {
//   id: number;
//   name: string;
//   price: number;
//   image: string;
//   category: string[]; // e.g. ["vegetable", "herbs"]
//   quantity: ProductQuantityType;
//   availability: ProductAvailability;
//   seller?: string;
//   shareable?: boolean;
// }





// const Products: React.FC = () => {
//   const [products] = useState<Product[]>(mockProducts);

//   return (
//     <div>
//       <ProductPageHero />
//       <SortBar totalResults={products.length} />

//       <div className="flex flex-col lg:flex-row min-h-screen bg-green-50 p-4 gap-6">
//         {/* Sidebar */}
//         <div className="lg:w-1/4">
//           <FilterSidebar />
//         </div>

//         {/* Main Content */}
//         <div className="flex-1 flex flex-col gap-4">
//           <ProductGrid products={products} />
//         </div>



//       </div>
//     </div>

//   )
// }

// export default Products




















// src/pages/Products.tsx (Updated)
import React, { useState, useMemo } from "react";
import { FilterSidebar } from "../components/Product/FilterBar";
import { SortBar } from "../components/Product/SortBar";
import { ProductGrid } from "../components/Product/ProductGrid";
import { mockProducts } from "../data/realisticProductData";
import ProductPageHero from "../components/Product/ProductPageHero";
import type { Product } from "../types/product";

// Export the updated Product type
export type { Product } from "../types/product";
export type { ProductAvailability, ProductQuantityType } from "../types/product";

const Products: React.FC = () => {
  const [products] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState<string>("name");

  // Filter and search products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Search filter
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;

      // Price filter (using retail price for filtering)
      const matchesPrice = product.pricing.retail.price >= priceRange[0] &&
        product.pricing.retail.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price_low":
          return a.pricing.retail.price - b.pricing.retail.price;
        case "price_high":
          return b.pricing.retail.price - a.pricing.retail.price;
        case "popular":
          return b.stats.orderCount - a.stats.orderCount;
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  return (
    <div>
      <ProductPageHero />
      <SortBar
        totalResults={filteredProducts.length}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <div className="flex flex-col lg:flex-row min-h-screen bg-green-50 p-4 gap-6">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <FilterSidebar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            products={products}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-4">
          <ProductGrid products={filteredProducts} />
        </div>
      </div>
    </div>
  );
};

export default Products;