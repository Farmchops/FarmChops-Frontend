// src/store/api/orderApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import type { ApiResponse } from '@/types/api';
import type {
    CheckoutRequest,
    CheckoutResponse,
    CreateOrderRequest,
    CreateOrderResponse,
    PaymentVerificationResponse,
    OrderListResponse,
    Order,
} from '@/types/orders';

const baseQuery = fetchBaseQuery({
    baseUrl: '/api',
    credentials: 'include', // keep session cookies for cart/order flows (same-origin)
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        headers.set('content-type', 'application/json');
        return headers;
    },
});

export const orderApi = createApi({
    reducerPath: 'orderApi',
    baseQuery,
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
            invalidatesTags: (result, error, { paymentMethod }) => {
                // If wallet payment, also invalidate wallet balance to refresh it
                if (paymentMethod === 'wallet') {
                    return ['Orders', 'WalletBalance'];
                }
                return ['Orders'];
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
    useGetOrderHistoryQuery,
    useGetOrderByIdQuery,
    useCancelOrderMutation,
} = orderApi;