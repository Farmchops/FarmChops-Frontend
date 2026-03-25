// src/redux/api/walletApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import type { ApiResponse } from '@/types/api';
import type {
  WalletBalance,
  WalletTransactionsResponse,
  WalletTransactionsParams,
  FundWalletRequest,
  FundWalletResponse,
  VerifyFundingResponse,
  DebitWalletRequest,
  DebitWalletResponse,
  PaymentLinkDetails,
  CreatePaymentLinkRequest,
  CreatePaymentLinkResponse,
  PayViaLinkRequest,
  PayViaLinkResponse,
  VerifyLinkPaymentResponse,
  MyPaymentLinksParams,
  MyPaymentLinksResponse,
  CancelPaymentLinkResponse,
} from '@/types/wallet';
import { createAuthBaseQuery } from './baseQuery';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? import.meta.env.VITE_API_BASE_URL;

export const walletApi = createApi({
  reducerPath: 'walletApi',
  baseQuery: createAuthBaseQuery(API_BASE_URL),
  tagTypes: ['WalletBalance', 'WalletTransactions', 'PaymentLinks', 'PaymentLink'],
  endpoints: (builder) => ({
    // ==================== WALLET ENDPOINTS ====================

    // Get Wallet Balance
    getWalletBalance: builder.query<ApiResponse<WalletBalance>, void>({
      query: () => '/wallet/balance',
      providesTags: ['WalletBalance'],
    }),

    // Get Transaction History
    getWalletTransactions: builder.query<ApiResponse<WalletTransactionsResponse>, WalletTransactionsParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.set('page', params.page.toString());
        if (params.limit) searchParams.set('limit', params.limit.toString());
        if (params.type) searchParams.set('type', params.type);
        if (params.status) searchParams.set('status', params.status);
        if (params.startDate) searchParams.set('startDate', params.startDate);
        if (params.endDate) searchParams.set('endDate', params.endDate);

        const queryString = searchParams.toString();
        return `/wallet/transactions${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['WalletTransactions'],
    }),

    // Fund Wallet (Initialize)
    fundWallet: builder.mutation<ApiResponse<FundWalletResponse>, FundWalletRequest>({
      query: (data) => ({
        url: '/wallet/fund',
        method: 'POST',
        body: data,
      }),
    }),

    // Verify Wallet Funding
    verifyWalletFunding: builder.query<ApiResponse<VerifyFundingResponse>, string>({
      query: (reference) => `/wallet/verify/${reference}`,
      providesTags: ['WalletBalance', 'WalletTransactions'],
    }),

    // Debit Wallet
    debitWallet: builder.mutation<ApiResponse<DebitWalletResponse>, DebitWalletRequest>({
      query: (data) => ({
        url: '/wallet/debit',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['WalletBalance', 'WalletTransactions'],
    }),

    // ==================== PAYMENT LINK ENDPOINTS ====================

    // Create Payment Link (Authenticated)
    createPaymentLink: builder.mutation<ApiResponse<CreatePaymentLinkResponse>, CreatePaymentLinkRequest>({
      query: (data) => ({
        url: '/payment-links/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PaymentLinks'],
    }),

    // Get Payment Link Details (Public - no auth required)
    getPaymentLinkDetails: builder.query<ApiResponse<PaymentLinkDetails>, string>({
      query: (code) => `/payment-links/${code}`,
      providesTags: (_result, _error, code) => [{ type: 'PaymentLink', id: code }],
    }),

    // Pay via Payment Link (Public)
    payViaPaymentLink: builder.mutation<ApiResponse<PayViaLinkResponse>, { code: string; data: PayViaLinkRequest }>({
      query: ({ code, data }) => ({
        url: `/payment-links/${code}/pay`,
        method: 'POST',
        body: data,
      }),
    }),

    // Verify Payment Link Payment (Public)
    verifyPaymentLinkPayment: builder.query<ApiResponse<VerifyLinkPaymentResponse>, { code: string; reference: string }>({
      query: ({ code, reference }) => `/payment-links/${code}/verify?reference=${reference}`,
      providesTags: (_result, _error, { code }) => [{ type: 'PaymentLink', id: code }],
    }),

    // Get My Payment Links (Authenticated)
    getMyPaymentLinks: builder.query<ApiResponse<MyPaymentLinksResponse>, MyPaymentLinksParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.set('page', params.page.toString());
        if (params.limit) searchParams.set('limit', params.limit.toString());
        if (params.status) searchParams.set('status', params.status);

        const queryString = searchParams.toString();
        return `/payment-links/user/my-links${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['PaymentLinks'],
    }),

    // Cancel Payment Link (Authenticated)
    cancelPaymentLink: builder.mutation<ApiResponse<CancelPaymentLinkResponse>, string>({
      query: (code) => ({
        url: `/payment-links/${code}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, code) => [
        'PaymentLinks',
        { type: 'PaymentLink', id: code },
      ],
    }),

    // Regenerate Payment Link (Authenticated)
    regeneratePaymentLink: builder.mutation<ApiResponse<CreatePaymentLinkResponse>, { code: string; expiresInHours?: number }>({
      query: ({ code, expiresInHours = 1 }) => ({
        url: `/payment-links/${code}/regenerate`,
        method: 'POST',
        body: { expiresInHours },
      }),
      invalidatesTags: (_result, _error, { code }) => [
        'PaymentLinks',
        { type: 'PaymentLink', id: code },
      ],
    }),
  }),
});

export const {
  // Wallet hooks
  useGetWalletBalanceQuery,
  useGetWalletTransactionsQuery,
  useFundWalletMutation,
  useVerifyWalletFundingQuery,
  useLazyVerifyWalletFundingQuery,
  useDebitWalletMutation,
  // Payment Link hooks
  useCreatePaymentLinkMutation,
  useGetPaymentLinkDetailsQuery,
  usePayViaPaymentLinkMutation,
  useVerifyPaymentLinkPaymentQuery,
  useLazyVerifyPaymentLinkPaymentQuery,
  useGetMyPaymentLinksQuery,
  useCancelPaymentLinkMutation,
  useRegeneratePaymentLinkMutation,
} = walletApi;
