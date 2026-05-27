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

    // Only treat as an auth error when the message indicates a token/session problem.
    // A bare 401 on a login endpoint means wrong credentials — not an expired session —
    // so we must not redirect in that case.
    const tokenErrorMessage =
      payload?.status === 401 &&
      payload?.data?.message &&
      (
        payload.data.message.includes('Invalid or expired token') ||
        payload.data.message.includes('TOKEN_EXPIRED') ||
        payload.data.message.includes('jwt expired') ||
        payload.data.message.includes('Authentication failed')
      );

    const isAuthError = tokenErrorMessage || payload?.status === 'PARSING_ERROR';

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
