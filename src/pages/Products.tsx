// src/pages/Products.tsx - Main Product Page with API
import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  // Read category from URL parameter on mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [stockFilter, setStockFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("latest");

  // Fetch products and categories from API
  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery({
    page: currentPage,
    limit: productsPerPage
  });
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery();

  const categories = categoriesData?.data?.categories || [];

  // Get pagination metadata from API response
  const totalPages = productsData?.data?.pagination?.totalPages || 1;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, priceRange, stockFilter, sortBy]);

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

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

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
            <>
              <ProductGrid products={filteredProducts} />

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 bg-white rounded-lg p-4 shadow">
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg font-medium transition ${currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-[#1D7B3C] text-white hover:bg-green-700'
                      }`}
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first page, last page, current page, and pages around current
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, idx, arr) => (
                        <React.Fragment key={page}>
                          {/* Add ellipsis if there's a gap */}
                          {idx > 0 && arr[idx - 1] !== page - 1 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${currentPage === page
                                ? 'bg-[#1D7B3C] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg font-medium transition ${currentPage === totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-[#1D7B3C] text-white hover:bg-green-700'
                      }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Products;