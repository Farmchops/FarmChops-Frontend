// src/store/api/cartApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import type { ApiResponse } from '@/types/api';

// Cart Types
export interface CartItem {
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    unit: string;
    priceType: 'retail' | 'bulk';
}


export interface Cart {
    items: CartItem[];
    totalItems: number;
    totalAmount: number;
    lastUpdated: string;
}

export interface AddToCartRequest {
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    unit: string;
    priceType: 'retail' | 'bulk';
}

export interface UpdateCartRequest {
    productId: string;
    quantity: number;
    priceType: 'retail' | 'bulk';
}

export interface RemoveFromCartRequest {
    priceType: 'retail' | 'bulk';
}


export interface ApiResponseCart {
    success: boolean;
    cart: Cart
}

const baseQuery = fetchBaseQuery({
    // baseUrl: '/api',
    baseUrl: "https://api.farmchops.com/api/",
    credentials: 'include', // ✅ CRITICAL: Sends cookies (for session)
    prepareHeaders: (headers, { getState }) => {
        // Send JWT if logged in
        const token = (getState() as RootState).auth.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        headers.set('content-type', 'application/json');
        return headers;
    },
});

export const cartApi = createApi({
    reducerPath: 'cartApi',
    baseQuery,
    tagTypes: ['Cart'],
    endpoints: (builder) => ({
        // Get cart items (works for both anonymous and logged-in users)
        getCart: builder.query<ApiResponseCart, void>({
            query: () => '/cart',
            providesTags: ['Cart'],
        }),

        // Add item to cart (works for both anonymous and logged-in users)
        addToCart: builder.mutation<ApiResponse<{ cart: Cart }>, AddToCartRequest>({
            query: (data) => ({
                url: '/cart/add',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Cart'],
        }),

        // Update cart item quantity
        updateCartItem: builder.mutation<
            ApiResponse<{ cart: Cart }>,
            UpdateCartRequest
        >({
            query: (data) => ({
                url: '/cart/update',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Cart'],
        }),

        // Remove item from cart
        removeFromCart: builder.mutation<
            ApiResponse<{ removedItem: CartItem; cart: Cart }>,
            { productId: string; body: RemoveFromCartRequest }
        >({
            query: ({ productId, body }) => ({
                url: `/cart/remove/${productId}`,
                method: 'DELETE',
                body,
            }),
            invalidatesTags: ['Cart'],
        }),

        // Clear entire cart
        clearCart: builder.mutation<ApiResponse, void>({
            query: () => ({
                url: '/cart/clear',
                method: 'DELETE',
            }),
            invalidatesTags: ['Cart'],
        }),
    }),
});

export const {
    useGetCartQuery,
    useAddToCartMutation,
    useUpdateCartItemMutation,
    useRemoveFromCartMutation,
    useClearCartMutation,
} = cartApi;