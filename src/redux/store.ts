// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './api/authApi';
import authReducer from '../redux/features/auth/authSlice';

import cartReducer from "./features/cart/cartSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        [authApi.reducerPath]: authApi.reducer,
        cart: cartReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;