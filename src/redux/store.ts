// // // src/store/index.ts (Updated with Product & Category APIs)
// import { configureStore } from '@reduxjs/toolkit';
// import { authApi } from './api/authApi';
// import { productApi } from './api/productApi';
// import { categoryApi } from './api/categoryApi';
// import authReducer from '../redux/features/auth/authSlice';
// import cartReducer from '../redux/features/cart/cartSlice';

// import { adminAuthApi } from './api/adminAuthApi';
// import { adminManagementApi } from './api/adminManagementApi';

// export const store = configureStore({
//     reducer: {
//         auth: authReducer,
//         cart: cartReducer,
//         [authApi.reducerPath]: authApi.reducer,
//         [productApi.reducerPath]: productApi.reducer,
//         [categoryApi.reducerPath]: categoryApi.reducer,
//         [adminAuthApi.reducerPath]: adminAuthApi.reducer,
//         [adminManagementApi.reducerPath]: adminManagementApi.reducer,
//     },
//     middleware: (getDefaultMiddleware) =>
//         getDefaultMiddleware()
//             .concat(authApi.middleware)
//             .concat(productApi.middleware)
//             .concat(categoryApi.middleware)
//             .concat(adminAuthApi.middleware)
//             .concat(adminManagementApi.middleware)

// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;



// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Reducers
import authReducer from './features/auth/authSlice';
import adminAuthReducer from './features/auth/adminAuthSlice';
import cartReducer from './features/cart/cartSlice'; // Add your cart slice import

// APIs
import { authApi } from './api/authApi';
import { adminAuthApi } from './api/adminAuthApi';
import { adminManagementApi } from './api/adminManagementApi';
import { productApi } from './api/productApi';
import { categoryApi } from './api/categoryApi';

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
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authApi.middleware,
            adminAuthApi.middleware,
            adminManagementApi.middleware,
            productApi.middleware,
            categoryApi.middleware
        ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;