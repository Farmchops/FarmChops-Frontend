import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import type { ApiResponse } from '@/types/api';
import type {
  Coupon,
  CreateCouponPayload,
  UpdateCouponPayload,
  CouponValidation,
  OrderDiscountResponse,
  CouponUsageReport,
  PaginationParams,
  PaginationMeta,
} from '@/types/marketing';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('content-type', 'application/json');
    return headers;
  },
});

export const couponsApi = createApi({
  reducerPath: 'couponsApi',
  baseQuery,
  tagTypes: ['Coupons', 'Coupon', 'CouponReport'],
  endpoints: (builder) => ({

    // Get all coupons with pagination and filters
    getCoupons: builder.query<
      ApiResponse<{ coupons: Coupon[]; pagination: PaginationMeta }>,
      PaginationParams
    >({
      query: ({ page = 1, limit = 20, status } = {}) => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (status) params.set('status', status);
        return `/admin/coupons?${params.toString()}`;
      },
      providesTags: (result) =>
        result?.data?.coupons
          ? [
              ...result.data.coupons.map((c) => ({ type: 'Coupon' as const, id: c._id })),
              { type: 'Coupons', id: 'LIST' },
            ]
          : [{ type: 'Coupons', id: 'LIST' }],
    }),

    // Get single coupon
    getCoupon: builder.query<ApiResponse<{ coupon: Coupon }>, string>({
      query: (couponId) => `/admin/coupons/${couponId}`,
      providesTags: (result, _error, id) =>
        result?.data ? [{ type: 'Coupon' as const, id }] : [],
    }),

    // Create coupon
    createCoupon: builder.mutation<ApiResponse<{ coupon: Coupon }>, CreateCouponPayload>({
      query: (body) => ({
        url: '/admin/coupons',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Coupons', id: 'LIST' }],
    }),

    // Update coupon
    updateCoupon: builder.mutation<
      ApiResponse<{ coupon: Coupon }>,
      { couponId: string; data: UpdateCouponPayload }
    >({
      query: ({ couponId, data }) => ({
        url: `/admin/coupons/${couponId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { couponId }) => [
        { type: 'Coupon', id: couponId },
        { type: 'Coupons', id: 'LIST' },
      ],
    }),

    // Delete coupon
    deleteCoupon: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (couponId) => ({
        url: `/admin/coupons/${couponId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, couponId) => [
        { type: 'Coupon', id: couponId },
        { type: 'Coupons', id: 'LIST' },
      ],
    }),

    // Validate coupon (user endpoint - requires auth)
    validateCoupon: builder.mutation<
      ApiResponse<CouponValidation>,
      { couponCode: string; orderAmount: number }
    >({
      query: (body) => ({
        url: '/coupons/validate',
        method: 'POST',
        body,
      }),
    }),

    // Calculate order discounts (user endpoint - requires auth)
    calculateDiscounts: builder.mutation<
      ApiResponse<OrderDiscountResponse>,
      { subtotal: number; couponCode?: string }
    >({
      query: (body) => ({
        url: '/orders/calculate-discounts',
        method: 'POST',
        body,
      }),
    }),

    // Get coupon usage report (admin endpoint)
    getCouponReport: builder.query<ApiResponse<CouponUsageReport>, string>({
      query: (couponId) => `/admin/coupons/${couponId}/report`,
      providesTags: (_result, _error, couponId) => [
        { type: 'CouponReport', id: couponId },
      ],
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useGetCouponQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useValidateCouponMutation,
  useCalculateDiscountsMutation,
  useGetCouponReportQuery,
} = couponsApi;

export default couponsApi;
