import { useCallback, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { isToday } from './medicationStatus';

// Loads a child's medications plus their recent dose logs (enough to work
// out "given today" per medication client-side — see medicationStatus.js).
export function useMedications(childId) {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const reload = useCallback(async () => {
    if (!isSupabaseConfigured || !childId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('medications')
      .select('*, medication_logs(id, status, taken_at, note)')
      .eq('child_id', childId)
      .order('created_at', { ascending: true })
      .order('taken_at', { foreignTable: 'medication_logs', ascending: false });

    setMedications(
      (data ?? []).map((row) => ({
        ...row,
        logs: row.medication_logs ?? [],
        logsToday: (row.medication_logs ?? []).filter((l) => isToday(l.taken_at)),
      }))
    );
    setLoading(false);
  }, [childId]);

  return { medications, loading, reload };
}
