import React from "react";
import { useGetProductsQuery } from "@/redux/api/productApi";
import { ProductRail } from "./ProductRail";

interface CategoryProductRailProps {
    categorySlug: string;
    categoryName: string;
    subtitle?: string;
}

/** A ProductRail bound to one category. Self-fetches; hides itself if empty. */
export const CategoryProductRail: React.FC<CategoryProductRailProps> = ({
    categorySlug,
    categoryName,
    subtitle,
}) => {
    const { data, isLoading } = useGetProductsQuery({
        page: 1,
        limit: 12,
        category: categorySlug,
    });
    const products = (data?.data?.products ?? []).filter((p) => p.status !== "out_of_stock");

    return (
        <ProductRail
            title={categoryName}
            subtitle={subtitle}
            viewAllHref={`/products?category=${categorySlug}`}
            products={products}
            isLoading={isLoading}
        />
    );
};

export default CategoryProductRail;
