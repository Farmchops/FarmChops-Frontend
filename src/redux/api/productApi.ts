// src/store/api/productApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import type {
    Product,
    ProductsListResponse,
    ProductStatsResponse,
    SearchProductsResponse,
    UpdateProductPayload
} from '@/types/product';
import type { ApiResponse } from '@/types/api';

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

export const productApi = createApi({
    reducerPath: 'productApi',
    baseQuery,
    tagTypes: ['Product', 'Products', 'ProductStats'],
    endpoints: (builder) => ({
        // Get all products with pagination
        getProducts: builder.query<
            ApiResponse<ProductsListResponse>,
            { page?: number; limit?: number }
        >({
            query: ({ page = 1, limit = 20 }) => `/products?page=${page}&limit=${limit}`,
            providesTags: (result) =>
                result?.data?.products
                    ? [
                        ...result.data.products.map(({ _id }) => ({
                            type: 'Product' as const,
                            id: _id
                        })),
                        { type: 'Products', id: 'LIST' },
                    ]
                    : [{ type: 'Products', id: 'LIST' }],
        }),

        // Get single product by slug
        getProductBySlug: builder.query<ApiResponse<Product>, string>({
            query: (slug) => `/products/${slug}`,
            providesTags: (result) =>
                result?.data ? [{ type: 'Product', id: result.data._id }] : [],
        }),

        // Search products
        searchProducts: builder.query<ApiResponse<SearchProductsResponse>, string>({
            query: (searchTerm) => `/products/search?q=${encodeURIComponent(searchTerm)}`,
            providesTags: [{ type: 'Products', id: 'SEARCH' }],
        }),

        // Get product stats (Admin only)
        getProductStats: builder.query<ApiResponse<ProductStatsResponse>, void>({
            query: () => '/products/admin/stats',
            providesTags: [{ type: 'ProductStats', id: 'STATS' }],
        }),

        // Create product (Admin only) - FormData
        createProduct: builder.mutation<ApiResponse<Product>, FormData>({
            query: (formData) => ({
                url: '/products/admin/products',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: [
                { type: 'Products', id: 'LIST' },
                { type: 'ProductStats', id: 'STATS' }
            ],
        }),

        // Update product (Admin only) - JSON body
        updateProduct: builder.mutation<
            ApiResponse<Product>,
            { id: string; body: UpdateProductPayload }
        >({
            query: ({ id, body }) => ({
                url: `/products/admin/products/${id}`,
                method: 'PUT',
                body,
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Product', id },
                { type: 'Products', id: 'LIST' },
                { type: 'ProductStats', id: 'STATS' },
            ],
        }),

        // Delete product (Admin only)
        deleteProduct: builder.mutation<ApiResponse<void>, string>({
            query: (id) => ({
                url: `/products/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [
                { type: 'Products', id: 'LIST' },
                { type: 'ProductStats', id: 'STATS' }
            ],
        }),
    }),
});

export const {
    useGetProductsQuery,
    useGetProductBySlugQuery,
    useSearchProductsQuery,
    useGetProductStatsQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
} = productApi;