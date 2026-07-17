import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, ChevronRight } from 'lucide-react-native';
import { colors, fonts } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import { useResources } from '../../state/ResourcesContext';
import ScreenHeader from '../../components/ScreenHeader';
import ResourceCard from '../../components/ResourceCard';

const TABS = [
  { key: 'resources', label: 'Resources' },
  { key: 'families', label: 'Families' },
];

// Owner-only: manage the catalogue and drop private content onto a family's
// child, straight from the app instead of the Supabase dashboard. Only
// reachable when ChildContext.isAdmin is true (see ProfileScreen).
export default function AdminScreen({ navigation }) {
  const [tab, setTab] = useState('resources');
  const { resources, loading: resourcesLoading, reload: reloadResources } = useResources();
  const [families, setFamilies] = useState([]);
  const [familiesLoading, setFamiliesLoading] = useState(true);

  const loadFamilies = useCallback(async () => {
    setFamiliesLoading(true);
    const [famRes, kidsRes] = await Promise.all([
      supabase.from('families').select('id, email, parent_name'),
      supabase.from('children').select('id, family_id, name, age'),
    ]);
    const kidsByFamily = new Map((kidsRes.data ?? []).map((k) => [k.family_id, k]));
    const rows = (famRes.data ?? [])
      .map((f) => ({ ...f, child: kidsByFamily.get(f.id) ?? null }))
      .filter((f) => f.child); // only families that finished onboarding
    setFamilies(rows);
    setFamiliesLoading(false);
  }, []);

  // Refresh whenever this screen regains focus, e.g. after saving a resource.
  useFocusEffect(
    useCallback(() => {
      reloadResources();
      loadFamilies();
    }, [loadFamilies, reloadResources])
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScreenHeader
        title="Admin"
        right={
          tab === 'resources' ? (
            <Pressable
              onPress={() => navigation.navigate('ResourceForm', {})}
              style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
            >
              <Plus size={18} color={colors.white} />
            </Pressable>
          ) : null
        }
      />

      <View style={styles.segmentWrap}>
        <View style={styles.segment}>
          {TABS.map((t) => {
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

      {tab === 'resources' ? (
        resourcesLoading ? (
          <ActivityIndicator color={colors.ink} style={styles.loader} />
        ) : (
          <FlatList
            data={resources}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <ResourceCard
                resource={item}
                onPress={() => navigation.navigate('ResourceForm', { id: item.id })}
              />
            )}
          />
        )
      ) : familiesLoading ? (
        <ActivityIndicator color={colors.ink} style={styles.loader} />
      ) : (
        <FlatList
          data={families}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                navigation.navigate('FamilyDetail', {
                  childId: item.child.id,
                  childName: item.child.name,
                  parentName: item.parent_name || item.email,
                })
              }
              style={({ pressed }) => [styles.familyRow, pressed && styles.pressed]}
            >
              <View style={styles.familyText}>
                <Text style={styles.familyName}>{item.parent_name || item.email}</Text>
                <Text style={styles.familyChild}>
                  {item.child.name}
                  {item.child.age ? ` (${item.child.age} yrs)` : ''}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.inkSoft} />
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No families have onboarded yet.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  pressed: { opacity: 0.85 },
  loader: { marginTop: 40 },

  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },

  segmentWrap: { paddingHorizontal: 20, marginBottom: 12 },
  segment: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 4,
    backgroundColor: colors.sageLight,
  },
  segmentButton: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 999 },
  segmentButtonActive: { backgroundColor: colors.white },
  segmentText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.inkSoft },
  segmentTextActive: { color: colors.ink },

  list: { paddingHorizontal: 20, paddingBottom: 24, gap: 10 },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 40,
  },

  familyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  familyText: { flex: 1, minWidth: 0 },
  familyName: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.ink },
  familyChild: { marginTop: 2, fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft },
});
