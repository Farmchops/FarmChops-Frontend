// src/store/api/productApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import type {
    Product,
    ProductsListResponse,
    ProductStatsResponse,
    SearchProductsResponse,
    UpdateProductPayload,
    GroupConfig
} from '@/types/product';
import type { ApiResponse } from '@/types/api';
import { createAdminAuthBaseQuery } from './baseQuery';

export const productApi = createApi({
    reducerPath: 'productApi',
    baseQuery: createAdminAuthBaseQuery('https://api.farmchops.com/api'),
    tagTypes: ['Product', 'Products', 'ProductStats'],
    endpoints: (builder) => ({
        // Get all products with pagination (public endpoint)
        getProducts: builder.query<
            ApiResponse<ProductsListResponse>,
            { 
                page?: number; 
                limit?: number; 
                category?: string;
                search?: string;
                minPrice?: number;
                maxPrice?: number;
                inStock?: boolean;
                sort?: string;
                order?: string;
            }
        >({
            query: ({ page = 1, limit = 20, category, search, minPrice, maxPrice, inStock, sort, order }) => {
                const params = new URLSearchParams();
                params.append('page', page.toString());
                params.append('limit', limit.toString());
                
                if (category) params.append('category', category);
                if (search) params.append('search', search);
                if (minPrice !== undefined) params.append('minPrice', minPrice.toString());
                if (maxPrice !== undefined) params.append('maxPrice', maxPrice.toString());
                if (inStock !== undefined) params.append('inStock', inStock.toString());
                if (sort) params.append('sort', sort);
                if (order) params.append('order', order);
                
                return `/products?${params.toString()}`;
            },
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

        // Get all products for admin (includes out_of_stock) - requires authentication
        getAdminProducts: builder.query<
            ApiResponse<ProductsListResponse>,
            { 
                page?: number; 
                limit?: number;
                search?: string;
                status?: string;
                sortBy?: string;
            }
        >({
            query: ({ page = 1, limit = 20, search, status, sortBy }) => {
                const params = new URLSearchParams();
                params.append('page', page.toString());
                params.append('limit', limit.toString());
                
                if (search) params.append('search', search);
                if (status && status !== 'all') params.append('status', status);
                if (sortBy) params.append('sortBy', sortBy);
                
                return `/products/admin?${params.toString()}`;
            },
            providesTags: (result) =>
                result?.data?.products
                    ? [
                        ...result.data.products.map(({ _id }) => ({
                            type: 'Product' as const,
                            id: _id
                        })),
                        { type: 'Products', id: 'ADMIN_LIST' },
                    ]
                    : [{ type: 'Products', id: 'ADMIN_LIST' }],
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

        // Configure group buying for product (Admin only)
        // NOTE: backend exposes this as POST /api/admin/products/:productId/group-config
        configureGroupBuying: builder.mutation<
            ApiResponse<Product>,
            { productId: string; config: GroupConfig }
        >({
            query: ({ productId, config }) => ({
                url: `/admin/products/${productId}/group-config`,
                method: 'POST',
                body: config,
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
            invalidatesTags: (_result, _error, { productId }) => [
                { type: 'Product', id: productId },
                { type: 'Products', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetProductsQuery,
    useGetAdminProductsQuery,
    useGetProductBySlugQuery,
    useSearchProductsQuery,
    useGetProductStatsQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useConfigureGroupBuyingMutation,
} = productApi;