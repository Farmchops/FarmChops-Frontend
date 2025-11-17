// src/redux/api/groupOrdersApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import type {
  GroupOrder,
  GroupOrderListResponse,
  JoinGroupRequest,
  JoinGroupResponse,
  MyGroupOrder
} from '@/types/groupOrder';

export const groupOrdersApi = createApi({
  reducerPath: 'groupOrdersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.farmchops.com/api',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.adminAuth?.token || state.auth?.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['GroupOrders', 'MyGroups'],
  endpoints: (builder) => ({
    // Get all active groups
    getActiveGroups: builder.query<GroupOrderListResponse, { productId?: string }>({
      query: ({ productId }) => ({
        url: '/group-orders/active',
        params: productId ? { productId } : undefined,
      }),
      transformResponse: (response: { success?: boolean; data?: GroupOrderListResponse; groups?: GroupOrder[] }) => {
        // Handle wrapped response: { success: true, data: { groups: [...] } }
        if (response.data && response.data.groups) {
          return response.data;
        }
        // Handle direct response: { groups: [...] }
        if (response.groups) {
          return { groups: response.groups };
        }
        return { groups: [] };
      },
      providesTags: ['GroupOrders'],
    }),

    // Get group details
    getGroupById: builder.query<{ group: GroupOrder }, string>({
      query: (groupId) => `/group-orders/${groupId}`,
      transformResponse: (response: { success?: boolean; data?: { group: GroupOrder }; group?: GroupOrder }) => {
        // Handle wrapped response: { success: true, data: { group: {...} } }
        if (response.data && response.data.group) {
          return response.data;
        }
        // Handle direct response: { group: {...} }
        if (response.group) {
          return { group: response.group };
        }
        return { group: {} as GroupOrder };
      },
      providesTags: (_result, _error, groupId) => [{ type: 'GroupOrders', id: groupId }],
    }),

    // Join a group
    joinGroup: builder.mutation<JoinGroupResponse, { groupId: string; data: JoinGroupRequest }>({
      query: ({ groupId, data }) => ({
        url: `/group-orders/${groupId}/join`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GroupOrders', 'MyGroups'],
    }),

    // Leave a group
    leaveGroup: builder.mutation<{ success: boolean; refund: Record<string, unknown> | null }, string>({
      query: (groupId) => ({
        url: `/group-orders/${groupId}/leave`,
        method: 'POST',
      }),
      invalidatesTags: ['GroupOrders', 'MyGroups'],
    }),

    // Get my groups
    getMyGroups: builder.query<{ groups: MyGroupOrder[] }, { status?: string }>({
      query: ({ status }) => ({
        url: '/group-orders/user/my-groups',
        params: status ? { status } : undefined,
      }),
      transformResponse: (response: { success?: boolean; data?: { groups: MyGroupOrder[] }; groups?: MyGroupOrder[] }) => {
        if (response.data && response.data.groups) {
          return response.data;
        }
        if (response.groups) {
          return { groups: response.groups };
        }
        return { groups: [] };
      },
      providesTags: ['MyGroups'],
    }),

    // Admin: fetch all group orders (for admin dashboard)
    getAdminGroupOrders: builder.query<import('@/types/groupOrder').GroupOrderListResponse, { status?: string; search?: string } | void>({
      query: (q) => ({
        url: '/admin/group-orders',
        params: q ? { ...(q.status ? { status: q.status } : {}), ...(q.search ? { search: q.search } : {}) } : undefined,
      }),
      transformResponse: (response: { success?: boolean; data?: GroupOrderListResponse; groups?: GroupOrder[] }) => {
        if (response.data && response.data.groups) {
          return response.data;
        }
        if (response.groups) {
          return { groups: response.groups };
        }
        return { groups: [] };
      },
      providesTags: ['GroupOrders'],
    }),
    // Admin: create a new group order
    createAdminGroupOrder: builder.mutation<{ success: boolean; group: import('@/types/groupOrder').GroupOrder }, { productId: string }>({
      query: ({ productId }) => ({
        url: '/admin/group-orders',
        method: 'POST',
        body: { productId },
        headers: { 'Content-Type': 'application/json' },
      }),
      invalidatesTags: ['GroupOrders', 'MyGroups'],
    }),
  }),
});

export const {
  useGetActiveGroupsQuery,
  useGetGroupByIdQuery,
  useJoinGroupMutation,
  useLeaveGroupMutation,
  useGetMyGroupsQuery,
  useGetAdminGroupOrdersQuery,
  useCreateAdminGroupOrderMutation,
} = groupOrdersApi;
