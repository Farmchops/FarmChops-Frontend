// src/pages/Products.tsx - Main Product Page with API
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PackageX } from "lucide-react";
import { CategoryTabs } from "../components/Product/FilterBar";
import { SortBar } from "../components/Product/SortBar";
import { ProductGrid } from "../components/Product/ProductGrid";
import type { Product } from "../types/product";
import { useGetProductsQuery } from "@/redux/api/productApi";
import { useGetCategoriesQuery } from "@/redux/api/categoryApi";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/Footer";

export type { Product };

const Products: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  // Read category / search from URL parameters (e.g. links from the home page)
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
    const searchFromUrl = searchParams.get("search");
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
    }
  }, [searchParams]);
  const [priceRange] = useState<[number, number]>([0, 1000000]);
  const [stockFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("latest");

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

  const activeCategory = categories.find((c) => c.slug === selectedCategory);
  const heading = activeCategory
    ? activeCategory.name
    : searchTerm.trim()
      ? `Results for “${searchTerm.trim()}”`
      : "All products";

  const isLoading = productsLoading || categoriesLoading;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Page numbers with ellipsis
  const pageItems = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
  );

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-4 sm:px-5">
        <CategoryTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-heading font-semibold text-ink">{heading}</h1>
            {!isLoading && (
              <p className="mt-0.5 text-meta text-ink-muted">
                {totalResults} {totalResults === 1 ? "item" : "items"}
              </p>
            )}
          </div>
          <div className="sm:w-[420px] sm:shrink-0">
            <SortBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>
        </div>

        <div className="mt-5">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-4 xl:grid-cols-5">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex flex-col gap-2 rounded-card border border-line-strong bg-surface p-2.5">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-card border border-line-strong bg-surface p-12 text-center">
              <PackageX size={40} className="mx-auto mb-3 text-ink-muted" aria-hidden="true" />
              <h3 className="text-body font-semibold text-ink">No products found</h3>
              <p className="mt-1 text-meta text-ink-muted">Try adjusting your search or category.</p>
            </div>
          ) : (
            <>
              <ProductGrid products={products} isSidebarVisible={false} />

              {totalPages > 1 && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 text-meta"
                  >
                    Previous
                  </Button>

                  {pageItems.map((page, idx) => (
                    <React.Fragment key={page}>
                      {idx > 0 && pageItems[idx - 1] !== page - 1 && (
                        <span className="px-1 text-meta text-ink-muted">…</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        aria-current={currentPage === page ? "page" : undefined}
                        className={`h-11 min-w-11 rounded-card px-3 text-meta font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand ${
                          currentPage === page
                            ? "bg-brand text-brand-fg"
                            : "border border-line-input text-ink hover:bg-surface-sunken"
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}

                  <Button
                    variant="secondary"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 text-meta"
                  >
                    Next
                  </Button>
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
