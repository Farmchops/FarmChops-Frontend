// src/redux/api/adminOrdersApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import type { ApiResponse } from '@/types/api';

// Types for admin orders (kept minimal for list view; extend as needed)
export type AdminOrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | string; // fallback for any additional statuses

export interface AdminOrderItem {
  product: string;
  productName?: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
}

export interface AdminOrder {
  _id: string;
  orderNumber: string;
  user?: string | { _id: string; firstName?: string; lastName?: string; email?: string };
  items?: AdminOrderItem[];
  subtotal?: number;
  deliveryFee?: number;
  totalAmount?: number; // may be in kobo
  summary?: { totalAmountInNaira?: number };
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus: AdminOrderStatus;
  providerResponse?: any;
  deliveryInfo?: { address?: string; city?: string; phoneNumber?: string };
  createdAt: string;
  updatedAt?: string;
  id?: string;
}

export interface AdminOrdersListResponse {
  orders: AdminOrder[];
  total?: number; // total number of orders
  page?: number; // current page
  pageSize?: number; // items per page
}

const baseQuery = fetchBaseQuery({
  baseUrl: 'https://api.farmchops.com/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).adminAuth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('content-type', 'application/json');
    return headers;
  },
});

export const adminOrdersApi = createApi({
  reducerPath: 'adminOrdersApi',
  baseQuery,
  tagTypes: ['AdminOrders', 'AdminOrder'],
  endpoints: (builder) => ({
    // GET /admin/orders
    getOrders: builder.query<ApiResponse<AdminOrdersListResponse> | ApiResponse<AdminOrder[]>, void>({
      query: () => '/admin/orders',
      providesTags: (result) => {
        const orders = (result as any)?.data?.orders ?? (result as any)?.data ?? [];
        return orders.length
          ? [
              ...orders.map((o: AdminOrder) => ({ type: 'AdminOrder' as const, id: o._id })),
              { type: 'AdminOrders', id: 'LIST' },
            ]
          : [{ type: 'AdminOrders', id: 'LIST' }];
      },
    }),

    // GET /admin/orders/:id
    getOrderById: builder.query<ApiResponse<{ order: AdminOrder }>, string>({
      query: (id) => `/admin/orders/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'AdminOrder', id }],
    }),

    // PATCH /admin/orders/:id/status
    updateOrderStatus: builder.mutation<
      ApiResponse<{ order: AdminOrder }>,
      { id: string; status: string; note?: string }
    >({
      query: ({ id, status, note }) => ({
        url: `/admin/orders/${id}/status`,
        method: 'PATCH',
        body: { status, note },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'AdminOrder', id },
        { type: 'AdminOrders', id: 'LIST' },
      ]
    }),
  }),
});

export const { useGetOrdersQuery, useGetOrderByIdQuery, useUpdateOrderStatusMutation } = adminOrdersApi;
