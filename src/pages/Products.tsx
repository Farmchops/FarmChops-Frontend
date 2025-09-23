import React, { useState } from "react";
import { FilterSidebar } from "../components/Product/FilterBar";
import { SortBar } from "../components/Product/SortBar";
import { ProductGrid } from "../components/Product/ProductGrid";
// import image from "../assets/product.jpg"

import { mockProducts } from "../data/productdata";
import ProductPageHero from "../components/Product/ProductPageHero";

export type ProductAvailability = "in stock" | "on sale" | "sharable product";

export type ProductQuantityType = "bulk" | "retail";

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string[]; // e.g. ["vegetable", "herbs"]
  quantity: ProductQuantityType;
  availability: ProductAvailability;
  seller?: string;
  shareable?: boolean;
}





const Products: React.FC = () => {
  const [products] = useState<Product[]>(mockProducts);

  return (
    <div>
      <ProductPageHero />
      <SortBar totalResults={products.length} />

      <div className="flex flex-col lg:flex-row min-h-screen bg-green-50 p-4 gap-6">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <FilterSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-4">
          <ProductGrid products={products} />
        </div>



      </div>
    </div>

  )
}

export default Products






