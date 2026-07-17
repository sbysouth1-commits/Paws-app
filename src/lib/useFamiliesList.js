import { useCallback, useState } from 'react';
import { supabase } from './supabase';

// Loads families joined with their child. Row-level security scopes the
// result to whoever's asking: an admin sees every onboarded family, a
// therapist sees only the families whose child is assigned to them — same
// query, different rows, no client-side filtering needed. Shared by
// AdminScreen and TherapistHomeScreen.
export function useFamiliesList() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [famRes, kidsRes] = await Promise.all([
      supabase.from('families').select('id, email, parent_name'),
      supabase.from('children').select('id, family_id, name, age, therapist_id'),
    ]);
    const kidsByFamily = new Map((kidsRes.data ?? []).map((k) => [k.family_id, k]));
    const rows = (famRes.data ?? [])
      .map((f) => ({ ...f, child: kidsByFamily.get(f.id) ?? null }))
      .filter((f) => f.child); // only families that finished onboarding
    setFamilies(rows);
    setLoading(false);
  }, []);

  return { families, loading, reload: load };
}
