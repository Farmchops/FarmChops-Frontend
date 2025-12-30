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
import { dealsApi } from './api/dealsApi';
import { vendorsApi } from './api/vendorsApi';
import { groupOrdersApi } from './api/groupOrdersApi';
import { adminDashboardApi } from './api/adminDashboardApi';
import { walletApi } from './api/walletApi';
import { paylaterApi } from './api/paylaterApi';
import { marketersApi } from './api/marketersApi';
import { couponsApi } from './api/couponsApi';
import { discountsApi } from './api/discountsApi';
import { usersApi } from './api/usersApi';

// Middleware
import { authErrorMiddleware } from './middleware/authErrorMiddleware';


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
    [adminRidersApi.reducerPath]: adminRidersApi.reducer,
    [dealsApi.reducerPath]: dealsApi.reducer,
        [vendorsApi.reducerPath]: vendorsApi.reducer,
        [groupOrdersApi.reducerPath]: groupOrdersApi.reducer,
        [adminDashboardApi.reducerPath]: adminDashboardApi.reducer,
        [walletApi.reducerPath]: walletApi.reducer,
        [paylaterApi.reducerPath]: paylaterApi.reducer,
        [marketersApi.reducerPath]: marketersApi.reducer,
        [couponsApi.reducerPath]: couponsApi.reducer,
        [discountsApi.reducerPath]: discountsApi.reducer,
        [usersApi.reducerPath]: usersApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authErrorMiddleware,
            authApi.middleware,
            adminAuthApi.middleware,
            adminManagementApi.middleware,
            productApi.middleware,
            categoryApi.middleware,
            cartApi.middleware,
            orderApi.middleware,
            adminOrdersApi.middleware,
            riderOrdersApi.middleware,
            adminRidersApi.middleware,
            dealsApi.middleware,
            vendorsApi.middleware,
            groupOrdersApi.middleware,
            adminDashboardApi.middleware,
            walletApi.middleware,
            paylaterApi.middleware,
            marketersApi.middleware,
            couponsApi.middleware,
            discountsApi.middleware,
            usersApi.middleware,
        ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;