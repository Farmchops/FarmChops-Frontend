// src/lib/tokenUtils.ts

/**
 * JWT Token utilities for validation and expiration checking
 */

interface JWTPayload {
    exp: number; // Expiration timestamp (in seconds)
    iat?: number; // Issued at timestamp
    [key: string]: any; // Other JWT claims
}

/**
 * Decode JWT token payload without verification
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export const decodeToken = (token: string): JWTPayload | null => {
    try {
        // JWT format: header.payload.signature
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        // Decode the payload (middle part)
        const payload = parts[1];
        const decoded = atob(payload);
        return JSON.parse(decoded);
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
};

/**
 * Check if JWT token is expired
 * @param token - JWT token string
 * @returns true if expired or invalid, false if still valid
 */
export const isTokenExpired = (token: string | null): boolean => {
    if (!token) {
        return true;
    }

    try {
        const payload = decodeToken(token);
        if (!payload || !payload.exp) {
            return true;
        }

        // JWT exp is in seconds, Date.now() is in milliseconds
        const expirationTime = payload.exp * 1000;
        const currentTime = Date.now();

        // Add 5 second buffer to account for clock skew
        return currentTime >= (expirationTime - 5000);
    } catch (error) {
        console.error('Error checking token expiration:', error);
        return true;
    }
};

/**
 * Get token expiration time in milliseconds
 * @param token - JWT token string
 * @returns Expiration timestamp or null if invalid
 */
export const getTokenExpiration = (token: string | null): number | null => {
    if (!token) {
        return null;
    }

    try {
        const payload = decodeToken(token);
        if (!payload || !payload.exp) {
            return null;
        }

        return payload.exp * 1000;
    } catch (error) {
        console.error('Error getting token expiration:', error);
        return null;
    }
};

/**
 * Get time remaining until token expires (in milliseconds)
 * @param token - JWT token string
 * @returns Time remaining in ms, or 0 if expired/invalid
 */
export const getTokenTimeRemaining = (token: string | null): number => {
    const expiration = getTokenExpiration(token);
    if (!expiration) {
        return 0;
    }

    const remaining = expiration - Date.now();
    return Math.max(0, remaining);
};
