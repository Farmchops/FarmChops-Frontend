// src/redux/api/groupOrdersApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import type {
  GroupOrder,
  GroupOrderListResponse,
  ReserveSlotRequest,
  ReserveSlotResponse,
  CheckoutRequest,
  CheckoutResponse,
  VerifyPaymentResponse,
  JoinWaitlistRequest,
  JoinWaitlistResponse,
  LeaveGroupResponse,
  MyGroupsResponse,
  AdminGroupsResponse,
  CancelGroupRequest,
  CancelGroupResponse,
  ConfigureGroupBuyingRequest,
  ProductWithGroupConfig,
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
  tagTypes: ['GroupOrders', 'MyGroups', 'AdminGroups'],
  endpoints: (builder) => ({
    // ==================== PUBLIC ENDPOINTS ====================

    // Get all active groups
    getActiveGroups: builder.query<GroupOrderListResponse, { productId?: string } | void>({
      query: (params) => ({
        url: '/group-orders/active',
        params: params?.productId ? { productId: params.productId } : undefined,
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

    // Get group by shareable code
    getGroupByShareableCode: builder.query<{ group: GroupOrder }, string>({
      query: (shareableCode) => `/group-orders/share/${shareableCode}`,
      transformResponse: (response: { success?: boolean; data?: { group: GroupOrder }; group?: GroupOrder }) => {
        // Check for valid group data in various response formats
        if (response.data && response.data.group && (response.data.group.groupId || response.data.group._id)) {
          return response.data;
        }
        if (response.group && (response.group.groupId || response.group._id)) {
          return { group: response.group };
        }
        // Return null group to indicate not found
        return { group: null as unknown as GroupOrder };
      },
      providesTags: (_result, _error, code) => [{ type: 'GroupOrders', id: code }],
    }),

    // Get group details by groupId
    getGroupById: builder.query<{ group: GroupOrder }, string>({
      query: (groupId) => `/group-orders/${groupId}`,
      transformResponse: (response: { success?: boolean; data?: { group: GroupOrder }; group?: GroupOrder }) => {
        if (response.data && response.data.group) {
          return response.data;
        }
        if (response.group) {
          return { group: response.group };
        }
        return { group: {} as GroupOrder };
      },
      providesTags: (_result, _error, groupId) => [{ type: 'GroupOrders', id: groupId }],
    }),

    // ==================== PROTECTED USER ENDPOINTS ====================

    // Reserve a slot (Step 1: No payment)
    reserveSlot: builder.mutation<ReserveSlotResponse, { groupId: string; data: ReserveSlotRequest }>({
      query: ({ groupId, data }) => ({
        url: `/group-orders/${groupId}/reserve`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GroupOrders', 'MyGroups'],
    }),

    // Initiate checkout (Step 2: Get Paystack URL)
    initiateCheckout: builder.mutation<CheckoutResponse, { groupId: string; data: CheckoutRequest }>({
      query: ({ groupId, data }) => ({
        url: `/group-orders/${groupId}/checkout`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GroupOrders', 'MyGroups'],
    }),

    // Verify payment
    verifyPayment: builder.query<VerifyPaymentResponse, string>({
      query: (reference) => `/group-orders/verify-payment/${reference}`,
      providesTags: ['MyGroups'],
    }),

    // Join waitlist
    joinWaitlist: builder.mutation<JoinWaitlistResponse, { groupId: string; data: JoinWaitlistRequest }>({
      query: ({ groupId, data }) => ({
        url: `/group-orders/${groupId}/waitlist`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GroupOrders', 'MyGroups'],
    }),

    // Leave group (before payment)
    leaveGroup: builder.mutation<LeaveGroupResponse, string>({
      query: (groupId) => ({
        url: `/group-orders/${groupId}/leave`,
        method: 'POST',
      }),
      invalidatesTags: ['GroupOrders', 'MyGroups'],
    }),

    // Get my groups
    getMyGroups: builder.query<MyGroupsResponse, { status?: string } | void>({
      query: (params) => ({
        url: '/group-orders/user/my-groups',
        params: params?.status ? { status: params.status } : undefined,
      }),
      transformResponse: (response: { success?: boolean; data?: MyGroupsResponse; groups?: MyGroupsResponse['groups'] }) => {
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

    // ==================== ADMIN ENDPOINTS ====================

    // Configure group buying for a product
    configureGroupBuying: builder.mutation<{ success: boolean; data: { product: ProductWithGroupConfig } }, { productId: string; data: ConfigureGroupBuyingRequest }>({
      query: ({ productId, data }) => ({
        url: `/admin/products/${productId}/group-config`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GroupOrders', 'AdminGroups'],
    }),

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
      invalidatesTags: ['GroupOrders', 'AdminGroups', 'MyGroups'],
    }),

    // Create group manually (admin)
    createGroup: builder.mutation<{ success: boolean; data: { group: GroupOrder } }, string>({
      query: (productId) => ({
        url: `/admin/products/${productId}/create-group`,
        method: 'POST',
      }),
      invalidatesTags: ['GroupOrders', 'AdminGroups'],
    }),
  }),
});

export const {
  // Public
  useGetActiveGroupsQuery,
  useGetGroupByShareableCodeQuery,
  useGetGroupByIdQuery,

  // Protected User
  useReserveSlotMutation,
  useInitiateCheckoutMutation,
  useVerifyPaymentQuery,
  useJoinWaitlistMutation,
  useLeaveGroupMutation,
  useGetMyGroupsQuery,

  // Admin
  useConfigureGroupBuyingMutation,
  useGetAdminGroupsQuery,
  useGetAdminGroupByIdQuery,
  useCancelGroupMutation,
  useCreateGroupMutation,
} = groupOrdersApi;
