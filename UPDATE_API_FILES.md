# API Files Migration Guide

## What Was Fixed
Added JWT token expiration checking to prevent "CORS-like" errors when tokens expire.

## Files Already Updated
✅ `src/redux/api/baseQuery.ts` - Shared base query with token expiration
✅ `src/redux/api/authApi.ts` - Uses `createAuthBaseQuery`
✅ `src/redux/api/cartApi.ts` - Uses `createAuthBaseQuery`
✅ `src/redux/api/orderApi.ts` - Uses `createAuthBaseQuery`
✅ `src/redux/api/productApi.ts` - Uses `createAdminAuthBaseQuery`
✅ `src/lib/tokenUtils.ts` - JWT token utilities

## Files That Need Manual Update

For each API file below, replace the old baseQuery pattern with the new one:

### For User Auth APIs (use `createAuthBaseQuery`):
- `src/redux/api/walletApi.ts`
- `src/redux/api/discountsApi.ts`
- `src/redux/api/dealsApi.ts`
- `src/redux/api/groupOrdersApi.ts`
- `src/redux/api/paylaterApi.ts`

### For Admin Auth APIs (use `createAdminAuthBaseQuery`):
- `src/redux/api/adminAuthApi.ts`
- `src/redux/api/adminDashboardApi.ts`
- `src/redux/api/adminOrdersApi.ts`
- `src/redux/api/adminRidersApi.ts`
- `src/redux/api/adminManagementApi.ts`
- `src/redux/api/categoryApi.ts`
- `src/redux/api/couponsApi.ts`
- `src/redux/api/marketersApi.ts`
- `src/redux/api/vendorsApi.ts`
- `src/redux/api/riderOrdersApi.ts`

## How to Update Each File

### BEFORE (Old Pattern):
```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

const baseQuery = fetchBaseQuery({
    baseUrl: 'https://api.farmchops.com/api/some-endpoint',
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.token; // or adminAuth.token
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        headers.set('content-type', 'application/json');
        return headers;
    },
});

export const someApi = createApi({
    reducerPath: 'someApi',
    baseQuery,
    // ... rest
});
```

### AFTER (New Pattern for User Auth):
```typescript
import { createApi } from '@reduxjs/toolkit/query/react';
import { createAuthBaseQuery } from './baseQuery';

export const someApi = createApi({
    reducerPath: 'someApi',
    baseQuery: createAuthBaseQuery('https://api.farmchops.com/api/some-endpoint'),
    // ... rest
});
```

### AFTER (New Pattern for Admin Auth):
```typescript
import { createApi } from '@reduxjs/toolkit/query/react';
import { createAdminAuthBaseQuery } from './baseQuery';

export const someApi = createApi({
    reducerPath: 'someApi',
    baseQuery: createAdminAuthBaseQuery('https://api.farmchops.com/api/some-endpoint'),
    // ... rest
});
```

## Key Changes
1. Remove `fetchBaseQuery` import (unless used elsewhere)
2. Remove `RootState` import (unless used elsewhere)
3. Add `createAuthBaseQuery` or `createAdminAuthBaseQuery` import from `'./baseQuery'`
4. Replace the custom `baseQuery` constant with the imported function
5. Keep the original `baseUrl` string

## Why This Fixes the Issue
- **Before**: Token expiration wasn't checked before making requests
- **After**: Every API request now:
  1. Checks if the JWT token is expired BEFORE making the request
  2. Automatically logs out the user if the token is expired
  3. Catches 401 errors from the backend and triggers logout
  4. Prevents misleading "CORS error" messages

Users no longer need to manually clear localStorage/sessionStorage after backend updates!
