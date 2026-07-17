import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { family } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

// Loads the family's parent name + child profile (one child in V1). With
// Supabase configured, reads/writes the `families` and `children` tables;
// otherwise serves the mock family so the app works with no backend.
const ChildContext = createContext(null);

const mockChild = {
  id: 'mock-child',
  name: family.childName,
  age: family.childAge,
};

function childFromRow(row) {
  return { id: row.id, name: row.name, age: row.age };
}

export function ChildProvider({ children }) {
  const { user } = useAuth();
  const [child, setChild] = useState(isSupabaseConfigured ? null : mockChild);
  const [parentName, setParentName] = useState(isSupabaseConfigured ? null : family.parentName);
  const [role, setRole] = useState('family');
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !user) return;
    let active = true;
    setLoading(true);
    Promise.all([
      supabase.from('families').select('parent_name, role').eq('id', user.id).maybeSingle(),
      supabase
        .from('children')
        .select('*')
        .eq('family_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1),
    ]).then(([fam, kids]) => {
      if (!active) return;
      setParentName(fam.data?.parent_name ?? null);
      setRole(fam.data?.role ?? 'family');
      setChild(kids.data && kids.data[0] ? childFromRow(kids.data[0]) : null);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user]);

  const isAdmin = role === 'admin';
  const isTherapist = role === 'therapist';

  const value = useMemo(
    () => ({
      child,
      parentName,
      childName: child?.name ?? family.childName,
      childAge: child?.age ?? family.childAge,
      // Therapist name isn't stored on the child; screens that show private
      // content derive it from that content. Null here means "unknown yet".
      therapistName: isSupabaseConfigured ? null : family.therapistName,
      role,
      isAdmin,
      isTherapist,
      isStaff: isAdmin || isTherapist,
      loading,
      // Onboard until we have both a parent name and a child — except
      // therapist accounts, which are pure staff with no family/child of
      // their own and go straight into their therapist view instead.
      needsOnboarding: isSupabaseConfigured && !loading && !isTherapist && (!child || !parentName),
      // Saves the parent name and creates/updates the child in one step.
      saveProfile: async ({ parentName: newParentName, childName: newChildName, childAge: newChildAge }) => {
        if (!isSupabaseConfigured || !user) return { error: 'Not signed in.' };

        const { error: famError } = await supabase
          .from('families')
          .update({ parent_name: newParentName })
          .eq('id', user.id);
        if (famError) return { error: famError.message };

        let savedChild;
        if (child) {
          const { data, error } = await supabase
            .from('children')
            .update({ name: newChildName, age: newChildAge })
            .eq('id', child.id)
            .select()
            .single();
          if (error) return { error: error.message };
          savedChild = data;
        } else {
          const { data, error } = await supabase
            .from('children')
            .insert({ family_id: user.id, name: newChildName, age: newChildAge })
            .select()
            .single();
          if (error) return { error: error.message };
          savedChild = data;
        }

        setParentName(newParentName);
        setChild(childFromRow(savedChild));
        return {};
      },
    }),
    [child, parentName, role, isAdmin, isTherapist, loading, user]
  );

  return <ChildContext.Provider value={value}>{children}</ChildContext.Provider>;
}

export function useChild() {
  return useContext(ChildContext);
}
