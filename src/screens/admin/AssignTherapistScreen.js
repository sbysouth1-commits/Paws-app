import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { colors, fonts } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import ScreenHeader from '../../components/ScreenHeader';

// Pick which therapist (or nobody) a child is assigned to. Admin-only,
// reached from FamilyDetail.
export default function AssignTherapistScreen({ route, navigation }) {
  const { childId, childName, currentTherapistId } = route.params;
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null); // 'unassigned' or a therapist id
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase
      .from('families')
      .select('id, email, parent_name')
      .eq('role', 'therapist')
      .then(({ data }) => {
        setTherapists(data ?? []);
        setLoading(false);
      });
  }, []);

  const assign = async (therapistId) => {
    setError(null);
    setSavingId(therapistId ?? 'unassigned');
    const { error: saveError } = await supabase
      .from('children')
      .update({ therapist_id: therapistId })
      .eq('id', childId);
    setSavingId(null);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    navigation.goBack();
  };

  const options = [{ id: null, label: 'Unassigned' }, ...therapists.map((t) => ({ id: t.id, label: t.parent_name || t.email }))];

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScreenHeader title="Assign therapist" subtitle={`For ${childName}`} />
      {loading ? (
        <ActivityIndicator color={colors.ink} style={styles.loader} />
      ) : (
        <FlatList
          data={options}
          keyExtractor={(item) => item.id ?? 'unassigned'}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const active = (item.id ?? null) === (currentTherapistId ?? null);
            const busy = savingId === (item.id ?? 'unassigned');
            return (
              <Pressable
                onPress={() => assign(item.id)}
                disabled={savingId !== null}
                style={({ pressed }) => [styles.row, (pressed || busy) && styles.pressed]}
              >
                <Text style={styles.rowLabel}>{item.label}</Text>
                {busy ? (
                  <ActivityIndicator color={colors.ink} size="small" />
                ) : active ? (
                  <Check size={18} color={colors.clay} />
                ) : null}
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No therapist accounts yet — promote one from Admin → Team first.
            </Text>
          }
        />
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  pressed: { opacity: 0.7 },
  loader: { marginTop: 40 },

  list: { paddingHorizontal: 20, paddingBottom: 24, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  rowLabel: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink },
  empty: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  error: {
    marginHorizontal: 20,
    marginTop: 8,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: '#B3261E',
    textAlign: 'center',
  },
});
