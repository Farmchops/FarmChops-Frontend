import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/Product/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductRailProps {
    title: string;
    subtitle?: string;
    viewAllHref: string;
    products: Product[];
    isLoading?: boolean;
    count?: number;
}

const TRACK =
    "flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 " +
    "sm:gap-4 md:grid md:grid-cols-6 md:gap-6 md:overflow-visible md:pb-0 " +
    "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const ITEM = "w-[42%] shrink-0 snap-start sm:w-[30%] md:w-auto";

/** Titled product row — horizontal scroll on mobile, 6-up grid from md. */
export const ProductRail: React.FC<ProductRailProps> = ({
    title,
    subtitle,
    viewAllHref,
    products,
    isLoading = false,
    count = 6,
}) => {
    if (!isLoading && products.length === 0) return null;

    return (
        <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-5 md:py-10">
            <div className="mb-4 flex items-end justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="text-title font-semibold text-ink">{title}</h2>
                    {subtitle && <p className="mt-0.5 text-fine text-ink-muted">{subtitle}</p>}
                </div>
                <Link
                    to={viewAllHref}
                    className="flex shrink-0 items-center gap-1 text-meta font-medium text-brand-ink outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand"
                >
                    View all
                    <ArrowRight size={16} aria-hidden="true" />
                </Link>
            </div>

            <div className={TRACK}>
                {isLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className={ITEM}>
                              <div className="flex flex-col gap-2 rounded-card border border-line-strong bg-surface p-2">
                                  <Skeleton className="aspect-square w-full" />
                                  <Skeleton className="h-4 w-3/4" />
                                  <Skeleton className="h-4 w-1/2" />
                              </div>
                          </div>
                      ))
                    : products.slice(0, count).map((p) => (
                          <div key={p._id} className={ITEM}>
                              <ProductCard product={p} />
                          </div>
                      ))}
            </div>
        </section>
    );
};

export default ProductRail;
