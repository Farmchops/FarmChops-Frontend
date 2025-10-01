// src/types/product.ts
export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';
export type ProductQuantityType = 'retail' | 'bulk';
export type ProductAvailability = 'in stock' | 'on sale' | 'low stock';

export interface ProductPricing {
    retail: {
        price: number;
        unit: string; // e.g., "per kg", "per piece"
        minQuantity: number;
    };
    bulk: {
        price: number;
        unit: string; // e.g., "per 25kg bag", "per crate"
        minQuantity: number;
    };
}

export interface ProductInventory {
    availableStock: number;
    lowStockThreshold: number;
    unit: string; // base unit (kg, pieces, bags, etc.)
}

export interface ProductStats {
    viewCount: number;
    orderCount: number;
    totalSold: number;
}

export interface Product {
    _id: string;
    name: string;
    description: string;
    images: string[];
    category: string; // Will be populated from category reference
    pricing: ProductPricing;
    inventory: ProductInventory;
    status: ProductStatus;
    tags: string[];
    slug: string;
    stats: ProductStats;
    seller?: string; // For display purposes
    shareable?: boolean; // Computed based on bulk availability
    createdAt: string;
    updatedAt: string;
}

// For backward compatibility and cart
export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    quantityType: ProductQuantityType;
    unit: string;
}
