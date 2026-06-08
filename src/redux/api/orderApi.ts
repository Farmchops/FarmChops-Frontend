// src/store/api/orderApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import type { ApiResponse } from '@/types/api';
import type {
    CheckoutRequest,
    CheckoutResponse,
    CreateOrderRequest,
    CreateOrderResponse,
    PaymentVerificationResponse,
    AlatVerifyResponse,
    OrderListResponse,
    Order,
} from '@/types/orders';
import { walletApi } from './walletApi';
import { createAuthBaseQuery } from './baseQuery';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? import.meta.env.VITE_API_BASE_URL;

export const orderApi = createApi({
    reducerPath: 'orderApi',
    baseQuery: createAuthBaseQuery(API_BASE_URL),
    tagTypes: ['Order', 'Orders', 'ActiveDeal'],
    endpoints: (builder) => ({
        // Step 1: Checkout - Validate cart and calculate delivery
        checkout: builder.mutation<ApiResponse<CheckoutResponse>, CheckoutRequest>({
            query: (data) => ({
                url: '/orders/checkout',
                method: 'POST',
                body: data,
            }),
        }),

        // Step 2: Create Order - Create order and initialize payment
        createOrder: builder.mutation<ApiResponse<CreateOrderResponse>, CreateOrderRequest>({
            query: (data) => ({
                url: '/orders/create',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Orders'],
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    // If wallet payment, invalidate wallet balance to refresh it
                    if (arg.paymentMethod === 'wallet') {
                        dispatch(walletApi.util.invalidateTags(['WalletBalance']));
                    }
                } catch {
                    // Ignore errors
                }
            },
        }),

        // Step 3: Verify Payment - Verify Paystack payment
        verifyPayment: builder.mutation<
            ApiResponse<PaymentVerificationResponse>,
            string // payment reference
        >({
            query: (reference) => ({
                url: `/orders/paystack/verify/${reference}`,
                method: 'GET',
            }),
            // Also invalidate ActiveDeal to refresh deal stock after purchase
            invalidatesTags: ['Orders', 'Order', 'ActiveDeal'],
        }),

        // Get Order History with pagination
        getOrderHistory: builder.query<
            ApiResponse<OrderListResponse>,
            { page?: number; limit?: number }
        >({
            query: ({ page = 1, limit = 10 }) => `/orders?page=${page}&limit=${limit}`,
            providesTags: (result) =>
                result?.data?.orders
                    ? [
                        ...result.data.orders.map(({ _id }) => ({
                            type: 'Order' as const,
                            id: _id,
                        })),
                        { type: 'Orders', id: 'LIST' },
                    ]
                    : [{ type: 'Orders', id: 'LIST' }],
        }),

        // Get Single Order by ID
        getOrderById: builder.query<ApiResponse<{ order: Order }>, string>({
            query: (orderId) => `/orders/${orderId}`,
            providesTags: (result) =>
                result?.data?.order
                    ? [{ type: 'Order', id: result.data.order._id }]
                    : [],
        }),

        // Verify ALAT Pay transaction
        verifyAlatPayment: builder.mutation<
            ApiResponse<AlatVerifyResponse>,
            { transactionId: string; orderNumber: string }
        >({
            query: (body) => ({
                url: '/orders/alat/verify',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Orders', 'Order'],
        }),

        // Cancel Order
        cancelOrder: builder.mutation<ApiResponse<{ order: Order }>, string>({
            query: (orderId) => ({
                url: `/orders/${orderId}/cancel`,
                method: 'PUT',
            }),
            invalidatesTags: (_result, _error, orderId) => [
                { type: 'Order', id: orderId },
                { type: 'Orders', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useCheckoutMutation,
    useCreateOrderMutation,
    useVerifyPaymentMutation,
    useVerifyAlatPaymentMutation,
    useGetOrderHistoryQuery,
    useGetOrderByIdQuery,
    useCancelOrderMutation,
} = orderApi;