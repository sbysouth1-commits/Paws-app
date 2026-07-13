import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { family } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

// Loads the family's child profile (one child in V1). With Supabase configured,
// reads/writes the `children` table; otherwise serves the mock child so the app
// works with no backend.
const ChildContext = createContext(null);

const mockChild = {
  id: 'mock-child',
  name: family.childName,
  age: family.childAge,
  focusArea: null,
};

function fromRow(row) {
  return { id: row.id, name: row.name, age: row.age, focusArea: row.focus_area };
}

export function ChildProvider({ children }) {
  const { user } = useAuth();
  const [child, setChild] = useState(isSupabaseConfigured ? null : mockChild);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !user) return;
    let active = true;
    setLoading(true);
    supabase
      .from('children')
      .select('*')
      .eq('family_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .then(({ data }) => {
        if (!active) return;
        setChild(data && data[0] ? fromRow(data[0]) : null);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const value = useMemo(
    () => ({
      child,
      childName: child?.name ?? family.childName,
      childAge: child?.age ?? family.childAge,
      // Therapist name isn't stored on the child; screens that show private
      // content derive it from that content. Null here means "unknown yet".
      therapistName: isSupabaseConfigured ? null : family.therapistName,
      loading,
      needsOnboarding: isSupabaseConfigured && !loading && !child,
      saveChild: async ({ name, age, focusArea }) => {
        if (!isSupabaseConfigured || !user) return { error: 'Not signed in.' };
        const { data, error } = await supabase
          .from('children')
          .insert({ family_id: user.id, name, age, focus_area: focusArea })
          .select()
          .single();
        if (error) return { error: error.message };
        setChild(fromRow(data));
        return {};
      },
    }),
    [child, loading, user]
  );

  return <ChildContext.Provider value={value}>{children}</ChildContext.Provider>;
}

export function useChild() {
  return useContext(ChildContext);
}
