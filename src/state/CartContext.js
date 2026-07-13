import React, { createContext, useContext, useMemo, useState } from 'react';
import { RESOURCES } from '../data/mockData';
import { isSupabaseConfigured } from '../lib/supabase';

// Mock cart + purchases, matching the prototype's app-shell state. Swap for
// Supabase `purchases` + Stripe checkout in a later build pass.
const CartContext = createContext(null);

// In mock mode, seed one owned resource so Profile/Kid Mode have something to
// show. With Supabase on, purchases start empty (they'll come from the DB next).
const initialPurchases = isSupabaseConfigured ? [] : [RESOURCES[3]];

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [purchases, setPurchases] = useState(initialPurchases);

  const value = useMemo(() => {
    const isOwned = (id) => purchases.some((p) => p.id === id);
    return {
      cart,
      purchases,
      isOwned,
      inCart: (id) => cart.some((c) => c.id === id),
      addToCart: (r) => setCart((prev) => (prev.some((c) => c.id === r.id) ? prev : [...prev, r])),
      removeFromCart: (id) => setCart((prev) => prev.filter((c) => c.id !== id)),
      checkout: () => {
        setPurchases((prev) => [...prev, ...cart.filter((c) => !prev.some((p) => p.id === c.id))]);
        setCart([]);
      },
    };
  }, [cart, purchases]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
