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

const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
};

export const groupOrdersApi = createApi({
  reducerPath: 'groupOrdersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${getApiBaseUrl()}/api`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
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
      providesTags: ['GroupOrders'],
    }),

    // Get group details
    getGroupById: builder.query<{ group: GroupOrder }, string>({
      query: (groupId) => `/group-orders/${groupId}`,
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
    leaveGroup: builder.mutation<{ success: boolean; refund: any }, string>({
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
      providesTags: ['MyGroups'],
    }),
  }),
});

export const {
  useGetActiveGroupsQuery,
  useGetGroupByIdQuery,
  useJoinGroupMutation,
  useLeaveGroupMutation,
  useGetMyGroupsQuery,
} = groupOrdersApi;
