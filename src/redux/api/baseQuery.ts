// src/redux/api/baseQuery.ts
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { logout } from '../features/auth/authSlice';
import { logoutAdmin } from '../features/auth/adminAuthSlice';
import { isTokenExpired } from '../../lib/tokenUtils';

/**
 * Creates a base query with authentication and token expiration handling
 * @param baseUrl - The base URL for the API
 * @returns Enhanced base query function
 */
export const createAuthBaseQuery = (baseUrl: string): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => {
    const baseQuery = fetchBaseQuery({
        baseUrl,
        credentials: 'include', // CRITICAL: Send session cookies for guest carts
        prepareHeaders: (headers, { getState }) => {
            const token = ((getState as () => RootState)()).auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            // CRITICAL: Delete Content-Type to let browser set it automatically
            // For FormData, browser will set: multipart/form-data; boundary=----...
            // For JSON, RTK Query will set: application/json
            if (headers.has('content-type')) {
                headers.delete('content-type');
            }
            return headers;
        },
    });

    return async (args, api, extraOptions) => {
        // Check token expiration BEFORE making the request
        const state = api.getState() as RootState;
        const token = state.auth.token;

        if (token && isTokenExpired(token)) {
            console.log('Token expired before request, logging out...');
            api.dispatch(logout());

            // Return an error instead of making the request
            return {
                error: {
                    status: 401,
                    data: { message: 'Token expired. Please login again.' },
                } as FetchBaseQueryError,
            };
        }

        // Make the request
        const result = await baseQuery(args, api, extraOptions);

        // Handle 401 errors from the server
        if (result.error?.status === 401) {
            console.log('Received 401 error from server, logging out...');
            api.dispatch(logout());
        }

        return result;
    };
};

/**
 * Creates a base query for admin authentication
 * Uses adminAuth state instead of regular auth
 */
export const createAdminAuthBaseQuery = (baseUrl: string): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => {
    const baseQuery = fetchBaseQuery({
        baseUrl,
        credentials: 'include', // CRITICAL: Send session cookies
        prepareHeaders: (headers, { getState }) => {
            const token = ((getState as () => RootState)()).adminAuth?.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            // CRITICAL: Delete Content-Type to let browser set it automatically
            // For FormData, browser will set: multipart/form-data; boundary=----...
            // For JSON, RTK Query will set: application/json
            if (headers.has('content-type')) {
                headers.delete('content-type');
            }
            return headers;
        },
    });

    return async (args, api, extraOptions) => {
        // Check token expiration BEFORE making the request
        const state = api.getState() as RootState;
        const token = state.adminAuth?.token;

        if (token && isTokenExpired(token)) {
            console.log('Admin token expired before request, logging out...');
            api.dispatch(logoutAdmin());

            return {
                error: {
                    status: 401,
                    data: { message: 'Admin token expired. Please login again.' },
                } as FetchBaseQueryError,
            };
        }

        // Make the request
        const result = await baseQuery(args, api, extraOptions);

        // Handle 401 errors from the server
        if (result.error?.status === 401) {
            console.log('Received 401 error from admin API, logging out...');
            api.dispatch(logoutAdmin());
        }

        return result;
    };
};
