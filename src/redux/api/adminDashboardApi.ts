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

// Sales Page Types
export interface RevenueTrendItem {
  month: string;
  revenue: number;
}

export interface PaymentMethodItem {
  method: string;
  count: number;
  percentage: number;
  totalAmount: number;
}

export interface PaymentMethodsResponse {
  breakdown: PaymentMethodItem[];
  totalTransactions: number;
}

export interface AverageOrderValueItem {
  month: string;
  averageOrderValue: number;
}

export interface TopProductItem {
  productId: string;
  productName: string;
  unitsSold: number;
  revenue: number;
}

export interface TopProductsResponse {
  products: TopProductItem[];
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

export interface TopProductsQueryArgs extends DashboardDateFilter {
  limit?: number;
}

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? 'https://api.farmchops.com/api';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.adminAuth.token;
    // Debug logging - check if token exists (can be removed in production)
    if (!token) {
      console.warn('[Dashboard API] No admin token found in Redux state. Check if you are logged in.');
    }
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
  tagTypes: ['DashboardStats', 'OrderTrend', 'UsersTrend', 'RecentOrders', 'RevenueTrend', 'PaymentMethods', 'AverageOrderValue', 'TopProducts'],
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

    // Revenue Trend (for Sales page)
    getRevenueTrend: builder.query<ApiResponse<RevenueTrendItem[]>, DashboardDateFilter | void>({
      query: (args) => {
        const params: Record<string, string> = {};
        if (args?.startDate) params.startDate = args.startDate;
        if (args?.endDate) params.endDate = args.endDate;
        return {
          url: '/admin/dashboard/revenue-trend',
          params: Object.keys(params).length ? params : undefined,
        };
      },
      providesTags: ['RevenueTrend'],
    }),

    // Payment Methods Breakdown (for Sales page)
    getPaymentMethods: builder.query<ApiResponse<PaymentMethodsResponse>, DashboardDateFilter | void>({
      query: (args) => {
        const params: Record<string, string> = {};
        if (args?.startDate) params.startDate = args.startDate;
        if (args?.endDate) params.endDate = args.endDate;
        return {
          url: '/admin/dashboard/payment-methods',
          params: Object.keys(params).length ? params : undefined,
        };
      },
      providesTags: ['PaymentMethods'],
    }),

    // Average Order Value (for Sales page)
    getAverageOrderValue: builder.query<ApiResponse<AverageOrderValueItem[]>, DashboardDateFilter | void>({
      query: (args) => {
        const params: Record<string, string> = {};
        if (args?.startDate) params.startDate = args.startDate;
        if (args?.endDate) params.endDate = args.endDate;
        return {
          url: '/admin/dashboard/average-order-value',
          params: Object.keys(params).length ? params : undefined,
        };
      },
      providesTags: ['AverageOrderValue'],
    }),

    // Top Products by Revenue (for Sales page)
    getTopProducts: builder.query<ApiResponse<TopProductsResponse>, TopProductsQueryArgs | void>({
      query: (args) => {
        const params: Record<string, string | number> = {};
        if (args?.startDate) params.startDate = args.startDate;
        if (args?.endDate) params.endDate = args.endDate;
        if (args?.limit) params.limit = args.limit;
        return {
          url: '/admin/dashboard/top-products',
          params: Object.keys(params).length ? params : undefined,
        };
      },
      providesTags: ['TopProducts'],
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
  useGetRevenueTrendQuery,
  useGetPaymentMethodsQuery,
  useGetAverageOrderValueQuery,
  useGetTopProductsQuery,
} = adminDashboardApi;
