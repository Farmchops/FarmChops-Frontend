import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const reviewsApi = createApi({
    reducerPath: 'reviewsApi',
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    endpoints: (builder) => ({
        validateReviewToken: builder.query<
            { success: boolean; data: { orderNumber: string; customerName: string } },
            string
        >({
            query: (token) => `/reviews/validate/${token}`,
        }),
        submitReview: builder.mutation<
            { success: boolean; message: string },
            { token: string; rating: number; comment?: string }
        >({
            query: (body) => ({
                url: '/reviews/submit',
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const { useValidateReviewTokenQuery, useSubmitReviewMutation } = reviewsApi;
