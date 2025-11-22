// src/redux/api/adminDashboardApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import type { ApiResponse } from '@/types/api';

// Response Types
export interface OrderStatusBreakdown {
  count: number;
  percentage: number;
  revenue: number;
}

export interface TotalOrdersResponse {
  totalOrders: number;
  byPaymentStatus: {
    paid: number;
    pending: number;
    failed: number;
  };
  byOrderStatus: {
    delivered: OrderStatusBreakdown;
    pending: OrderStatusBreakdown;
    cancelled: OrderStatusBreakdown;
  };
}

export interface ConversionRateResponse {
  totalUsers: number;
  purchasingUsers: number;
  conversionRate: number;
  conversionRatio: string;
}

export interface DashboardSummaryResponse {
  totalRevenue: number;
  totalOrders: number;
  conversionRate: number;
}

export interface OrderTrendItem {
  month: string;
  orderCount: number;
}

export interface UsersTrendItem {
  month: string;
  userCount: number;
}

export interface RecentOrder {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  amount: number;
  date: string;
  orderStatus: string;
  paymentStatus: string;
  userId: string;
}

// Query Args
export interface DashboardDateFilter {
  startDate?: string;
  endDate?: string;
}

export interface RecentOrdersQueryArgs extends DashboardDateFilter {
  limit?: number;
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

export const adminDashboardApi = createApi({
  reducerPath: 'adminDashboardApi',
  baseQuery,
  tagTypes: ['DashboardStats', 'OrderTrend', 'UsersTrend', 'RecentOrders'],
  endpoints: (builder) => ({
    // Total Orders Statistics
    getTotalOrders: builder.query<ApiResponse<TotalOrdersResponse>, DashboardDateFilter | void>({
      query: (args) => {
        const params: Record<string, string> = {};
        if (args?.startDate) params.startDate = args.startDate;
        if (args?.endDate) params.endDate = args.endDate;
        return {
          url: '/admin/dashboard/total-orders',
          params: Object.keys(params).length ? params : undefined,
        };
      },
      providesTags: ['DashboardStats'],
    }),

    // Conversion Rate
    getConversionRate: builder.query<ApiResponse<ConversionRateResponse>, DashboardDateFilter | void>({
      query: (args) => {
        const params: Record<string, string> = {};
        if (args?.startDate) params.startDate = args.startDate;
        if (args?.endDate) params.endDate = args.endDate;
        return {
          url: '/admin/dashboard/conversion-rate',
          params: Object.keys(params).length ? params : undefined,
        };
      },
      providesTags: ['DashboardStats'],
    }),

    // Dashboard Summary
    getDashboardSummary: builder.query<ApiResponse<DashboardSummaryResponse>, DashboardDateFilter | void>({
      query: (args) => {
        const params: Record<string, string> = {};
        if (args?.startDate) params.startDate = args.startDate;
        if (args?.endDate) params.endDate = args.endDate;
        return {
          url: '/admin/dashboard/summary',
          params: Object.keys(params).length ? params : undefined,
        };
      },
      providesTags: ['DashboardStats'],
    }),

    // Order Trend
    getOrderTrend: builder.query<ApiResponse<OrderTrendItem[]>, DashboardDateFilter | void>({
      query: (args) => {
        const params: Record<string, string> = {};
        if (args?.startDate) params.startDate = args.startDate;
        if (args?.endDate) params.endDate = args.endDate;
        return {
          url: '/admin/dashboard/order-trend',
          params: Object.keys(params).length ? params : undefined,
        };
      },
      providesTags: ['OrderTrend'],
    }),

    // Users Trend
    getUsersTrend: builder.query<ApiResponse<UsersTrendItem[]>, DashboardDateFilter | void>({
      query: (args) => {
        const params: Record<string, string> = {};
        if (args?.startDate) params.startDate = args.startDate;
        if (args?.endDate) params.endDate = args.endDate;
        return {
          url: '/admin/dashboard/users-trend',
          params: Object.keys(params).length ? params : undefined,
        };
      },
      providesTags: ['UsersTrend'],
    }),

    // Recent Orders
    getRecentOrders: builder.query<ApiResponse<RecentOrder[]>, RecentOrdersQueryArgs | void>({
      query: (args) => {
        const params: Record<string, string | number> = {};
        if (args?.startDate) params.startDate = args.startDate;
        if (args?.endDate) params.endDate = args.endDate;
        if (args?.limit) params.limit = args.limit;
        return {
          url: '/admin/dashboard/recent-orders',
          params: Object.keys(params).length ? params : undefined,
        };
      },
      providesTags: ['RecentOrders'],
    }),
  }),
});

export const {
  useGetTotalOrdersQuery,
  useGetConversionRateQuery,
  useGetDashboardSummaryQuery,
  useGetOrderTrendQuery,
  useGetUsersTrendQuery,
  useGetRecentOrdersQuery,
} = adminDashboardApi;
