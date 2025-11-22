// // src/store/features/auth/adminAuthSlice.ts
// import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
// import { secureStorage } from '@/lib/secureStorage';
// import type { AdminUser } from '@/redux/api/adminAuthApi';
// // import type { AdminUser } from '@/store/api/adminAuthApi';

// const ADMIN_AUTH_STORAGE_KEY = 'farmchops_admin_auth_state';

// export interface AdminAuthState {
//     user: AdminUser | null;
//     token: string | null;
//     isAuthenticated: boolean;
// }

// // Load persisted admin state
// const loadPersistedState = (): AdminAuthState => {
//     try {
//         const persisted = secureStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
//         if (persisted) {
//             return {
//                 user: persisted.user,
//                 token: persisted.token,
//                 isAuthenticated: !!persisted.token,
//             };
//         }
//     } catch (error) {
//         console.error('Failed to load admin auth state:', error);
//     }

//     return {
//         user: null,
//         token: null,
//         isAuthenticated: false,
//     };
// };

// const initialState: AdminAuthState = loadPersistedState();

// interface SetAdminCredentialsPayload {
//     user: AdminUser;
//     token: string;
// }

// const adminAuthSlice = createSlice({
//     name: 'adminAuth',
//     initialState,
//     reducers: {
//         setAdminCredentials: (state, action: PayloadAction<SetAdminCredentialsPayload>) => {
//             const { user, token } = action.payload;
//             state.user = user;
//             state.token = token;
//             state.isAuthenticated = !!token;

//             // Persist to secure storage
//             secureStorage.setItem(ADMIN_AUTH_STORAGE_KEY, {
//                 user,
//                 token,
//             });
//         },

//         logoutAdmin: (state) => {
//             state.user = null;
//             state.token = null;
//             state.isAuthenticated = false;

//             // Clear from storage
//             secureStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
//         },

//         updateAdminUser: (state, action: PayloadAction<Partial<AdminUser>>) => {
//             if (state.user) {
//                 state.user = { ...state.user, ...action.payload };

//                 // Update storage
//                 const current = secureStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
//                 if (current) {
//                     secureStorage.setItem(ADMIN_AUTH_STORAGE_KEY, {
//                         ...current,
//                         user: state.user,
//                     });
//                 }
//             }
//         },
//     },
// });

// export const { setAdminCredentials, logoutAdmin, updateAdminUser } = adminAuthSlice.actions;
// export default adminAuthSlice.reducer;











// src/redux/features/auth/adminAuthSlice.ts
import { createSlice,type PayloadAction } from '@reduxjs/toolkit';

interface AdminUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin';
    adminRole: string;
    permissions: string[];
    isActive?: boolean;
}

interface AdminAuthState {
    user: AdminUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AdminAuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

// Load from localStorage on app start
const loadAuthFromStorage = (): Partial<AdminAuthState> => {
    // Guard against SSR or environments without localStorage
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        console.warn('[AdminAuth] localStorage not available');
        return {};
    }

    try {
        const savedToken = localStorage.getItem('adminToken');
        const savedUser = localStorage.getItem('adminUser');

        if (savedToken && savedUser) {
            console.log('[AdminAuth] Loaded token from localStorage');
            return {
                token: savedToken,
                user: JSON.parse(savedUser),
                isAuthenticated: true,
            };
        } else {
            console.log('[AdminAuth] No saved token found in localStorage');
        }
    } catch (error) {
        console.error('[AdminAuth] Failed to load auth from storage:', error);
    }
    return {};
};

const adminAuthSlice = createSlice({
    name: 'adminAuth',
    initialState: { ...initialState, ...loadAuthFromStorage() },
    reducers: {
        // Set admin credentials after login
        setAdminCredentials: (
            state,
            action: PayloadAction<{ user: AdminUser; token: string }>
        ) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.isAuthenticated = true;
            state.error = null;
            state.isLoading = false;

            // Persist to localStorage
            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminUser', JSON.stringify(user));
        },

        // Logout admin
        logoutAdmin: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;

            // Clear localStorage
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
        },

        // Set loading state
        setAdminLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        // Set error
        setAdminError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },

        // Clear error
        clearAdminError: (state) => {
            state.error = null;
        },

        // Update user (for profile updates, etc.)
        updateAdminUser: (state, action: PayloadAction<Partial<AdminUser>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
                localStorage.setItem('adminUser', JSON.stringify(state.user));
            }
        },
    },
});

export const {
    setAdminCredentials,
    logoutAdmin,
    setAdminLoading,
    setAdminError,
    clearAdminError,
    updateAdminUser,
} = adminAuthSlice.actions;

export default adminAuthSlice.reducer;