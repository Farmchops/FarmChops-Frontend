// src/pages/Products.tsx - Main Product Page with API
import React, { useState, useMemo } from "react";
import { FilterSidebar } from "../components/Product/FilterBar";
import { SortBar } from "../components/Product/SortBar";
import { ProductGrid } from "../components/Product/ProductGrid";
import ProductPageHero from "../components/Product/ProductPageHero";
import type { Product } from "../types/product";
import { useGetProductsQuery } from "@/redux/api/productApi";
import { useGetCategoriesQuery } from "@/redux/api/categoryApi";
import Footer from "@/components/Footer";

export type { Product };

const Products: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [stockFilter, setStockFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("latest");

  // Fetch products and categories from API
  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery({ page: 1, limit: 100 });
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery();

  const categories = categoriesData?.data?.categories || [];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const products = productsData?.data?.products || [];
    let filtered = [...products];

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.tags.some((tag) => tag.toLowerCase().includes(search))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category._id === selectedCategory);
    }

    // Price filter (using retail price)
    filtered = filtered.filter((p) => {
      const price = p.pricing.retail.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Stock filter
    if (stockFilter.length > 0) {
      filtered = filtered.filter((p) => {
        if (stockFilter.includes("in-stock") && p.status === "active" && p.inventory.availableStock > 0) {
          return true;
        }
        if (stockFilter.includes("out-of-stock") && (p.status === "out_of_stock" || p.inventory.availableStock === 0)) {
          return true;
        }
        return false;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.pricing.retail.price - b.pricing.retail.price;
        case "price-high":
          return b.pricing.retail.price - a.pricing.retail.price;
        case "name":
          return a.name.localeCompare(b.name);
        case "latest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [productsData, searchTerm, selectedCategory, priceRange, stockFilter, sortBy]);

  if (productsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1D7B3C] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ProductPageHero />
      <SortBar
        totalResults={filteredProducts.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <div className="flex flex-col lg:flex-row min-h-screen bg-green-50 p-4 md:px-8 gap-6">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <FilterSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            stockFilter={stockFilter}
            onStockFilterChange={setStockFilter}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-4 mb-16">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <div className="text-gray-400 text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Products;