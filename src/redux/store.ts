import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./features/cartSlice";

export const store = configureStore({
    reducer: {
        cart: cartReducer,
    },
});

// Infer the types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
