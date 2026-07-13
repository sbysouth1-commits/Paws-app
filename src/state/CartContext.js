import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { RESOURCES } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useResources } from './ResourcesContext';

// Cart (always in-memory) + purchases. With Supabase configured, owned resources
// come from and are written to the `purchases` table; otherwise it's local mock
// state seeded with one owned resource for the demo.
const CartContext = createContext(null);

// Owned resources are tracked as a list of resource ids; the full resource
// objects are derived from the catalogue, so display works the same in both modes.
const initialOwnedIds = isSupabaseConfigured ? [] : [RESOURCES[3].id];

export function CartProvider({ children }) {
  const { user } = useAuth();
  const { resources } = useResources();
  const [cart, setCart] = useState([]);
  const [ownedIds, setOwnedIds] = useState(initialOwnedIds);

  // Load the family's purchases once we have a logged-in user.
  useEffect(() => {
    if (!isSupabaseConfigured || !user) return;
    let active = true;
    supabase
      .from('purchases')
      .select('resource_id')
      .then(({ data, error }) => {
        if (active && !error && data) setOwnedIds(data.map((row) => row.resource_id));
      });
    return () => {
      active = false;
    };
  }, [user]);

  const value = useMemo(() => {
    const owned = new Set(ownedIds);
    // Resolve owned ids to full resources from the catalogue.
    const purchases = resources.filter((r) => owned.has(r.id));

    return {
      cart,
      purchases,
      isOwned: (id) => owned.has(id),
      inCart: (id) => cart.some((c) => c.id === id),
      addToCart: (r) => setCart((prev) => (prev.some((c) => c.id === r.id) ? prev : [...prev, r])),
      removeFromCart: (id) => setCart((prev) => prev.filter((c) => c.id !== id)),
      // Returns { error } so the Cart screen can show a failure. Resolves to {} on success.
      checkout: async () => {
        const newItems = cart.filter((c) => !owned.has(c.id));

        if (isSupabaseConfigured && user && newItems.length) {
          const rows = newItems.map((c) => ({ family_id: user.id, resource_id: c.id }));
          const { error } = await supabase.from('purchases').insert(rows);
          if (error) return { error: error.message };
        }

        setOwnedIds((prev) => [...new Set([...prev, ...cart.map((c) => c.id)])]);
        setCart([]);
        return {};
      },
    };
  }, [cart, ownedIds, resources, user]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
