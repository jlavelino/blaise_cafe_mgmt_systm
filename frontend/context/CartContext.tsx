"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, ProductVariant, CartItem } from "@/types";

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, variant: ProductVariant) => void;
  updateQuantity: (variantId: string, delta: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType>({
  items: [],
  itemCount: 0,
  subtotal: 0,
  addItem: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
  isCartOpen: false,
  setIsCartOpen: () => {}
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load from sessionStorage if available
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("blaise_active_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem("blaise_active_cart", JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  }, [items]);

  const addItem = (product: Product, variant: ProductVariant) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.variantId === variant.id);
      const priceNum = Number(variant.price);

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + 1
        };
        return next;
      }

      return [
        ...prev,
        {
          variantId: variant.id,
          productId: product.id,
          productName: product.name,
          size: variant.size,
          unitPrice: priceNum,
          quantity: 1
        }
      ];
    });
  };

  const updateQuantity = (variantId: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.variantId === variantId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeItem = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
