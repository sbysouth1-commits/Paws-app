import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { CheckCircle2, XCircle } from 'lucide-react-native';
import { colors, fonts } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { formatTime } from '../lib/medicationStatus';
import ScreenHeader from '../components/ScreenHeader';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatLogTime(iso) {
  const d = new Date(iso);
  const hour = d.getHours();
  const minute = String(d.getMinutes()).padStart(2, '0');
  const period = hour >= 12 ? 'pm' : 'am';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} · ${hour12}:${minute}${period}`;
}

// One medication's full detail: dose times, log history, quick log actions,
// edit, and deactivate/delete. Reached from ForChildScreen's Medications tab.
export default function MedicationDetailScreen({ route, navigation }) {
  const { medicationId, childName } = route.params;
  const [medication, setMedication] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [medRes, logsRes] = await Promise.all([
      supabase.from('medications').select('*').eq('id', medicationId).maybeSingle(),
      supabase
        .from('medication_logs')
        .select('*')
        .eq('medication_id', medicationId)
        .order('taken_at', { ascending: false })
        .limit(30),
    ]);
    setMedication(medRes.data ?? null);
    setLogs(logsRes.data ?? []);
    setLoading(false);
  }, [medicationId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const logDose = async (status) => {
    setLogging(true);
    await supabase.from('medication_logs').insert({ medication_id: medicationId, status });
    await load();
    setLogging(false);
  };

  const toggleActive = async () => {
    await supabase.from('medications').update({ active: !medication.active }).eq('id', medicationId);
    load();
  };

  const confirmDelete = () => {
    Alert.alert(
      `Delete ${medication.name}?`,
      'This removes the medication and its whole dose history. This can\'t be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('medications').delete().eq('id', medicationId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (loading || !medication) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ActivityIndicator color={colors.ink} style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScreenHeader title={medication.name} subtitle={`For ${childName}`} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          {medication.dosage ? <Text style={styles.summaryLine}>Dosage: {medication.dosage}</Text> : null}
          <Text style={styles.summaryLine}>
            Times: {(medication.times ?? []).map(formatTime).join(', ') || 'None set'}
          </Text>
          {medication.instructions ? (
            <Text style={styles.summaryLine}>Instructions: {medication.instructions}</Text>
          ) : null}
          {!medication.active ? <Text style={styles.inactiveNote}>Inactive — no reminders firing</Text> : null}
        </View>

        <View style={styles.actionRow}>
          <Pressable
            onPress={() => logDose('given')}
            disabled={logging}
            style={({ pressed }) => [styles.actionButton, styles.givenButton, (pressed || logging) && styles.pressed]}
          >
            {logging ? <ActivityIndicator color={colors.white} size="small" /> : <Text style={styles.givenButtonText}>Log dose given</Text>}
          </Pressable>
          <Pressable
            onPress={() => logDose('skipped')}
            disabled={logging}
            style={({ pressed }) => [styles.actionButton, styles.skippedButton, (pressed || logging) && styles.pressed]}
          >
            <Text style={styles.skippedButtonText}>Log skipped</Text>
          </Pressable>
        </View>

        <View style={styles.manageRow}>
          <Pressable
            onPress={() => navigation.navigate('MedicationForm', { medication })}
            style={({ pressed }) => [styles.manageButton, pressed && styles.pressed]}
          >
            <Text style={styles.manageButtonText}>Edit</Text>
          </Pressable>
          <Pressable
            onPress={toggleActive}
            style={({ pressed }) => [styles.manageButton, pressed && styles.pressed]}
          >
            <Text style={styles.manageButtonText}>{medication.active ? 'Deactivate' : 'Reactivate'}</Text>
          </Pressable>
          <Pressable
            onPress={confirmDelete}
            style={({ pressed }) => [styles.manageButton, styles.deleteButton, pressed && styles.pressed]}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </Pressable>
        </View>

        <Text style={styles.historyTitle}>History</Text>
        {logs.length === 0 ? (
          <Text style={styles.empty}>No doses logged yet.</Text>
        ) : (
          logs.map((l) => (
            <View key={l.id} style={styles.logRow}>
              {l.status === 'given' ? (
                <CheckCircle2 size={16} color={colors.sage} />
              ) : (
                <XCircle size={16} color={colors.rose} />
              )}
              <Text style={styles.logText}>
                {l.status === 'given' ? 'Given' : 'Skipped'} · {formatLogTime(l.taken_at)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },
  pressed: { opacity: 0.85 },
  loader: { marginTop: 40 },
  empty: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft },

  summaryCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 4,
  },
  summaryLine: { fontFamily: fonts.body, fontSize: 13, color: colors.ink },
  inactiveNote: { marginTop: 4, fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.inkSoft },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  actionButton: { flex: 1, borderRadius: 999, paddingVertical: 13, alignItems: 'center' },
  givenButton: { backgroundColor: colors.ink },
  givenButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.white },
  skippedButton: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  skippedButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.inkSoft },

  manageRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  manageButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.sageLight,
  },
  manageButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.ink },
  deleteButton: { backgroundColor: '#B3261E1A' },
  deleteButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: '#B3261E' },

  historyTitle: { marginTop: 24, marginBottom: 10, fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.ink },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  logText: { fontFamily: fonts.body, fontSize: 13, color: colors.ink },
});
