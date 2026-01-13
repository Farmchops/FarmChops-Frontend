// src/redux/features/cart/cartSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";

const CART_STORAGE_KEY = "guestCart";

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

// Load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
        return [];
    }
};

// Save cart to localStorage
const saveCartToStorage = (items: CartItem[]) => {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
        console.error("Failed to save cart to localStorage:", error);
    }
};

const initialState: CartState = {
    items: loadCartFromStorage(),
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
            
            // Save to localStorage
            saveCartToStorage(state.items);
        },

        removeItem: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
            
            // Save to localStorage
            saveCartToStorage(state.items);
        },

        updateQuantity: (
            state,
            action: PayloadAction<{ id: string; quantityType: "retail" | "bulk"; quantity: number }>
        ) => {
            const { id, quantityType, quantity } = action.payload;
            const item = state.items.find((i) => i.id === id && i.quantityType === quantityType);
            if (item) item.quantity = quantity;
            
            // Save to localStorage
            saveCartToStorage(state.items);
        },

        clearCart: (state) => {
            state.items = [];
            
            // Clear localStorage
            localStorage.removeItem(CART_STORAGE_KEY);
        },
    },
});

export const { addItem, removeItem, updateQuantity, clearCart } =
    cartSlice.actions;

export const selectCartItems = (state: RootState) => state.cart.items;

export default cartSlice.reducer;