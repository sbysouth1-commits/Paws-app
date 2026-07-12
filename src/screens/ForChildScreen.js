import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Award, CalendarDays, Download } from 'lucide-react-native';
import { CATEGORY_META, colors, fonts } from '../theme/colors';
import { THERAPIST_RESOURCES, SUCCESS_STORIES, family } from '../data/mockData';
import ScreenHeader from '../components/ScreenHeader';
import PawIcon from '../components/PawIcon';

// "For [Child]" (prototype TherapistScreen): private resources the therapist
// has dropped for this child, plus their success stories. Read-only for
// families — content is added by the therapist (via Supabase later).

function TherapistResourceCard({ resource }) {
  const meta = CATEGORY_META[resource.category];
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
      <Pressable style={({ pressed }) => [styles.openButton, pressed && styles.pressed]}>
        <Download size={13} color={colors.white} />
        <Text style={styles.openButtonText}>Open resource</Text>
      </Pressable>
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

export default function ForChildScreen() {
  const [tab, setTab] = useState('resources');
  const tabs = [
    { key: 'resources', label: `From ${family.therapistName}` },
    { key: 'stories', label: 'Success Stories' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={`For ${family.childName}`} />

      {/* Segmented tabs */}
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
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {tab === 'resources' ? (
          <>
            <Text style={styles.intro}>
              Resources {family.therapistName} has shared just for {family.childName} — these
              aren't in the general library.
            </Text>
            {THERAPIST_RESOURCES.map((r) => (
              <TherapistResourceCard key={r.id} resource={r} />
            ))}
          </>
        ) : (
          <>
            <Text style={styles.intro}>
              Wins and milestones {family.therapistName} has noted for {family.childName} along
              the way.
            </Text>
            {SUCCESS_STORIES.map((s) => (
              <SuccessStoryCard key={s.id} story={s} />
            ))}
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
