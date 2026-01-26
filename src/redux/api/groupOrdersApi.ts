// src/redux/api/groupOrdersApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { createAuthBaseQuery } from './baseQuery';
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
} from '@/types/groupOrder';

export const groupOrdersApi = createApi({
  reducerPath: 'groupOrdersApi',
  baseQuery: createAuthBaseQuery('https://api.farmchops.com/api'),
  tagTypes: ['GroupOrders', 'MyGroups'],
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
      transformResponse: (response: { success?: boolean; data?: GroupOrder | { group: GroupOrder }; group?: GroupOrder }) => {
        // Check for valid group data in various response formats
        // Format 1: { success: true, data: { group: {...} } }
        if (response.data && 'group' in response.data && response.data.group) {
          return { group: response.data.group };
        }
        // Format 2: { success: true, data: { groupId: "...", ... } } - data IS the group
        if (response.data && ('groupId' in response.data || '_id' in response.data)) {
          return { group: response.data as GroupOrder };
        }
        // Format 3: { success: true, group: {...} }
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
    // Note: Admin endpoints have been moved to adminGroupOrdersApi.ts
    // to use proper admin authentication (createAdminAuthBaseQuery)
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
} = groupOrdersApi;
