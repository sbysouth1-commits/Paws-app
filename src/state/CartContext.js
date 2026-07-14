import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { RESOURCES } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useResources } from './ResourcesContext';

// Cart (always in-memory) + purchases. With Supabase configured, checkout opens
// a Stripe Checkout session (created server-side by an Edge Function) in the
// browser; the purchase itself is only ever written by the stripe-webhook Edge
// Function once Stripe confirms the payment actually went through — the app
// never inserts a purchase row directly, and can't grant itself one for free.
// With no Supabase keys, it's local mock state seeded with one owned resource.
const CartContext = createContext(null);

const initialOwnedIds = isSupabaseConfigured ? [] : [RESOURCES[3].id];

export function CartProvider({ children }) {
  const { user } = useAuth();
  const { resources } = useResources();
  const [cart, setCart] = useState([]);
  const [ownedIds, setOwnedIds] = useState(initialOwnedIds);

  const fetchOwnedIds = useCallback(async () => {
    if (!isSupabaseConfigured || !user) return new Set(ownedIds);
    const { data, error } = await supabase.from('purchases').select('resource_id');
    if (error || !data) return new Set(ownedIds);
    const next = data.map((row) => row.resource_id);
    setOwnedIds(next);
    return new Set(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

      // Returns { error } on failure, or { allPaid } once resolved: true if
      // everything in the cart is now owned, false if some items still need
      // another attempt (payment failed/cancelled).
      checkout: async () => {
        const unpaid = cart.filter((c) => !owned.has(c.id));
        if (unpaid.length === 0) {
          setCart([]);
          return { allPaid: true };
        }

        if (!isSupabaseConfigured) {
          // Mock mode: no payment backend, "buy" instantly for the demo.
          setOwnedIds((prev) => [...new Set([...prev, ...cart.map((c) => c.id)])]);
          setCart([]);
          return { allPaid: true };
        }

        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
          body: { resourceIds: unpaid.map((c) => c.id) },
        });
        if (error) return { error: error.message ?? 'Could not start checkout.' };
        if (!data?.url) return { error: data?.error ?? 'Checkout is not set up yet.' };

        await WebBrowser.openBrowserAsync(data.url);

        // The webhook records the purchase a moment after Stripe confirms
        // payment, which can lag slightly behind the browser closing.
        let freshOwned = await fetchOwnedIds();
        if (unpaid.some((c) => !freshOwned.has(c.id))) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          freshOwned = await fetchOwnedIds();
        }

        const stillUnpaid = unpaid.filter((c) => !freshOwned.has(c.id));
        setCart((prev) => prev.filter((c) => stillUnpaid.some((u) => u.id === c.id)));
        return { allPaid: stillUnpaid.length === 0 };
      },
    };
  }, [cart, ownedIds, resources, fetchOwnedIds]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
