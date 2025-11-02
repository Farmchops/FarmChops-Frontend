import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import type { ApiResponse } from '@/types/api';

export interface RiderDirectoryEntry {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    isActive?: boolean;
    isOnDelivery?: boolean;
    activeDeliveries?: number;
}

export interface GetAdminRidersParams {
    search?: string;
    status?: 'active' | 'inactive' | 'all';
    page?: number;
    limit?: number;
}

export interface AdminRidersResponse {
    riders: RiderDirectoryEntry[];
    pagination?: {
        currentPage?: number;
        totalPages?: number;
        totalRiders?: number;
        perPage?: number;
    };
}

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? 'https://api.farmchops.com/api';

const baseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).adminAuth.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        headers.set('accept', 'application/json');
        return headers;
    },
});

const extractRiders = (response?: ApiResponse<AdminRidersResponse> | AdminRidersResponse | RiderDirectoryEntry[]): RiderDirectoryEntry[] => {
    if (!response) {
        return [];
    }

    if (Array.isArray(response)) {
        return response;
    }

    if ('data' in response && response.data) {
        const payload = response.data;
        if (Array.isArray((payload as AdminRidersResponse).riders)) {
            return (payload as AdminRidersResponse).riders;
        }
        if (Array.isArray(payload as unknown as RiderDirectoryEntry[])) {
            return payload as unknown as RiderDirectoryEntry[];
        }
    }

    if ('riders' in response && Array.isArray((response as AdminRidersResponse).riders)) {
        return (response as AdminRidersResponse).riders;
    }

    return [];
};

export const adminRidersApi = createApi({
    reducerPath: 'adminRidersApi',
    baseQuery,
    tagTypes: ['AdminRiders'],
    endpoints: (builder) => ({
        getAdminRiders: builder.query<ApiResponse<AdminRidersResponse> | AdminRidersResponse, GetAdminRidersParams | void>({
            query: (args) => {
                const params: Record<string, string | number> = {};
                if (args?.search) {
                    params.search = args.search;
                }
                if (args?.status) {
                    params.status = args.status;
                }
                if (typeof args?.page === 'number') {
                    params.page = args.page;
                }
                if (typeof args?.limit === 'number') {
                    params.limit = args.limit;
                }

                return {
                    url: '/admin/riders',
                    params: Object.keys(params).length ? params : undefined,
                };
            },
            providesTags: (result) => {
                const riders = extractRiders(result);
                return riders.length
                    ? [
                        ...riders.map((rider) => ({ type: 'AdminRiders' as const, id: rider._id })),
                        { type: 'AdminRiders' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminRiders' as const, id: 'LIST' }];
            },
        }),
    }),
});

export const { useGetAdminRidersQuery, useLazyGetAdminRidersQuery } = adminRidersApi;
