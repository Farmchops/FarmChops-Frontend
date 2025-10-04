// src/types/category.ts - Category types
export interface Category {
    _id: string;
    name: string;
    description?: string;
    slug: string;
    isActive: boolean;
    image?: string;
    productCount: number;
    createdAt: string;
    updatedAt?: string;
    __v?: number;
    id: string;
}

export interface CategoryReference {
    _id: string;
    name: string;
    description?: string;
    slug: string;
    id: string;
}

export interface CategoriesListResponse {
    categories: Category[];
    count: number;
}

export interface DeleteCategoryResponse {
    deletedProductReferences: number;
}

// Request types for Category
export interface CreateCategoryPayload {
    name: string;
    description: string;
    image?: File;
}

export interface UpdateCategoryPayload {
    name?: string;
    description?: string;
    isActive?: boolean;
}
