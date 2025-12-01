// src/redux/middleware/authErrorMiddleware.ts
import { isRejectedWithValue } from '@reduxjs/toolkit';
import type { Middleware } from '@reduxjs/toolkit';
import { logout } from '../features/auth/authSlice';

/**
 * Middleware to handle authentication errors globally
 * Automatically logs out user when token expires or is invalid
 */
export const authErrorMiddleware: Middleware = (storeApi) => (next) => (action) => {
  // Check if this is an RTK Query rejected action
  if (isRejectedWithValue(action)) {
    const payload = action.payload as any;

    // Check for 401 status or token-related error messages
    const isAuthError =
      payload?.status === 401 ||
      payload?.status === 'PARSING_ERROR' ||
      (payload?.data?.message && (
        payload.data.message.includes('Invalid or expired token') ||
        payload.data.message.includes('TOKEN_EXPIRED') ||
        payload.data.message.includes('jwt expired') ||
        payload.data.message.includes('Unauthorized') ||
        payload.data.message.includes('Authentication failed')
      ));

    if (isAuthError) {
      console.log('Authentication error detected, logging out user...');

      // Dispatch logout action to clear auth state
      storeApi.dispatch(logout());

      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
  }

  return next(action);
};
