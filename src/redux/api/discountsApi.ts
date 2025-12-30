import { createApi } from '@reduxjs/toolkit/query/react';
import { createAuthBaseQuery } from './baseQuery';
import type { ApiResponse } from '@/types/api';
import type {
  CouponValidation,
  OrderDiscountResponse,
} from '@/types/marketing';

// This API uses USER auth token for customer-facing discount operations
const baseQuery = createAuthBaseQuery(import.meta.env.VITE_API_BASE_URL);

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
      { subtotal: number; couponCode?: string; deliveryFee?: number }
    >({
      query: (body) => ({
        url: '/orders/calculate-discount',
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
