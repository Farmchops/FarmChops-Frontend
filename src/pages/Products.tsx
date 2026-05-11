// src/pages/Products.tsx - Main Product Page with API
import React, { useState, useEffect } from "react";
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
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Map user-friendly sort values to backend parameters
  const getSortParams = (sortValue: string): { sort?: string; order?: string } => {
    switch (sortValue) {
      case "latest":
        return { sort: "createdAt", order: "desc" };
      case "price-low":
        return { sort: "pricing.retail.price", order: "asc" };
      case "price-high":
        return { sort: "pricing.retail.price", order: "desc" };
      case "name":
        return { sort: "name", order: "asc" };
      default:
        return { sort: "createdAt", order: "desc" };
    }
  };

  const sortParams = getSortParams(sortBy);

  // Fetch products and categories from API with all filters
  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery({
    page: currentPage,
    limit: productsPerPage,
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    search: searchTerm.trim() || undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    inStock: stockFilter.includes("in-stock") && !stockFilter.includes("out-of-stock") ? true : undefined,
    sort: sortParams.sort,
    order: sortParams.order
  });
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery();

  const categories = categoriesData?.data?.categories || [];

  // Get pagination metadata and products from API response
  const totalPages = productsData?.data?.pagination?.totalPages || 1;
  const totalResults = productsData?.data?.pagination?.totalProducts || 0;
  const products = [...(productsData?.data?.products || [])].sort((a, b) => {
    const aOut = a.status === 'out_of_stock' ? 1 : 0;
    const bOut = b.status === 'out_of_stock' ? 1 : 0;
    return aOut - bOut;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, priceRange, stockFilter, sortBy]);

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
        totalResults={totalResults}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <div className="flex flex-col lg:flex-row min-h-screen bg-green-50 p-4 md:px-8 gap-6">
        {/* Sidebar */}
        <div className={`lg:w-1/4 transition-all duration-300 ${isSidebarVisible ? 'block' : 'hidden'}`}>
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

        {/* Toggle Button (Show when sidebar is hidden) */}
        {!isSidebarVisible && (
          <button
            onClick={() => setIsSidebarVisible(true)}
            className="fixed top-24 left-4 z-50 bg-[#1D7B3C] text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-all"
            title="Show Filters"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        )}

        {/* Main Content */}
        <div className={`flex-1 flex flex-col gap-4 mb-16 transition-all duration-300 ${!isSidebarVisible ? 'lg:w-full' : ''}`}>
          {/* Close Sidebar Button (Show when sidebar is visible, desktop only) */}
          {isSidebarVisible && (
            <button
              onClick={() => setIsSidebarVisible(false)}
              className="hidden lg:flex items-center gap-2 self-start bg-[#1D7B3C] text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all text-sm font-medium shadow-sm"
              title="Hide category filters to view more products"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
              Hide Filters
            </button>
          )}
          {products.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <div className="text-gray-400 text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <ProductGrid products={products} isSidebarVisible={isSidebarVisible} />

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