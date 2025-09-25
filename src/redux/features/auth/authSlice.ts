// src/store/slices/authSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type AuthState, type User } from '../../../types/auth';

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    profileComplete: false,
};

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
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.profileComplete = false;
        },
        updateProfileComplete: (state, action: PayloadAction<boolean>) => {
            state.profileComplete = action.payload;
        },
    },
});

export const { setCredentials, logout, updateProfileComplete } = authSlice.actions;
export default authSlice.reducer;
