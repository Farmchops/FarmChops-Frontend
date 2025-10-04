import type { PaginationMeta } from "./api";
import type { CategoryReference } from "./category";

// src/types/product.ts - Product types (Complete)
export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';

export interface ProductPricing {
    retail: {
        price: number;
        unit: string;
        minQuantity: number;
        currency?: string;
    };
    bulk: {
        price: number;
        unit: string;
        minQuantity: number;
        currency?: string;
    };
}

export interface ProductInventory {
    availableStock: number;
    lowStockThreshold: number;
    unit: string;
}

export interface ProductStats {
    viewCount: number;
    orderCount: number;
    totalSold: number;
}

export interface BulkSavings {
    amount: number | null;
    percentage: number;
}

// Full product type as returned from API
export interface Product {
    _id: string;
    name: string;
    description: string;
    images: string[];
    category: string; //Category_id
    pricing: ProductPricing;
    inventory: ProductInventory;
    status: ProductStatus;
    tags: string[];
    slug: string;
    stats: ProductStats;
    createdAt: string;
    updatedAt: string;
    __v?: number;
    isLowStock: boolean;
    bulkSavings: BulkSavings;
    id: string;
}

// Product list response
export interface ProductsListResponse {
    products: Product[];
    pagination: PaginationMeta;
}

// Search product type (lighter version)
export interface SearchProduct {
    _id: string;
    name: string;
    images: string[];
    category: CategoryReference;
    pricing: {
        retail: {
            price: number;
        };
    };
    tags: string[];
    slug: string;
    isLowStock: boolean;
    bulkSavings: BulkSavings;
    id: string;
}

export interface SearchProductsResponse {
    products: SearchProduct[];
    count: number;
    query: string;
}

// Product stats response
export interface ProductStatsItem {
    _id: string;
    name: string;
    category: {
        _id: string;
        name: string;
        id: string;
    };
    stats: {
        viewCount?: number;
        orderCount?: number;
    };
    isLowStock: boolean;
    bulkSavings: BulkSavings;
    id: string;
}

export interface ProductStatsResponse {
    summary: {
        total: number;
        active: number;
        inactive: number;
        outOfStock: number;
        lowStock: number;
    };
    lowStockProducts: ProductStatsItem[];
    mostViewed: ProductStatsItem[];
    mostOrdered: ProductStatsItem[];
}

// Request types for Product
export interface UpdateProductPayload {
    name?: string;
    description?: string;
    pricing?: ProductPricing;
    inventory?: ProductInventory;
    status?: ProductStatus;
    tags?: string[];
}

// Cart item type
export type ProductQuantityType = 'retail' | 'bulk';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    quantityType: ProductQuantityType;
    unit: string;
}