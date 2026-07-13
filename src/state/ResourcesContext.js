import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { RESOURCES } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Loads the public resource catalogue. When Supabase is configured it reads the
// `resources` table; otherwise it serves the local mock catalogue so the app
// still works with no backend. One source of truth for Home, Library and detail.
const ResourcesContext = createContext(null);

// Map a Supabase row to the shape the screens use (age/price/blurb).
function fromRow(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    age: row.age_range,
    price: Number(row.price_aud),
    blurb: row.description,
    fileUrl: row.file_url,
    tag: row.tag,
  };
}

export function ResourcesProvider({ children }) {
  const [resources, setResources] = useState(isSupabaseConfigured ? [] : RESOURCES);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: true });
    if (fetchError) {
      setError(fetchError.message);
      setResources([]);
    } else {
      setResources((data ?? []).map(fromRow));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(
    () => ({
      resources,
      loading,
      error,
      reload: load,
      getById: (id) => resources.find((r) => r.id === id),
    }),
    [resources, loading, error, load]
  );

  return <ResourcesContext.Provider value={value}>{children}</ResourcesContext.Provider>;
}

export function useResources() {
  return useContext(ResourcesContext);
}
