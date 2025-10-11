// src/store/api/adminAuthApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setAdminCredentials, logoutAdmin } from '../features/auth/adminAuthSlice';
import type { RootState } from '../store';
import type { ApiResponse } from '@/types/api';

// Admin Types
export interface AdminUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin';
    adminRole: 'super_admin' | 'finance' | 'inventory_officer' | string;
    permissions: string[];
    isActive: boolean;
    phone?: string;
    profile?: {
        address?: string;
        isVerified: boolean;
    };
    wallet?: {
        balance: number;
    };
    invitedBy?: {
        _id: string;
        email: string;
        firstName: string;
        lastName: string;
        id: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface AdminSignupRequest {
    email: string;
    otp: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface AdminLoginRequest {
    email: string;
    password: string;
}

export interface AdminForgotPasswordRequest {
    email: string;
}

export interface AdminResetPasswordRequest {
    email: string;
    resetCode: string;
    newPassword: string;
}

export interface AdminSendInviteRequest {
    email: string;
    adminRole: string;
}

export interface AdminSendInviteResponse {
    email: string;
    adminRole: string;
    expiresIn: string;
}

const baseQuery = fetchBaseQuery({
    baseUrl: 'https://api.farmchops.com/api/admin/auth',
    prepareHeaders: (headers, { getState }) => {
        const token = ((getState as () => RootState)()).adminAuth.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        headers.set('content-type', 'application/json');
        return headers;
    },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error?.status === 401) {
        // Token expired or invalid, logout admin
        api.dispatch(logoutAdmin());
    }

    return result;
};

export const adminAuthApi = createApi({
    reducerPath: 'adminAuthApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['AdminUser'],
    endpoints: (builder) => ({
        // Admin signup with OTP
        adminSignup: builder.mutation<
            ApiResponse<{ email: string; firstName: string; lastName: string; adminRole: string }>,
            AdminSignupRequest
        >({
            query: (data) => ({
                url: '/signup',
                method: 'POST',
                body: data,
            }),
        }),

        // Admin login
        adminLogin: builder.mutation<
            ApiResponse<{ token: string; user: AdminUser }>,
            AdminLoginRequest
        >({
            query: (data) => ({
                url: '/login',
                method: 'POST',
                body: data,
            }),
            async onQueryStarted(_unused, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data.success && data.data) {
                        dispatch(setAdminCredentials({
                            user: data.data.user,
                            token: data.data.token,
                        }));
                    }
                } catch (error) {
                    // Handle error
                }
            },
        }),

        // Admin forgot password
        adminForgotPassword: builder.mutation<ApiResponse, AdminForgotPasswordRequest>({
            query: (data) => ({
                url: '/forgot-password',
                method: 'POST',
                body: data,
            }),
        }),

        // Admin reset password
        adminResetPassword: builder.mutation<ApiResponse, AdminResetPasswordRequest>({
            query: (data) => ({
                url: '/reset-password',
                method: 'POST',
                body: data,
            }),
        }),

        // Send admin invitation
        adminSendInvite: builder.mutation<
            ApiResponse<AdminSendInviteResponse>,
            AdminSendInviteRequest
        >({
            query: (data) => ({
                url: '/send-invite',
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

export const {
    useAdminSignupMutation,
    useAdminLoginMutation,
    useAdminForgotPasswordMutation,
    useAdminResetPasswordMutation,
    useAdminSendInviteMutation,
} = adminAuthApi;