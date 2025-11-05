import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import type { ApiResponse } from '@/types/api';
import type { Order } from '@/types/orders';

export interface RiderAssignedOrdersMetrics {
    awaitingPickup?: number;
    enRoute?: number;
    deliveredToday?: number;
    otherStatuses?: number;
    totalAssigned?: number;
}

export interface RiderAssignedOrdersResponse {
    orders: Order[];
    metrics?: RiderAssignedOrdersMetrics;
    meta?: {
        totalAssigned?: number;
        awaitingPickup?: number;
        enRoute?: number;
        deliveredToday?: number;
    };
}

export interface ConfirmDeliveryArgs {
    orderId: string;
    handoverCode: string;
    note?: string;
    proofFiles?: File[];
}

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? 'https://api.farmchops.com/api';

const baseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).adminAuth.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        headers.set('accept', 'application/json');
        return headers;
    },
});

const extractOrders = (result: ApiResponse<RiderAssignedOrdersResponse> | undefined): Order[] => {
    if (!result) {
        return [];
    }

    if (Array.isArray(result.data)) {
        return result.data as unknown as Order[];
    }

    if (result.data && Array.isArray(result.data.orders)) {
        return result.data.orders;
    }

    if (Array.isArray((result as unknown as { orders?: Order[] }).orders)) {
        return (result as unknown as { orders: Order[] }).orders;
    }

    return [];
};

export const riderOrdersApi = createApi({
    reducerPath: 'riderOrdersApi',
    baseQuery,
    tagTypes: ['RiderOrders', 'RiderOrder'],
    endpoints: (builder) => ({
        getAssignedOrders: builder.query<ApiResponse<RiderAssignedOrdersResponse>, void>({
            query: () => ({
                url: '/rider/orders/assigned',
            }),
            providesTags: (result) => {
                const orders = extractOrders(result ?? undefined);
                return orders.length
                    ? [
                        ...orders.map((order) => ({ type: 'RiderOrder' as const, id: order._id })),
                        { type: 'RiderOrders' as const, id: 'LIST' },
                    ]
                    : [{ type: 'RiderOrders' as const, id: 'LIST' }];
            },
        }),

        confirmDelivery: builder.mutation<ApiResponse<{ order: Order }>, ConfirmDeliveryArgs>({
            query: ({ orderId, handoverCode, note, proofFiles }) => {
                const body = new FormData();
                body.append('handoverCode', handoverCode);
                if (note) {
                    body.append('note', note);
                }
                if (proofFiles?.length) {
                    proofFiles.forEach((file) => {
                        body.append('proof', file);
                    });
                }

                return {
                    url: `/rider/orders/${orderId}/confirm-delivery`,
                    method: 'POST',
                    body,
                };
            },
            invalidatesTags: (_result, _error, { orderId }) => [
                { type: 'RiderOrder', id: orderId },
                { type: 'RiderOrders', id: 'LIST' },
            ],
        }),
    }),
});

export const { useGetAssignedOrdersQuery, useConfirmDeliveryMutation } = riderOrdersApi;
