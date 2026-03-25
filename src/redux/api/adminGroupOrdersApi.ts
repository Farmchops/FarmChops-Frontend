// src/redux/api/adminGroupOrdersApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { createAdminAuthBaseQuery } from './baseQuery';
import type {
  GroupOrder,
  AdminGroupsResponse,
  CancelGroupRequest,
  CancelGroupResponse,
  ConfigureGroupBuyingRequest,
  ProductWithGroupConfig,
} from '@/types/groupOrder';

export const adminGroupOrdersApi = createApi({
  reducerPath: 'adminGroupOrdersApi',
  baseQuery: createAdminAuthBaseQuery(import.meta.env.VITE_API_BASE_URL),
  tagTypes: ['AdminGroups'],
  endpoints: (builder) => ({
    // Get all groups (admin view with stats)
    getAdminGroups: builder.query<AdminGroupsResponse, { phase?: string; productId?: string } | void>({
      query: (params) => ({
        url: '/admin/group-orders',
        params: params ? {
          ...(params.phase ? { phase: params.phase } : {}),
          ...(params.productId ? { productId: params.productId } : {}),
        } : undefined,
      }),
      transformResponse: (response: { success?: boolean; data?: AdminGroupsResponse; groups?: GroupOrder[]; stats?: AdminGroupsResponse['stats'] }) => {
        if (response.data) {
          return response.data;
        }
        if (response.groups) {
          return {
            groups: response.groups,
            stats: response.stats || {
              totalFillingGroups: 0,
              totalCheckoutWindowGroups: 0,
              totalConfirmedGroups: 0,
              totalExpiredGroups: 0,
              totalCancelledGroups: 0,
              totalRevenue: 0,
            },
          };
        }
        return {
          groups: [],
          stats: {
            totalFillingGroups: 0,
            totalCheckoutWindowGroups: 0,
            totalConfirmedGroups: 0,
            totalExpiredGroups: 0,
            totalCancelledGroups: 0,
            totalRevenue: 0,
          },
        };
      },
      providesTags: ['AdminGroups'],
    }),

    // Get group details (admin view)
    getAdminGroupById: builder.query<{ group: GroupOrder }, string>({
      query: (groupId) => `/admin/group-orders/${groupId}`,
      transformResponse: (response: { success?: boolean; data?: { group: GroupOrder }; group?: GroupOrder }) => {
        if (response.data && response.data.group) {
          return response.data;
        }
        if (response.group) {
          return { group: response.group };
        }
        return { group: {} as GroupOrder };
      },
      providesTags: (_result, _error, groupId) => [{ type: 'AdminGroups', id: groupId }],
    }),

    // Cancel group (admin)
    cancelGroup: builder.mutation<CancelGroupResponse, { groupId: string; data: CancelGroupRequest }>({
      query: ({ groupId, data }) => ({
        url: `/admin/group-orders/${groupId}/cancel`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AdminGroups'],
    }),

    // Configure group buying for a product
    configureGroupBuying: builder.mutation<{ success: boolean; data: { product: ProductWithGroupConfig } }, { productId: string; data: ConfigureGroupBuyingRequest }>({
      query: ({ productId, data }) => ({
        url: `/admin/products/${productId}/group-config`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AdminGroups'],
    }),

    // Create group manually (admin)
    createGroup: builder.mutation<{ success: boolean; data: { group: GroupOrder } }, string>({
      query: (productId) => ({
        url: `/admin/products/${productId}/create-group`,
        method: 'POST',
      }),
      invalidatesTags: ['AdminGroups'],
    }),
  }),
});

export const {
  useGetAdminGroupsQuery,
  useGetAdminGroupByIdQuery,
  useCancelGroupMutation,
  useConfigureGroupBuyingMutation,
  useCreateGroupMutation,
} = adminGroupOrdersApi;
