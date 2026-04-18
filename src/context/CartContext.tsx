'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; size: string; color: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; size: string; color: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

function calcTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(
        (i) => i.productId === action.payload.productId && i.size === action.payload.size && i.color === action.payload.color
      );
      let items: CartItem[];
      if (existing) {
        items = state.items.map((i) =>
          i.productId === action.payload.productId && i.size === action.payload.size && i.color === action.payload.color
            ? { ...i, quantity: i.quantity + action.payload.quantity }
            : i
        );
      } else {
        items = [...state.items, action.payload];
      }
      return { items, total: calcTotal(items) };
    }
    case 'REMOVE_ITEM': {
      const items = state.items.filter(
        (i) => !(i.productId === action.payload.productId && i.size === action.payload.size && i.color === action.payload.color)
      );
      return { items, total: calcTotal(items) };
    }
    case 'UPDATE_QUANTITY': {
      const items = state.items.map((i) =>
        i.productId === action.payload.productId && i.size === action.payload.size && i.color === action.payload.color
          ? { ...i, quantity: Math.max(1, action.payload.quantity) }
          : i
      );
      return { items, total: calcTotal(items) };
    }
    case 'CLEAR_CART':
      return { items: [], total: 0 };
    case 'LOAD_CART':
      return { items: action.payload, total: calcTotal(action.payload) };
    default:
      return state;
  }
}

interface CartContextType extends CartState {
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('zeuer-cart');
    if (saved) {
      try {
        const items = JSON.parse(saved);
        dispatch({ type: 'LOAD_CART', payload: items });
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('zeuer-cart', JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (item: CartItem) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (productId: string, size: string, color: string) =>
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, size, color } });
  const updateQuantity = (productId: string, size: string, color: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, size, color, quantity } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ ...state, addItem, removeItem, updateQuantity, clearCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
