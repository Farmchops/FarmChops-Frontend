import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import type { ApiResponse } from '@/types/api';
import type {
  CouponValidation,
  OrderDiscountResponse,
} from '@/types/marketing';

// This API uses USER auth token for customer-facing discount operations
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

export const discountsApi = createApi({
  reducerPath: 'discountsApi',
  baseQuery,
  endpoints: (builder) => ({

    // Validate coupon (user endpoint - requires user auth)
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

    // Calculate order discounts (user endpoint - requires user auth)
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
  }),
});

export const {
  useValidateCouponMutation,
  useCalculateDiscountsMutation,
} = discountsApi;

export default discountsApi;
