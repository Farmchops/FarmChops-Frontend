// src/store/api/authApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { logout, setCredentials } from '../features/auth/authSlice';
import type {
    User,
    LoginRequest,
    SignupRequest,
    CompleteSignupRequest,
    ProfileUpdateRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ApiResponse,
} from '../../types/auth';
import type { RootState } from '../store';
import { createAuthBaseQuery } from './baseQuery';

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: createAuthBaseQuery('https://api.farmchops.com/api/auth'),
    tagTypes: ['User'],
    endpoints: (builder) => ({
        // Initial signup (email only)
        signup: builder.mutation<ApiResponse, SignupRequest>({
            query: (data) => ({
                url: '/signup',
                method: 'POST',
                body: data,
            }),
        }),

        // Complete signup with verification code
        completeSignup: builder.mutation<ApiResponse<{ user: User; token: string }>, CompleteSignupRequest>({
            query: (data) => ({
                url: '/signup/complete',
                method: 'POST',
                body: data,
            }),
            async onQueryStarted(_unused, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data.success && data.data) {
                        dispatch(setCredentials({
                            user: data.data.user,
                            token: data.data.token,
                            profileComplete: false, // New user needs to complete profile
                        }));
                    }
                } catch (error) {
                    // Handle error
                }
            },
        }),

        // Login
        login: builder.mutation<ApiResponse<{ user: User; token: string }>, LoginRequest>({
            query: (data) => ({
                url: '/login',
                method: 'POST',
                body: data,
            }),
            async onQueryStarted(_unused, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data.success && data.data) {
                        // Check if profile is complete
                        const user = data.data.user;
                        const profileComplete = !!(user.firstName && user.lastName && user.phone);

                        dispatch(setCredentials({
                            user: data.data.user,
                            token: data.data.token,
                            profileComplete,
                        }));
                    }
                } catch (error) {
                    // Handle error
                }
            },
        }),

        // Update profile
        updateProfile: builder.mutation<ApiResponse<{ user: User; profileComplete: boolean }>, ProfileUpdateRequest>({
            query: (data) => ({
                url: '/profile',
                method: 'PUT',
                body: data,
            }),
            async onQueryStarted(_unused, { dispatch, queryFulfilled, getState }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data.success && data.data) {
                        const currentState = (getState() as RootState).auth;
                        dispatch(setCredentials({
                            user: data.data.user,
                            token: currentState.token,
                            profileComplete: data.data.profileComplete,
                        }));
                    }
                } catch (error) {
                    // Handle error
                }
            },
            invalidatesTags: ['User'],
        }),

        // Get profile
        getProfile: builder.query<ApiResponse<{ user: User }>, void>({
            query: () => '/profile',
            providesTags: ['User'],
        }),

        // Logout
        logout: builder.mutation<ApiResponse, { email: string }>({
            query: (data) => ({
                url: '/logout',
                method: 'POST',
                body: data,
            }),
            async onQueryStarted(_unused, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(logout());
                } catch (error) {
                    // Even if logout fails on server, clear local state
                    dispatch(logout());
                }
            },
        }),

        // Forgot password
        forgotPassword: builder.mutation<ApiResponse, ForgotPasswordRequest>({
            query: (data) => ({
                url: '/forgot-password',
                method: 'POST',
                body: data,
            }),
        }),

        // Reset password
        resetPassword: builder.mutation<ApiResponse, ResetPasswordRequest>({
            query: (data) => ({
                url: '/reset-password',
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

export const {
    useSignupMutation,
    useCompleteSignupMutation,
    useLoginMutation,
    useUpdateProfileMutation,
    useGetProfileQuery,
    useLogoutMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
} = authApi;
