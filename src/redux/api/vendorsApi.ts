import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import type { ApiResponse } from '@/types/api';

// Minimal farmer shape used by the admin UI. Extend as needed.
type Farmer = {
    _id: string;
    firstName?: string;
    lastName?: string;
    status?: 'pending' | 'needs_info' | 'contacted' | 'partnered' | 'declined' | string;
    address?: string;
    [key: string]: unknown;
};

const baseQuery = fetchBaseQuery({
    baseUrl: 'https://api.farmchops.com/api',
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).adminAuth?.token;
        if (token) headers.set('authorization', `Bearer ${token}`);
        headers.set('content-type', 'application/json');
        return headers;
    },
});

export const vendorsApi = createApi({
    reducerPath: 'vendorsApi',
    baseQuery,
    tagTypes: ['Farmers', 'Farmer', 'FarmerContacts', 'FarmerRequests', 'FarmerNotes'],
    endpoints: (builder) => ({
        // GET /admin/vendors?page&perPage&status&search (backend endpoint)
    getFarmers: builder.query<ApiResponse<{ vendors: Farmer[]; meta: Record<string, unknown> }>, { page?: number; perPage?: number; status?: string; search?: string; sortBy?: string; order?: string }>({
            query: ({ page = 1, perPage = 20, status, search, sortBy, order } = {}) => {
                const params = new URLSearchParams();
                params.set('page', String(page));
                params.set('perPage', String(perPage));
                if (status) params.set('status', status);
                if (search) params.set('search', search);
                if (sortBy) params.set('sortBy', sortBy);
                if (order) params.set('order', order);
                return `/admin/vendors?${params.toString()}`;
            },
            providesTags: (result) =>
                result?.data?.vendors
                    ? [
                          ...result.data.vendors.map((v: Farmer) => ({ type: 'Farmer' as const, id: v._id })),
                          { type: 'Farmers', id: 'LIST' },
                      ]
                    : [{ type: 'Farmers', id: 'LIST' }],
        }),

        // GET /admin/vendors/:id (backend endpoint)
        getFarmer: builder.query<ApiResponse<{ vendor: Farmer; contacts?: unknown[]; requests?: unknown[]; notes?: unknown[] }>, string>({
            query: (id) => `/admin/vendors/${id}`,
            providesTags: (result) =>
                result?.data
                    ? [
                          { type: 'Farmer' as const, id: ((result.data as { vendor?: Farmer }).vendor?._id) || '' },
                      ]
                    : [],
        }),

        // PUT /admin/vendors/:id/status (backend endpoint)
        updateFarmerStatus: builder.mutation<ApiResponse<{ vendor: Farmer }>, { id: string; status: string; reason?: string; metadata?: Record<string, unknown>; notify?: boolean }>({
            query: ({ id, ...body }) => ({
                url: `/admin/vendors/${id}/status`,
                method: 'PUT',
                body,
            }),
            // Optimistic cache patch: update the getFarmer (by id) and common getFarmers cache entries
            async onQueryStarted({ id, status }, { dispatch, queryFulfilled }) {
                // Patch the single farmer cache
                const patchGetFarmer = dispatch(
                    vendorsApi.util.updateQueryData('getFarmer', id, (draft: unknown) => {
                        try {
                            const d = draft as { data?: { vendors?: Farmer[]; vendor?: Farmer } } | Farmer[] | Record<string, unknown>;
                            if (d && typeof d === 'object' && 'data' in (d as Record<string, unknown>)) {
                                const data = ((d as Record<string, unknown>).data) as Record<string, unknown>;
                                if (data && 'vendor' in data && typeof data.vendor === 'object') ((data as Record<string, unknown>).vendor as Farmer).status = status;
                                else (data as Record<string, unknown>)['status'] = status;
                            } else if (d && typeof d === 'object' && 'vendor' in (d as Record<string, unknown>)) {
                                ((d as Record<string, unknown>)['vendor'] as Farmer).status = status;
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    })
                );

                // Patch the farmers list for a couple of common args (page 1 and undefined)
                const patchGetFarmersPage1 = dispatch(
                    vendorsApi.util.updateQueryData('getFarmers', { page: 1, perPage: 20 }, (draft: unknown) => {
                        try {
                            if (!draft) return;
                            const d = draft as { data?: { vendors?: Farmer[] } } | Farmer[] | Record<string, unknown>;
                            const data = ((d as Record<string, unknown>)['data'] ?? d) as Record<string, unknown> | Farmer[];
                            if (data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>)['vendors'])) {
                                const farmersArr = (data as Record<string, unknown>)['vendors'] as Farmer[];
                                (data as Record<string, unknown>)['vendors'] = farmersArr.map((v: Farmer) => (v._id === id || v.id === id ? { ...v, status } : v));
                            } else if (Array.isArray(d)) {
                                // root array
                                for (const v of d as Farmer[]) {
                                    const vid = (v as Record<string, unknown>)['_id'] ?? (v as Record<string, unknown>)['id'];
                                    if (vid === id) (v as Record<string, unknown>)['status'] = status;
                                }
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    })
                );

                const patchGetFarmersUndefined = dispatch(
                    vendorsApi.util.updateQueryData('getFarmers', {}, (draft: unknown) => {
                        try {
                            if (!draft) return;
                            const d = draft as { data?: { vendors?: Farmer[] } } | Farmer[] | Record<string, unknown>;
                            const data = ((d as Record<string, unknown>)['data'] ?? d) as Record<string, unknown> | Farmer[];
                            if (data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>)['vendors'])) {
                                const farmersArr = (data as Record<string, unknown>)['vendors'] as Farmer[];
                                (data as Record<string, unknown>)['vendors'] = farmersArr.map((v: Farmer) => (v._id === id || v.id === id ? { ...v, status } : v));
                            } else if (Array.isArray(d)) {
                                for (const v of d as Farmer[]) {
                                    const vid = (v as Record<string, unknown>)['_id'] ?? (v as Record<string, unknown>)['id'];
                                    if (vid === id) (v as Record<string, unknown>)['status'] = status;
                                }
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    })
                );

                try {
                    await queryFulfilled;
                } catch (err) {
                    console.error(err);
                    // rollback
                    try { patchGetFarmer.undo(); } catch (e) { console.error(e); }
                    try { patchGetFarmersPage1.undo(); } catch (e) { console.error(e); }
                    try { patchGetFarmersUndefined.undo(); } catch (e) { console.error(e); }
                }
            },
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Farmer', id }, { type: 'Farmers', id: 'LIST' }],
        }),

        // POST /admin/vendors/:id/contact (backend endpoint)
        createFarmerContact: builder.mutation<ApiResponse<{ contactRecord: Record<string, unknown> }>, { id: string; note: string; channel?: 'phone' | 'email' | 'visit' | 'other'; date?: string; assignedRep?: string; idempotencyKey?: string }>({
            query: ({ id, idempotencyKey, ...body }) => ({
                url: `/admin/vendors/${id}/contact`,
                method: 'POST',
                body,
                headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Farmer', id }, { type: 'FarmerContacts', id }],
        }),

        // POST /admin/vendors/:id/request-info (backend endpoint)
        createFarmerRequestInfo: builder.mutation<ApiResponse<{ requestRecord: Record<string, unknown> }>, { id: string; message: string; fieldsRequested?: string[]; notify?: boolean }>({
            query: ({ id, ...body }) => ({
                url: `/admin/vendors/${id}/request-info`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Farmer', id }, { type: 'Farmers', id: 'LIST' }],
        }),

        // POST /admin/vendors/:id/notes (backend endpoint)
        createFarmerNote: builder.mutation<ApiResponse<{ note: Record<string, unknown> }>, { id: string; text: string }>({
            query: ({ id, ...body}) => ({
                url: `/admin/vendors/${id}/notes`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Farmer', id }, { type: 'FarmerNotes', id }],
        }),
        // DELETE /admin/vendors/:id (backend endpoint)
        deleteFarmer: builder.mutation<ApiResponse<{ message?: string }>, string>({
            query: (id) => ({
                url: `/admin/vendors/${id}`,
                method: 'DELETE',
            }),
            // Invalidate the single farmer and the list so UI refreshes
            invalidatesTags: (_result, _error, id) => [{ type: 'Farmer', id }, { type: 'Farmers', id: 'LIST' }],
        }),
    }),
});

export const {
    useGetFarmersQuery,
    useGetFarmerQuery,
    useUpdateFarmerStatusMutation,
    useCreateFarmerContactMutation,
    useCreateFarmerRequestInfoMutation,
    useCreateFarmerNoteMutation,
    useDeleteFarmerMutation,
} = vendorsApi;

export default vendorsApi;
