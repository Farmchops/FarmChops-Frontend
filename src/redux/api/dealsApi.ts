import { createApi } from '@reduxjs/toolkit/query/react';
import { createAuthBaseQuery } from './baseQuery';
import type {
    ActiveDealPayload,
    AdminDealsListResponse,
    Deal,
    DealStatus,
    UpcomingDealPayload,
} from '@/types/deals';
import type { ApiResponse } from '@/types/api';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? 'https://api.farmchops.com/api';

interface DealsListQueryParams {
    status?: DealStatus | 'all';
    productId?: string;
    page?: number;
    limit?: number;
    search?: string;
}

interface CreateDealPayload {
    productId: string;
    title?: string;
    headline?: string;
    promoCopy?: string;
    dealPrice?: number;
    discountPercentage?: number;
    maxUnits: number;
    perUserLimit?: number;
    startAt?: string | null;
    endAt?: string | null;
    description?: string;
    heroImage?: string;
    isFeatured?: boolean;
}

type UpdateDealPayload = {
    id: string;
    title?: string;
    headline?: string;
    promoCopy?: string;
    dealPrice?: number;
    discountPercentage?: number;
    maxUnits?: number;
    perUserLimit?: number | null;
    startAt?: string | null;
    endAt?: string | null;
    description?: string;
    heroImage?: string;
    isFeatured?: boolean;
};

interface UpdateDealStatusPayload {
    id: string;
    action: 'pause' | 'resume' | 'cancel' | 'activate';
    reason?: string;
}

const baseQuery = createAuthBaseQuery(API_BASE_URL);

export const dealsApi = createApi({
    reducerPath: 'dealsApi',
    baseQuery,
    tagTypes: ['ActiveDeal', 'UpcomingDeal', 'Deals', 'Deal'],
    endpoints: (builder) => ({
        getActiveDeal: builder.query<ApiResponse<ActiveDealPayload>, void>({
            query: () => ({
                url: '/deals/active',
            }),
            providesTags: (result) => {
                const activeId = result?.data?.deal?._id ?? 'CURRENT';
                return [
                    { type: 'ActiveDeal' as const, id: activeId },
                    { type: 'Deal' as const, id: activeId },
                ];
            },
        }),

        getUpcomingDeal: builder.query<ApiResponse<UpcomingDealPayload>, void>({
            query: () => ({
                url: '/deals/upcoming',
            }),
            providesTags: [{ type: 'UpcomingDeal', id: 'NEXT' }],
        }),

        getAdminDeals: builder.query<ApiResponse<AdminDealsListResponse>, DealsListQueryParams | void>({
            query: (params) => {
                const queryParams: Record<string, string | number> = {};
                if (params?.status && params.status !== 'all') {
                    queryParams.status = params.status;
                }
                if (params?.productId) {
                    queryParams.productId = params.productId;
                }
                if (typeof params?.page === 'number') {
                    queryParams.page = params.page;
                }
                if (typeof params?.limit === 'number') {
                    queryParams.limit = params.limit;
                }
                if (params?.search) {
                    queryParams.search = params.search;
                }

                return {
                    url: '/admin/deals',
                    params: Object.keys(queryParams).length ? queryParams : undefined,
                };
            },
            providesTags: (result) => {
                const payload = result?.data;
                const deals = Array.isArray(payload)
                    ? (payload as unknown as Deal[])
                    : payload?.deals ?? [];

                return deals.length
                    ? [
                        ...deals.map((deal) => ({ type: 'Deal' as const, id: deal._id })),
                        { type: 'Deals' as const, id: 'LIST' },
                    ]
                    : [{ type: 'Deals' as const, id: 'LIST' }];
            },
        }),

        getDealById: builder.query<ApiResponse<{ deal: Deal }>, string>({
            query: (id) => ({
                url: `/admin/deals/${id}`,
            }),
            providesTags: (_result, _error, id) => [{ type: 'Deal', id }],
        }),

        createDeal: builder.mutation<ApiResponse<{ deal: Deal }>, CreateDealPayload>({
            query: (body) => ({
                url: '/admin/deals',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Deals', id: 'LIST' }, { type: 'UpcomingDeal', id: 'NEXT' }],
        }),

        updateDeal: builder.mutation<ApiResponse<{ deal: Deal }>, UpdateDealPayload>({
            query: ({ id, ...body }) => ({
                url: `/admin/deals/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Deal', id },
                { type: 'Deals', id: 'LIST' },
                { type: 'ActiveDeal', id },
                { type: 'UpcomingDeal', id: 'NEXT' },
            ],
        }),

            deleteDeal: builder.mutation<ApiResponse<{ success: boolean }>, string>({
                query: (id) => ({
                    url: `/admin/deals/${id}`,
                    method: 'DELETE',
                }),
                invalidatesTags: (_result, _error, id) => [
                    { type: 'Deal', id },
                    { type: 'Deals', id: 'LIST' },
                    { type: 'ActiveDeal', id },
                    { type: 'UpcomingDeal', id: 'NEXT' },
                ],
            }),

        updateDealStatus: builder.mutation<ApiResponse<{ deal: Deal }>, UpdateDealStatusPayload>({
            query: ({ id, action, reason }) => ({
                url: `/admin/deals/${id}/${action}`,
                method: 'POST',
                body: reason ? { reason } : undefined,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Deal', id },
                { type: 'Deals', id: 'LIST' },
                { type: 'ActiveDeal', id },
                { type: 'UpcomingDeal', id: 'NEXT' },
            ],
        }),

        previewDeal: builder.mutation<ApiResponse<{ deal: Deal }>, CreateDealPayload>({
            query: (body) => ({
                url: '/admin/deals/preview',
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const {
    useGetActiveDealQuery,
    useGetUpcomingDealQuery,
    useGetAdminDealsQuery,
    useGetDealByIdQuery,
    useCreateDealMutation,
    useUpdateDealMutation,
    useDeleteDealMutation,
    useUpdateDealStatusMutation,
    usePreviewDealMutation,
} = dealsApi;
