// src/store/api/categoryApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

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

const baseQuery = fetchBaseQuery({
    baseUrl: 'https://api.farmchops.com/api',
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

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

        // Update category (Admin only)
        updateCategory: builder.mutation<
            ApiResponse<CategoryDetailResponse>,
            { id: string; body: { name?: string; description?: string; isActive?: boolean } }
        >({
            query: ({ id, body }) => ({
                url: `/categories/admin/categories/${id}`,
                method: 'PUT',
                body,
                headers: {
                    'Content-Type': 'application/json',
                },
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