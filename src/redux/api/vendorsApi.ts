import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import type { ApiResponse } from '@/types/api';

// Minimal vendor shape used by the admin UI. Extend as needed.
type Vendor = {
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
    tagTypes: ['Vendors', 'Vendor', 'VendorContacts', 'VendorRequests', 'VendorNotes'],
    endpoints: (builder) => ({
        // GET /admin/vendors?page&perPage&status&search
    getVendors: builder.query<ApiResponse<{ vendors: Vendor[]; meta: Record<string, unknown> }>, { page?: number; perPage?: number; status?: string; search?: string; sortBy?: string; order?: string }>({
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
                          ...result.data.vendors.map((v: Vendor) => ({ type: 'Vendor' as const, id: v._id })),
                          { type: 'Vendors', id: 'LIST' },
                      ]
                    : [{ type: 'Vendors', id: 'LIST' }],
        }),

        // GET /admin/vendors/:id
        getVendor: builder.query<ApiResponse<{ vendor: Vendor; contacts?: unknown[]; requests?: unknown[]; notes?: unknown[] }>, string>({
            query: (id) => `/admin/vendors/${id}`,
            providesTags: (result) =>
                result?.data
                    ? [
                          { type: 'Vendor' as const, id: ((result.data as { vendor?: Vendor }).vendor?._id) || '' },
                      ]
                    : [],
        }),

        // PUT /admin/vendors/:id/status
        updateVendorStatus: builder.mutation<ApiResponse<{ vendor: Vendor }>, { id: string; status: string; reason?: string; metadata?: Record<string, unknown>; notify?: boolean }>({
            query: ({ id, ...body }) => ({
                url: `/admin/vendors/${id}/status`,
                method: 'PUT',
                body,
            }),
            // Optimistic cache patch: update the getVendor (by id) and common getVendors cache entries
            async onQueryStarted({ id, status }, { dispatch, queryFulfilled }) {
                // Patch the single vendor cache
                const patchGetVendor = dispatch(
                    vendorsApi.util.updateQueryData('getVendor', id, (draft: unknown) => {
                        try {
                            const d = draft as { data?: { vendors?: Vendor[]; vendor?: Vendor } } | Vendor[] | Record<string, unknown>;
                            if (d && typeof d === 'object' && 'data' in (d as Record<string, unknown>)) {
                                const data = ((d as Record<string, unknown>).data) as Record<string, unknown>;
                                if (data && 'vendor' in data && typeof data.vendor === 'object') ((data as Record<string, unknown>).vendor as Vendor).status = status;
                                else (data as Record<string, unknown>)['status'] = status;
                            } else if (d && typeof d === 'object' && 'vendor' in (d as Record<string, unknown>)) {
                                ((d as Record<string, unknown>)['vendor'] as Vendor).status = status;
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    })
                );

                // Patch the vendors list for a couple of common args (page 1 and undefined)
                const patchGetVendorsPage1 = dispatch(
                    vendorsApi.util.updateQueryData('getVendors', { page: 1, perPage: 20 }, (draft: unknown) => {
                        try {
                            if (!draft) return;
                            const d = draft as { data?: { vendors?: Vendor[] } } | Vendor[] | Record<string, unknown>;
                            const data = ((d as Record<string, unknown>)['data'] ?? d) as Record<string, unknown> | Vendor[];
                            if (data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>)['vendors'])) {
                                const vendorsArr = (data as Record<string, unknown>)['vendors'] as Vendor[];
                                (data as Record<string, unknown>)['vendors'] = vendorsArr.map((v: Vendor) => (v._id === id || v.id === id ? { ...v, status } : v));
                            } else if (Array.isArray(d)) {
                                // root array
                                for (const v of d as Vendor[]) {
                                    const vid = (v as Record<string, unknown>)['_id'] ?? (v as Record<string, unknown>)['id'];
                                    if (vid === id) (v as Record<string, unknown>)['status'] = status;
                                }
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    })
                );

                const patchGetVendorsUndefined = dispatch(
                    vendorsApi.util.updateQueryData('getVendors', {}, (draft: unknown) => {
                        try {
                            if (!draft) return;
                            const d = draft as { data?: { vendors?: Vendor[] } } | Vendor[] | Record<string, unknown>;
                            const data = ((d as Record<string, unknown>)['data'] ?? d) as Record<string, unknown> | Vendor[];
                            if (data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>)['vendors'])) {
                                const vendorsArr = (data as Record<string, unknown>)['vendors'] as Vendor[];
                                (data as Record<string, unknown>)['vendors'] = vendorsArr.map((v: Vendor) => (v._id === id || v.id === id ? { ...v, status } : v));
                            } else if (Array.isArray(d)) {
                                for (const v of d as Vendor[]) {
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
                    try { patchGetVendor.undo(); } catch (e) { console.error(e); }
                    try { patchGetVendorsPage1.undo(); } catch (e) { console.error(e); }
                    try { patchGetVendorsUndefined.undo(); } catch (e) { console.error(e); }
                }
            },
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Vendor', id }, { type: 'Vendors', id: 'LIST' }],
        }),

        // POST /admin/vendors/:id/contact
        createVendorContact: builder.mutation<ApiResponse<{ contactRecord: Record<string, unknown> }>, { id: string; note: string; channel?: 'phone' | 'email' | 'visit' | 'other'; date?: string; assignedRep?: string; idempotencyKey?: string }>({
            query: ({ id, idempotencyKey, ...body }) => ({
                url: `/admin/vendors/${id}/contact`,
                method: 'POST',
                body,
                headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Vendor', id }, { type: 'VendorContacts', id }],
        }),

        // POST /admin/vendors/:id/request-info
        createVendorRequestInfo: builder.mutation<ApiResponse<{ requestRecord: Record<string, unknown> }>, { id: string; message: string; fieldsRequested?: string[]; notify?: boolean }>({
            query: ({ id, ...body }) => ({
                url: `/admin/vendors/${id}/request-info`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Vendor', id }, { type: 'Vendors', id: 'LIST' }],
        }),

        // POST /admin/vendors/:id/notes
        createVendorNote: builder.mutation<ApiResponse<{ note: Record<string, unknown> }>, { id: string; text: string }>({
            query: ({ id, ...body }) => ({
                url: `/admin/vendors/${id}/notes`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Vendor', id }, { type: 'VendorNotes', id }],
        }),
        // DELETE /admin/vendors/:id
        deleteVendor: builder.mutation<ApiResponse<{ message?: string }>, string>({
            query: (id) => ({
                url: `/admin/vendors/${id}`,
                method: 'DELETE',
            }),
            // Invalidate the single vendor and the list so UI refreshes
            invalidatesTags: (_result, _error, id) => [{ type: 'Vendor', id }, { type: 'Vendors', id: 'LIST' }],
        }),
    }),
});

export const {
    useGetVendorsQuery,
    useGetVendorQuery,
    useUpdateVendorStatusMutation,
    useCreateVendorContactMutation,
    useCreateVendorRequestInfoMutation,
    useCreateVendorNoteMutation,
    useDeleteVendorMutation,
} = vendorsApi;

export default vendorsApi;
