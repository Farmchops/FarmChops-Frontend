import { createApi } from '@reduxjs/toolkit/query/react';
import { createAdminAuthBaseQuery } from './baseQuery';
import type { ApiResponse } from '@/types/api';
import type {
  Marketer,
  CreateMarketerPayload,
  UpdateMarketerPayload,
  MarketerReport,
  AllMarketersReport,
  CreateCommissionPaymentPayload,
  CommissionPayment,
  PaginationParams,
  PaginationMeta,
  ReferralCodeValidation
} from '@/types/marketing';

const baseQuery = createAdminAuthBaseQuery(import.meta.env.VITE_API_BASE_URL);

export const marketersApi = createApi({
  reducerPath: 'marketersApi',
  baseQuery,
  tagTypes: ['Marketers', 'Marketer', 'MarketerReport', 'CommissionPayments'],
  endpoints: (builder) => ({

    // Get all marketers with pagination and filters
    getMarketers: builder.query<
      ApiResponse<{ marketers: Marketer[]; pagination: PaginationMeta }>,
      PaginationParams
    >({
      query: ({ page = 1, limit = 20, status, search, sortBy, order } = {}) => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (status) params.set('status', status);
        if (search) params.set('search', search);
        if (sortBy) params.set('sortBy', sortBy);
        if (order) params.set('order', order);
        return `/admin/marketers?${params.toString()}`;
      },
      providesTags: (result) =>
        result?.data?.marketers
          ? [
              ...result.data.marketers.map((m) => ({ type: 'Marketer' as const, id: m._id })),
              { type: 'Marketers', id: 'LIST' },
            ]
          : [{ type: 'Marketers', id: 'LIST' }],
    }),

    // Get single marketer
    getMarketer: builder.query<ApiResponse<{ marketer: Marketer }>, string>({
      query: (marketerId) => `/admin/marketers/${marketerId}`,
      providesTags: (result, _error, id) =>
        result?.data ? [{ type: 'Marketer' as const, id }] : [],
    }),

    // Create marketer
    createMarketer: builder.mutation<ApiResponse<{ marketer: Marketer }>, CreateMarketerPayload>({
      query: (body) => ({
        url: '/admin/marketers',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Marketers', id: 'LIST' }],
    }),

    // Update marketer
    updateMarketer: builder.mutation<
      ApiResponse<{ marketer: Marketer }>,
      { marketerId: string; data: UpdateMarketerPayload }
    >({
      query: ({ marketerId, data }) => ({
        url: `/admin/marketers/${marketerId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { marketerId }) => [
        { type: 'Marketer', id: marketerId },
        { type: 'Marketers', id: 'LIST' },
      ],
    }),

    // Delete/deactivate marketer
    deleteMarketer: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (marketerId) => ({
        url: `/admin/marketers/${marketerId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, marketerId) => [
        { type: 'Marketer', id: marketerId },
        { type: 'Marketers', id: 'LIST' },
      ],
    }),

    // Get marketer performance report
    getMarketerReport: builder.query<
      ApiResponse<MarketerReport>,
      { marketerId: string; startDate: string; endDate: string }
    >({
      query: ({ marketerId, startDate, endDate }) => {
        const params = new URLSearchParams();
        params.set('startDate', startDate);
        params.set('endDate', endDate);
        return `/admin/marketers/${marketerId}/report?${params.toString()}`;
      },
      providesTags: (_result, _error, { marketerId }) => [
        { type: 'MarketerReport', id: marketerId },
      ],
    }),

    // Get all marketers summary report
    getAllMarketersReport: builder.query<
      ApiResponse<AllMarketersReport>,
      { startDate: string; endDate: string; sortBy?: string }
    >({
      query: ({ startDate, endDate, sortBy = 'revenue' }) => {
        const params = new URLSearchParams();
        params.set('startDate', startDate);
        params.set('endDate', endDate);
        params.set('sortBy', sortBy);
        return `/admin/reports/marketers?${params.toString()}`;
      },
      providesTags: [{ type: 'MarketerReport', id: 'ALL' }],
    }),

    // Record commission payment
    payCommission: builder.mutation<
      ApiResponse<{ payment: CommissionPayment }>,
      { marketerId: string; data: CreateCommissionPaymentPayload }
    >({
      query: ({ marketerId, data }) => ({
        url: `/admin/marketers/${marketerId}/pay-commission`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { marketerId }) => [
        { type: 'Marketer', id: marketerId },
        { type: 'Marketers', id: 'LIST' },
        { type: 'MarketerReport', id: marketerId },
        { type: 'CommissionPayments', id: 'LIST' },
      ],
    }),

    // Validate referral code (public endpoint - no auth required)
    validateReferralCode: builder.mutation<
      ApiResponse<ReferralCodeValidation>,
      { referralCode: string }
    >({
      query: (body) => ({
        url: '/auth/validate-referral-code',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetMarketersQuery,
  useGetMarketerQuery,
  useCreateMarketerMutation,
  useUpdateMarketerMutation,
  useDeleteMarketerMutation,
  useGetMarketerReportQuery,
  useGetAllMarketersReportQuery,
  usePayCommissionMutation,
  useValidateReferralCodeMutation,
} = marketersApi;

export default marketersApi;
