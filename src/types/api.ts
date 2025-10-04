// src/types/api.ts - Base API types
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
}

export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}