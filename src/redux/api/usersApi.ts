import { createApi } from '@reduxjs/toolkit/query/react';
import { createAdminAuthBaseQuery } from './baseQuery';
import type { ApiResponse } from '@/types/api';

const baseQuery = createAdminAuthBaseQuery('https://api.farmchops.com/api/users/admin');

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  walletBalance: number;
  isVerified: boolean;
  hasReferral: boolean;
  joinedAt: string;
  purchaseStats: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate: string | null;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery,
  tagTypes: ['Users'],
  endpoints: (builder) => ({
    // Get all users with pagination and filters
    getUsers: builder.query<
      ApiResponse<{ users: User[]; pagination: PaginationMeta }>,
      GetUsersParams
    >({
      query: ({ page = 1, limit = 20, search, sortBy, order } = {}) => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (search) params.set('search', search);
        if (sortBy) params.set('sortBy', sortBy);
        if (order) params.set('order', order);
        return `/getAllUsers?${params.toString()}`;
      },
      providesTags: (result) =>
        result?.data?.users
          ? [
              ...result.data.users.map((u) => ({ type: 'Users' as const, id: u._id })),
              { type: 'Users', id: 'LIST' },
            ]
          : [{ type: 'Users', id: 'LIST' }],
    }),
  }),
});

export const { useGetUsersQuery } = usersApi;
