// // src/store/slices/authSlice.ts
// import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
// import { type AuthState, type User } from '../../../types/auth';

// const initialState: AuthState = {
//     user: null,
//     token: null,
//     isAuthenticated: false,
//     profileComplete: false,
// };

// interface SetCredentialsPayload {
//     user: User;
//     token: string | null;
//     profileComplete: boolean;
// }

// const authSlice = createSlice({
//     name: 'auth',
//     initialState,
//     reducers: {
//         setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
//             const { user, token, profileComplete } = action.payload;
//             state.user = user;
//             state.token = token;
//             state.isAuthenticated = !!token;
//             state.profileComplete = profileComplete;
//         },
//         logout: (state) => {
//             state.user = null;
//             state.token = null;
//             state.isAuthenticated = false;
//             state.profileComplete = false;
//         },
//         updateProfileComplete: (state, action: PayloadAction<boolean>) => {
//             state.profileComplete = action.payload;
//         },
//     },
// });

// export const { setCredentials, logout, updateProfileComplete } = authSlice.actions;
// export default authSlice.reducer;










//LocalStorage

// src/store/slices/authSlice.ts
// import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
// import { type AuthState, type User } from '../../../types/auth';

// // Load initial state from localStorage
// const loadState = (): AuthState => {
//     try {
//         const serializedState = localStorage.getItem('auth');
//         if (serializedState === null) {
//             return {
//                 user: null,
//                 token: null,
//                 isAuthenticated: false,
//                 profileComplete: false,
//             };
//         }
//         return JSON.parse(serializedState);
//     } catch (err) {
//         return {
//             user: null,
//             token: null,
//             isAuthenticated: false,
//             profileComplete: false,
//         };
//     }
// };

// const initialState: AuthState = loadState();

// interface SetCredentialsPayload {
//     user: User;
//     token: string | null;
//     profileComplete: boolean;
// }

// const authSlice = createSlice({
//     name: 'auth',
//     initialState,
//     reducers: {
//         setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
//             const { user, token, profileComplete } = action.payload;
//             state.user = user;
//             state.token = token;
//             state.isAuthenticated = !!token;
//             state.profileComplete = profileComplete;

//             // Persist to localStorage
//             localStorage.setItem('auth', JSON.stringify(state));
//         },
//         logout: (state) => {
//             state.user = null;
//             state.token = null;
//             state.isAuthenticated = false;
//             state.profileComplete = false;

//             // Clear localStorage
//             localStorage.removeItem('auth');
//         },
//         updateProfileComplete: (state, action: PayloadAction<boolean>) => {
//             state.profileComplete = action.payload;

//             // Persist to localStorage
//             localStorage.setItem('auth', JSON.stringify(state));
//         },
//     },
// });

// export const { setCredentials, logout, updateProfileComplete } = authSlice.actions;
// export default authSlice.reducer;













import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type AuthState, type User } from '../../../types/auth';
import { secureStorage } from '@/lib/secureStorage';

const AUTH_STORAGE_KEY = 'farmchops_auth_state';

// Load persisted state
const loadPersistedState = (): AuthState => {
    try {
        const persisted = secureStorage.getItem(AUTH_STORAGE_KEY);
        if (persisted) {
            return {
                user: persisted.user,
                token: persisted.token,
                isAuthenticated: !!persisted.token,
                profileComplete: persisted.profileComplete,
            };
        }
    } catch (error) {
        console.error('Failed to load auth state:', error);
    }

    return {
        user: null,
        token: null,
        isAuthenticated: false,
        profileComplete: false,
    };
};

const initialState: AuthState = loadPersistedState();

interface SetCredentialsPayload {
    user: User;
    token: string | null;
    profileComplete: boolean;
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
            const { user, token, profileComplete } = action.payload;
            state.user = user;
            state.token = token;
            state.isAuthenticated = !!token;
            state.profileComplete = profileComplete;

            // Persist to secure storage
            secureStorage.setItem(AUTH_STORAGE_KEY, {
                user,
                token,
                profileComplete,
            });
        },

        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.profileComplete = false;

            // Clear from storage
            secureStorage.removeItem(AUTH_STORAGE_KEY);
        },

        updateProfileComplete: (state, action: PayloadAction<boolean>) => {
            state.profileComplete = action.payload;

            // Update storage
            const current = secureStorage.getItem(AUTH_STORAGE_KEY);
            if (current) {
                secureStorage.setItem(AUTH_STORAGE_KEY, {
                    ...current,
                    profileComplete: action.payload,
                });
            }
        },
    },
});

export const { setCredentials, logout, updateProfileComplete } = authSlice.actions;
export default authSlice.reducer;