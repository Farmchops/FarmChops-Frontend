// src/store/api/adminManagementApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { createAdminAuthBaseQuery } from './baseQuery';
import type { ApiResponse } from '@/types/api';
import type { AdminUser } from './adminAuthApi';

export interface AdminListResponse {
    admins: AdminUser[];
    total: number;
}

export interface UpdateAdminRoleRequest {
    adminRole: string;
}

export interface UpdateAdminPermissionsRequest {
    permissions: string[];
}

export interface UpdateAdminStatusRequest {
    isActive: boolean;
}

const baseQuery = createAdminAuthBaseQuery(`${import.meta.env.VITE_API_BASE_URL}/admin/management`);

export const adminManagementApi = createApi({
    reducerPath: 'adminManagementApi',
    baseQuery,
    tagTypes: ['AdminList', 'Admin'],
    endpoints: (builder) => ({
        // Get all admins
        getAdmins: builder.query<ApiResponse<AdminListResponse>, void>({
            query: () => '/list',
            providesTags: (result) =>
                result?.data?.admins
                    ? [
                        ...result.data.admins.map(({ id }) => ({
                            type: 'Admin' as const,
                            id,
                        })),
                        { type: 'AdminList', id: 'LIST' },
                    ]
                    : [{ type: 'AdminList', id: 'LIST' }],
        }),

        // Get single admin by ID
        getAdminById: builder.query<ApiResponse<AdminUser>, string>({
            query: (id) => `/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Admin', id }],
        }),

        // Update admin role
        updateAdminRole: builder.mutation<
            ApiResponse<{ id: string; email: string; adminRole: string; permissions: string[] }>,
            { id: string; body: UpdateAdminRoleRequest }
        >({
            query: ({ id, body }) => ({
                url: `/${id}/role`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Admin', id },
                { type: 'AdminList', id: 'LIST' },
            ],
        }),

        // Update admin permissions
        updateAdminPermissions: builder.mutation<
            ApiResponse<{ id: string; email: string; adminRole: string; permissions: string[] }>,
            { id: string; body: UpdateAdminPermissionsRequest }
        >({
            query: ({ id, body }) => ({
                url: `/${id}/permissions`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Admin', id },
                { type: 'AdminList', id: 'LIST' },
            ],
        }),

        // Update admin status (activate/deactivate)
        updateAdminStatus: builder.mutation<
            ApiResponse<{ id: string; email: string; isActive: boolean }>,
            { id: string; body: UpdateAdminStatusRequest }
        >({
            query: ({ id, body }) => ({
                url: `/${id}/status`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Admin', id },
                { type: 'AdminList', id: 'LIST' },
            ],
        }),


        // Delete admin
        deleteAdmin: builder.mutation<
            ApiResponse<{ message: string }>,
            string
        >({
            query: (id) => ({
                url: `/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'Admin', id },
                { type: 'AdminList', id: 'LIST' },
            ],
        }),

    }),
});

export const {
    useGetAdminsQuery,
    useGetAdminByIdQuery,
    useUpdateAdminRoleMutation,
    useUpdateAdminPermissionsMutation,
    useUpdateAdminStatusMutation,
    useDeleteAdminMutation
    
} = adminManagementApi;