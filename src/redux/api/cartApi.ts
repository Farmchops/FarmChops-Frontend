// src/store/api/cartApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import type { ApiResponse } from '@/types/api';
import { createAuthBaseQuery } from './baseQuery';

// Cart Types
export interface CartItem {
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    unit: string;
    priceType: 'retail' | 'bulk';
    dealId?: string;
    minQuantity?: number; // Added to track increment step
    tierName?: string; // Added to differentiate bulk tiers
    multiplier?: number; // Added to handle bulk quantity multipliers
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
    dealId?: string;
    minQuantity?: number; // Added to track increment step
    tierName?: string; // Added to differentiate bulk tiers
    multiplier?: number; // Added to handle bulk quantity multipliers
}

export interface UpdateCartRequest {
    productId: string;
    quantity: number;
    priceType: 'retail' | 'bulk';
    dealId?: string;
    tierName?: string; // Added to identify which bulk tier to update
}

export interface RemoveFromCartRequest {
    priceType: 'retail' | 'bulk';
    dealId?: string;
    tierName?: string; // Added to identify which bulk tier to remove
}


export interface ApiResponseCart {
    success: boolean;
    cart: Cart
}


export const cartApi = createApi({
    reducerPath: 'cartApi',
    baseQuery: createAuthBaseQuery('https://api.farmchops.com/api'),
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