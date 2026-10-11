import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Award, CalendarDays, Download, Pill, Plus, ChevronRight } from 'lucide-react-native';
import { CATEGORY_META, colors, fonts } from '../theme/colors';
import { THERAPIST_RESOURCES, SUCCESS_STORIES, family } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { openStorageFile } from '../lib/fileAccess';
import { useMedications } from '../lib/useMedications';
import { getMedicationStatus, formatTime } from '../lib/medicationStatus';
import { registerPushToken } from '../lib/pushTokens';
import { useAuth } from '../state/AuthContext';
import { useChild } from '../state/ChildContext';
import ScreenHeader from '../components/ScreenHeader';
import PawIcon from '../components/PawIcon';

// "For [Child]" (prototype TherapistScreen): private resources the therapist
// has dropped for this child, plus their success stories. Read-only for
// families — content is added by the therapist via the Supabase table editor.

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Format an ISO timestamp as "3 July 2026" without relying on Intl (Hermes).
function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function TherapistResourceCard({ resource }) {
  const meta = CATEGORY_META[resource.category] ?? CATEGORY_META.Behaviour;
  const [opening, setOpening] = useState(false);
  const [openError, setOpenError] = useState(null);

  const handleOpen = async () => {
    setOpenError(null);
    setOpening(true);
    const { error } = await openStorageFile('therapist-files', resource.fileUrl);
    setOpening(false);
    if (error) setOpenError(error);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.tile, { backgroundColor: meta.color + '1A' }]}>
          <PawIcon size={18} color={meta.color} />
        </View>
        <View style={styles.cardHead}>
          <Text style={styles.cardTitle}>{resource.title}</Text>
          <Text style={styles.cardMeta}>
            From {resource.from} · {resource.date}
          </Text>
        </View>
      </View>
      <Text style={styles.note}>{resource.note}</Text>
      <Pressable
        onPress={handleOpen}
        disabled={opening}
        style={({ pressed }) => [styles.openButton, (pressed || opening) && styles.pressed]}
      >
        {opening ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <>
            <Download size={13} color={colors.white} />
            <Text style={styles.openButtonText}>Open resource</Text>
          </>
        )}
      </Pressable>
      {openError ? <Text style={styles.openErrorText}>{openError}</Text> : null}
    </View>
  );
}

function SuccessStoryCard({ story }) {
  return (
    <View style={[styles.card, styles.storyCard]}>
      <View style={styles.cardTop}>
        <View style={[styles.tile, styles.storyTile]}>
          <Award size={20} color={colors.gold} />
        </View>
        <View style={styles.cardHead}>
          <Text style={styles.cardTitle}>{story.title}</Text>
          <View style={styles.dateRow}>
            <CalendarDays size={12} color={colors.inkSoft} />
            <Text style={styles.cardMeta}>
              {story.date} · {story.from}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.storyText}>{story.story}</Text>
    </View>
  );
}

const STATUS_TONE_STYLE = {
  overdue: { backgroundColor: '#B3261E1A', color: '#B3261E' },
  upcoming: { backgroundColor: colors.sageLight, color: colors.sage },
  done: { backgroundColor: colors.line, color: colors.inkSoft },
  none: { backgroundColor: colors.line, color: colors.inkSoft },
};

function MedicationCard({ medication, onPress, onLogDose, logging }) {
  const status = getMedicationStatus(medication, medication.logsToday);
  const tone = STATUS_TONE_STYLE[status.tone] ?? STATUS_TONE_STYLE.none;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.cardTop}>
        <View style={[styles.tile, { backgroundColor: colors.sageLight }]}>
          <Pill size={18} color={colors.ink} />
        </View>
        <View style={styles.cardHead}>
          <Text style={styles.cardTitle}>{medication.name}</Text>
          <Text style={styles.cardMeta}>
            {medication.dosage ? `${medication.dosage} · ` : ''}
            {(medication.times ?? []).map(formatTime).join(', ') || 'No times set'}
          </Text>
        </View>
        <ChevronRight size={16} color={colors.inkSoft} />
      </View>
      <View style={styles.medicationRow}>
        <View style={[styles.statusBadge, { backgroundColor: tone.backgroundColor }]}>
          <Text style={[styles.statusBadgeText, { color: tone.color }]}>{status.label}</Text>
        </View>
        {status.tone !== 'done' && status.tone !== 'none' ? (
          <Pressable
            onPress={onLogDose}
            disabled={logging}
            style={({ pressed }) => [styles.logButton, (pressed || logging) && styles.pressed]}
          >
            {logging ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.logButtonText}>Log dose</Text>
            )}
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function ForChildScreen({ navigation }) {
  const { child, childName } = useChild();
  const { user } = useAuth();
  const [tab, setTab] = useState('resources');
  const [resources, setResources] = useState(isSupabaseConfigured ? [] : THERAPIST_RESOURCES);
  const [stories, setStories] = useState(isSupabaseConfigured ? [] : SUCCESS_STORIES);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const { medications, loading: medicationsLoading, reload: reloadMedications } = useMedications(child?.id);
  const [loggingId, setLoggingId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      reloadMedications();
    }, [reloadMedications])
  );

  // Register this device for medication reminder push notifications — sent
  // server-side by the cron job in schema.sql, so every device a family has
  // registered gets the same reminder, and it's skipped once anyone logs the
  // dose (see "Medications and reminders" in the README).
  useEffect(() => {
    if (!user?.id) return;
    registerPushToken(user.id);
  }, [user?.id]);

  const handleLogDose = async (medication) => {
    setLoggingId(medication.id);
    await supabase.from('medication_logs').insert({ medication_id: medication.id, status: 'given' });
    await reloadMedications();
    setLoggingId(null);
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !child?.id) return;
    let active = true;
    setLoading(true);
    Promise.all([
      supabase
        .from('therapist_resources')
        .select('*')
        .eq('child_id', child.id)
        .order('shared_at', { ascending: false }),
      supabase
        .from('success_stories')
        .select('*')
        .eq('child_id', child.id)
        .order('occurred_at', { ascending: false }),
    ]).then(([res, sto]) => {
      if (!active) return;
      setResources(
        (res.data ?? []).map((r) => ({
          id: r.id,
          title: r.title,
          category: r.category,
          note: r.note,
          from: r.therapist_name,
          date: formatDate(r.shared_at),
          fileUrl: r.file_url,
        }))
      );
      setStories(
        (sto.data ?? []).map((s) => ({
          id: s.id,
          title: s.title,
          story: s.story,
          from: s.therapist_name,
          date: formatDate(s.occurred_at),
        }))
      );
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [child?.id]);

  // Therapist name for the tab label / intro — derived from the loaded content.
  const therapistName =
    resources[0]?.from || stories[0]?.from || (isSupabaseConfigured ? 'your therapist' : family.therapistName);

  const tabs = [
    { key: 'resources', label: `From ${therapistName}` },
    { key: 'stories', label: 'Success Stories' },
    { key: 'medications', label: 'Medications' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={`For ${childName}`}
        right={
          tab === 'medications' ? (
            <Pressable
              onPress={() => navigation.navigate('MedicationForm', { childId: child?.id })}
              style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
            >
              <Plus size={18} color={colors.white} />
            </Pressable>
          ) : null
        }
      />

      <View style={styles.segmentWrap}>
        <View style={styles.segment}>
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                style={[styles.segmentButton, active && styles.segmentButtonActive]}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]} numberOfLines={1}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {tab === 'resources' ? (
          loading ? (
            <ActivityIndicator color={colors.ink} style={styles.loader} />
          ) : (
            <>
              <Text style={styles.intro}>
                Resources {therapistName} has shared just for {childName} — these aren't in the
                general library.
              </Text>
              {resources.length === 0 ? (
                <Text style={styles.empty}>Nothing shared yet — check back soon.</Text>
              ) : (
                resources.map((r) => <TherapistResourceCard key={r.id} resource={r} />)
              )}
            </>
          )
        ) : tab === 'stories' ? (
          loading ? (
            <ActivityIndicator color={colors.ink} style={styles.loader} />
          ) : (
            <>
              <Text style={styles.intro}>
                Wins and milestones {therapistName} has noted for {childName} along the way.
              </Text>
              {stories.length === 0 ? (
                <Text style={styles.empty}>No stories yet — they'll appear here.</Text>
              ) : (
                stories.map((s) => <SuccessStoryCard key={s.id} story={s} />)
              )}
            </>
          )
        ) : medicationsLoading ? (
          <ActivityIndicator color={colors.ink} style={styles.loader} />
        ) : (
          <>
            <Text style={styles.intro}>
              {childName}'s medications, with reminders at each scheduled dose time.
            </Text>
            {medications.length === 0 ? (
              <Text style={styles.empty}>No medications added yet — tap + to add one.</Text>
            ) : (
              medications.map((m) => (
                <MedicationCard
                  key={m.id}
                  medication={m}
                  logging={loggingId === m.id}
                  onPress={() => navigation.navigate('MedicationDetail', { medicationId: m.id, childName })}
                  onLogDose={() => handleLogDose(m)}
                />
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  pressed: { opacity: 0.9 },
  loader: { marginTop: 40 },
  empty: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft, marginTop: 8 },

  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },

  medicationRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  statusBadgeText: { fontFamily: fonts.bodySemiBold, fontSize: 12 },
  logButton: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: colors.ink,
  },
  logButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.white },

  segmentWrap: { paddingHorizontal: 20, marginBottom: 16 },
  segment: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 4,
    backgroundColor: colors.sageLight,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 999,
  },
  segmentButtonActive: { backgroundColor: colors.white },
  segmentText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.inkSoft },
  segmentTextActive: { color: colors.ink },

  intro: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.inkSoft },

  card: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  tile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHead: { flex: 1, minWidth: 0 },
  cardTitle: { fontFamily: fonts.heading, fontSize: 15, lineHeight: 20, color: colors.ink },
  cardMeta: { marginTop: 2, fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },

  note: {
    marginTop: 10,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkSoft,
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 12,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: colors.ink,
  },
  openButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.white },
  openErrorText: {
    marginTop: 8,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: '#B3261E',
  },

  storyCard: { backgroundColor: colors.sageLight },
  storyTile: { backgroundColor: colors.white },
  storyText: {
    marginTop: 10,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.ink,
  },
});
