// src/redux/features/cart/cartSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";


export interface CartItem {
    id: string;
    name: string;
    image: string;
    price: number;
    unit: string;
    quantity: number;
    quantityType: "retail" | "bulk";
    bulkName?: string; // e.g. "Half Basket"
}

interface CartState {
    items: CartItem[];
}

const initialState: CartState = {
    items: [],
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addItem: (state, action: PayloadAction<CartItem>) => {
            const item = action.payload;
            const existing = state.items.find(
                (i) => i.id === item.id && i.quantityType === item.quantityType
            );

            if (existing) {
                existing.quantity += item.quantity;
            } else {
                state.items.push(item);
            }
        },

        removeItem: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
        },

        updateQuantity: (
            state,
            action: PayloadAction<{ id: string; quantityType: "retail" | "bulk"; quantity: number }>
        ) => {
            const { id, quantityType, quantity } = action.payload;
            const item = state.items.find((i) => i.id === id && i.quantityType === quantityType);
            if (item) item.quantity = quantity;
        },

        clearCart: (state) => {
            state.items = [];
        },
    },
});

export const { addItem, removeItem, updateQuantity, clearCart } =
    cartSlice.actions;

export const selectCartItems = (state: RootState) => state.cart.items;

export default cartSlice.reducer;