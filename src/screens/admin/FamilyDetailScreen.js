import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { colors, fonts } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import ScreenHeader from '../../components/ScreenHeader';
import PawIcon from '../../components/PawIcon';

// Shows what's already been shared privately with one family's child, with
// buttons to add a new therapist resource or success story for them.
export default function FamilyDetailScreen({ route, navigation }) {
  const { childId, childName, parentName } = route.params;
  const [resources, setResources] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [res, sto] = await Promise.all([
      supabase
        .from('therapist_resources')
        .select('*')
        .eq('child_id', childId)
        .order('shared_at', { ascending: false }),
      supabase
        .from('success_stories')
        .select('*')
        .eq('child_id', childId)
        .order('occurred_at', { ascending: false }),
    ]);
    setResources(res.data ?? []);
    setStories(sto.data ?? []);
    setLoading(false);
  }, [childId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScreenHeader title={childName} subtitle={`Parent: ${parentName}`} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Therapist resources</Text>
          <Pressable
            onPress={() => navigation.navigate('TherapistResourceForm', { childId })}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          >
            <Plus size={16} color={colors.white} />
          </Pressable>
        </View>
        {loading ? (
          <ActivityIndicator color={colors.ink} style={styles.loader} />
        ) : resources.length === 0 ? (
          <Text style={styles.empty}>Nothing shared yet.</Text>
        ) : (
          resources.map((r) => (
            <View key={r.id} style={styles.item}>
              <PawIcon size={16} color={colors.ink} />
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>{r.title}</Text>
                <Text style={styles.itemMeta}>
                  {r.category} · {r.file_url ? 'Has file' : 'No file attached'}
                </Text>
              </View>
            </View>
          ))
        )}

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Success stories</Text>
          <Pressable
            onPress={() => navigation.navigate('SuccessStoryForm', { childId })}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          >
            <Plus size={16} color={colors.white} />
          </Pressable>
        </View>
        {loading ? null : stories.length === 0 ? (
          <Text style={styles.empty}>No stories yet.</Text>
        ) : (
          stories.map((s) => (
            <View key={s.id} style={styles.item}>
              <PawIcon size={16} color={colors.gold} />
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>{s.title}</Text>
              </View>
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
  loader: { marginTop: 12 },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.ink },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },

  empty: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 8,
  },
  itemBody: { flex: 1, minWidth: 0 },
  itemTitle: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.ink },
  itemMeta: { marginTop: 1, fontFamily: fonts.body, fontSize: 11, color: colors.inkSoft },
});
