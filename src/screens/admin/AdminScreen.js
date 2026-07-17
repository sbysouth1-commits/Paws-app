import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, ChevronRight } from 'lucide-react-native';
import { colors, fonts } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import { useResources } from '../../state/ResourcesContext';
import { useFamiliesList } from '../../lib/useFamiliesList';
import ScreenHeader from '../../components/ScreenHeader';
import ResourceCard from '../../components/ResourceCard';

const TABS = [
  { key: 'resources', label: 'Resources' },
  { key: 'families', label: 'Families' },
  { key: 'team', label: 'Team' },
];

const ROLE_LABEL = { admin: 'Admin', therapist: 'Therapist', family: 'Family' };

// Admin-only: manage the catalogue, drop private content onto a family's
// child, and manage staff roles — all from the app instead of the Supabase
// dashboard. Only reachable when ChildContext.isAdmin is true.
export default function AdminScreen({ navigation }) {
  const [tab, setTab] = useState('resources');
  const { resources, loading: resourcesLoading, reload: reloadResources } = useResources();
  const { families, loading: familiesLoading, reload: reloadFamilies } = useFamiliesList();
  const [team, setTeam] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);

  const loadTeam = useCallback(async () => {
    setTeamLoading(true);
    const { data } = await supabase
      .from('families')
      .select('id, email, parent_name, role')
      .order('created_at', { ascending: true });
    setTeam(data ?? []);
    setTeamLoading(false);
  }, []);

  // Refresh whenever this screen regains focus, e.g. after saving a resource.
  useFocusEffect(
    useCallback(() => {
      reloadResources();
      reloadFamilies();
      loadTeam();
    }, [loadTeam, reloadFamilies, reloadResources])
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
      ) : tab === 'families' ? (
        familiesLoading ? (
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
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              >
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{item.parent_name || item.email}</Text>
                  <Text style={styles.rowSub}>
                    {item.child.name}
                    {item.child.age ? ` (${item.child.age} yrs)` : ''}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.inkSoft} />
              </Pressable>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No families have onboarded yet.</Text>}
          />
        )
      ) : teamLoading ? (
        <ActivityIndicator color={colors.ink} style={styles.loader} />
      ) : (
        <FlatList
          data={team}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                navigation.navigate('TeamMember', {
                  id: item.id,
                  email: item.email,
                  parentName: item.parent_name,
                  role: item.role,
                })
              }
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{item.parent_name || item.email}</Text>
                <Text style={styles.rowSub}>{item.email}</Text>
              </View>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{ROLE_LABEL[item.role] ?? item.role}</Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Nobody's signed up yet.</Text>}
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
  rowText: { flex: 1, minWidth: 0 },
  rowTitle: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.ink },
  rowSub: { marginTop: 2, fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft },

  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.sageLight,
  },
  roleBadgeText: { fontFamily: fonts.bodySemiBold, fontSize: 11, color: colors.ink },
});
