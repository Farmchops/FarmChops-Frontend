import { createApi } from '@reduxjs/toolkit/query/react';
import { createAdminAuthBaseQuery } from './baseQuery';
import type { ApiResponse } from '@/types/api';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? import.meta.env.VITE_API_BASE_URL;

export interface ReviewOrder {
    orderNumber: string;
    totalAmount: number;
}

export interface ReviewBuyer {
    firstName: string;
    lastName: string;
    email: string;
}

export interface AdminReview {
    _id: string;
    rating: number;
    comment?: string;
    isSubmitted: boolean;
    submittedAt?: string;
    orderId: ReviewOrder;
    buyerId: ReviewBuyer;
}

export interface AdminReviewsListResponse {
    reviews: AdminReview[];
    total: number;
    page: number;
    pageSize: number;
}

export interface GetReviewsQueryArgs {
    page?: number;
    rating?: number;
    submitted?: boolean;
}

const baseQuery = createAdminAuthBaseQuery(API_BASE_URL);

export const adminReviewsApi = createApi({
    reducerPath: 'adminReviewsApi',
    baseQuery,
    tagTypes: ['AdminReviews', 'AdminReview'],
    endpoints: (builder) => ({
        getReviews: builder.query<ApiResponse<AdminReviewsListResponse>, GetReviewsQueryArgs | void>({
            query: (args) => {
                const params: Record<string, string | number> = {};
                if (args?.page) params.page = args.page;
                if (args?.rating) params.rating = args.rating;
                if (typeof args?.submitted === 'boolean') params.submitted = String(args.submitted);
                return {
                    url: '/reviews',
                    params: Object.keys(params).length ? params : undefined,
                };
            },
            providesTags: (result) => {
                const reviews = result?.data?.reviews ?? [];
                return reviews.length
                    ? [
                        ...reviews.map((r) => ({ type: 'AdminReview' as const, id: r._id })),
                        { type: 'AdminReviews' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminReviews' as const, id: 'LIST' }];
            },
        }),

        deleteReview: builder.mutation<ApiResponse<void>, string>({
            query: (id) => ({
                url: `/reviews/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_res, _err, id) => [
                { type: 'AdminReview', id },
                { type: 'AdminReviews', id: 'LIST' },
            ],
        }),
    }),
});

export const { useGetReviewsQuery, useDeleteReviewMutation } = adminReviewsApi;
