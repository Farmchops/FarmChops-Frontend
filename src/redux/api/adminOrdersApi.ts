// src/redux/api/adminOrdersApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { createAdminAuthBaseQuery } from './baseQuery';
import type { ApiResponse } from '@/types/api';
import type { Order, OrderStatus, StageOwnerRole } from '@/types/orders';
import type { OrderWorkflowAction } from '@/utils/orderWorkflow';

export type AdminOrder = Order;

export interface AdminOrdersListResponse {
  orders: AdminOrder[];
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface OrderActionsPayload {
  actions: OrderWorkflowAction[];
}

export interface GetOrdersQueryArgs {
  status?: OrderStatus | string;
  page?: number;
  limit?: number;
  search?: string;
  ownerRole?: StageOwnerRole | string;
  sort?: string;
  date?: string;
}

export interface TriggerOrderActionArgs {
  id: string;
  action: OrderWorkflowAction;
  payload?: Record<string, unknown> | FormData;
}

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? import.meta.env.VITE_API_BASE_URL;

const baseQuery = createAdminAuthBaseQuery(API_BASE_URL);

export const adminOrdersApi = createApi({
  reducerPath: 'adminOrdersApi',
  baseQuery,
  tagTypes: ['AdminOrders', 'AdminOrder', 'OrderActions'],
  endpoints: (builder) => ({
    getOrders: builder.query<ApiResponse<AdminOrdersListResponse>, GetOrdersQueryArgs | void>({
      query: (args) => {
        const params: Record<string, string | number> = {};
        if (args && args.status) params.status = args.status;
        if (args && typeof args.page === 'number') params.page = args.page;
        if (args && typeof args.limit === 'number') params.limit = args.limit;
        if (args && args.search) params.search = args.search;
        if (args && args.ownerRole) params.ownerRole = args.ownerRole;
        if (args && args.sort) params.sort = args.sort;
        if (args && args.date) params.date = args.date;

        return {
          url: '/admin/orders',
          params: Object.keys(params).length ? params : undefined,
        };
      },
      providesTags: (result) => {
        const payload = (result as ApiResponse<AdminOrdersListResponse>)?.data;
        const orders = Array.isArray(payload)
          ? payload
          : payload?.orders ?? [];
        return orders.length
          ? [
              ...orders.map((o) => ({ type: 'AdminOrder' as const, id: o._id })),
              { type: 'AdminOrders' as const, id: 'LIST' },
            ]
          : [{ type: 'AdminOrders' as const, id: 'LIST' }];
      },
    }),

    getOrderById: builder.query<ApiResponse<{ order: AdminOrder }>, string>({
      query: (id) => `/admin/orders/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'AdminOrder', id }],
    }),

    getOrderActions: builder.query<ApiResponse<OrderActionsPayload>, string>({
      query: (id) => `/admin/orders/${id}/actions`,
      providesTags: (_result, _error, id) => [{ type: 'OrderActions', id }],
    }),

    triggerOrderAction: builder.mutation<ApiResponse<{ order: AdminOrder }>, TriggerOrderActionArgs>({
      query: ({ id, action, payload }) => {
        const body = payload instanceof FormData ? payload : (payload ?? {});
        return {
          url: `/admin/orders/${id}/actions/${action}`,
          method: 'PATCH',
          body,
        };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'AdminOrder', id },
        { type: 'AdminOrders', id: 'LIST' },
        { type: 'OrderActions', id },
      ],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useGetOrderActionsQuery,
  useTriggerOrderActionMutation,
} = adminOrdersApi;

export const downloadOrderInvoice = async (
  orderId: string,
  orderNumber: string,
  token: string,
): Promise<void> => {
  const baseUrl = (import.meta.env?.VITE_API_BASE_URL as string ?? '').replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/admin/orders/${orderId}/invoice`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`Failed to download invoice (${response.status})`);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invoice-${orderNumber}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};
