// src/store/api/categoryApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { createAdminAuthBaseQuery } from './baseQuery';

// API Response types
interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
}

interface Category {
    _id: string;
    name: string;
    description?: string;
    slug: string;
    isActive: boolean;
    image?: string;
    productCount: number;
    createdAt: string;
    updatedAt?: string;
    id: string;
}

interface CategoriesResponse {
    categories: Category[];
    count: number;
}

interface CategoryDetailResponse extends Category {
    __v?: number;
}

interface DeleteCategoryResponse {
    deletedProductReferences: number;
}

// Request types
// interface CreateCategoryRequest {
//     name: string;
//     description: string;
//     image?: File;
// }

// interface UpdateCategoryRequest {
//     id: string;
//     name?: string;
//     description?: string;
//     image?: File;
//     isActive?: boolean;
// }

const baseQuery = createAdminAuthBaseQuery(import.meta.env.VITE_API_BASE_URL);

export const categoryApi = createApi({
    reducerPath: 'categoryApi',
    baseQuery,
    tagTypes: ['Category', 'Categories'],
    endpoints: (builder) => ({
        // Get all categories
        getCategories: builder.query<ApiResponse<CategoriesResponse>, void>({
            query: () => '/categories',
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.categories.map(({ _id }) => ({ type: 'Category' as const, id: _id })),
                        { type: 'Categories', id: 'LIST' },
                    ]
                    : [{ type: 'Categories', id: 'LIST' }],
        }),

        // Get single category by slug
        getCategoryBySlug: builder.query<ApiResponse<CategoryDetailResponse>, string>({
            query: (slug) => `/categories/${slug}`,
            providesTags: (result) =>
                result?.data ? [{ type: 'Category', id: result.data._id }] : [],
        }),

        // Create category (Admin only)
        createCategory: builder.mutation<ApiResponse<CategoryDetailResponse>, FormData>({
            query: (formData) => ({
                url: '/categories/admin/categories',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: [{ type: 'Categories', id: 'LIST' }],
        }),

        // Update category (Admin only) - Now supports image uploads via FormData
        updateCategory: builder.mutation<
            ApiResponse<CategoryDetailResponse>,
            { id: string; body: FormData }
        >({
            query: ({ id, body }) => ({
                url: `/categories/admin/categories/${id}`,
                method: 'PUT',
                body,
                // Don't set Content-Type - let browser set it with boundary for FormData
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Category', id },
                { type: 'Categories', id: 'LIST' },
            ],
        }),

        // Delete category (Admin only)
        deleteCategory: builder.mutation<ApiResponse<DeleteCategoryResponse>, string>({
            query: (id) => ({
                url: `/categories/admin/categories/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Categories', id: 'LIST' }],
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useGetCategoryBySlugQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoryApi;