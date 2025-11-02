// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Reducers
import authReducer from './features/auth/authSlice';
import adminAuthReducer from './features/auth/adminAuthSlice';
import cartReducer from './features/cart/cartSlice';

// APIs
import { authApi } from './api/authApi';
import { adminAuthApi } from './api/adminAuthApi';
import { adminManagementApi } from './api/adminManagementApi';
import { productApi } from './api/productApi';
import { categoryApi } from './api/categoryApi';
import { cartApi } from './api/cartApi';
import { orderApi } from './api/orderApi';
import { adminOrdersApi } from './api/adminOrdersApi';
import { riderOrdersApi } from './api/riderOrdersApi';
import { adminRidersApi } from './api/adminRidersApi';


export const store = configureStore({
    reducer: {
        // Auth
        auth: authReducer,
        adminAuth: adminAuthReducer,

        // Features
        cart: cartReducer,

        // API Reducers
        [authApi.reducerPath]: authApi.reducer,
        [adminAuthApi.reducerPath]: adminAuthApi.reducer,
        [adminManagementApi.reducerPath]: adminManagementApi.reducer,
        [productApi.reducerPath]: productApi.reducer,
        [categoryApi.reducerPath]: categoryApi.reducer,
        [cartApi.reducerPath]: cartApi.reducer,
                [orderApi.reducerPath]: orderApi.reducer,
        [adminOrdersApi.reducerPath]: adminOrdersApi.reducer,
    [riderOrdersApi.reducerPath]: riderOrdersApi.reducer,
    [adminRidersApi.reducerPath]: adminRidersApi.reducer

    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authApi.middleware,
            adminAuthApi.middleware,
            adminManagementApi.middleware,
            productApi.middleware,
            categoryApi.middleware,
            cartApi.middleware,
            orderApi.middleware,
            adminOrdersApi.middleware,
            riderOrdersApi.middleware,
            adminRidersApi.middleware

        ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;