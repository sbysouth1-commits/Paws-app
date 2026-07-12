import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { colors, fonts, categoryList } from '../theme/colors';
import { RESOURCES } from '../data/mockData';
import ScreenHeader from '../components/ScreenHeader';
import ResourceCard from '../components/ResourceCard';

const FILTERS = ['All', ...categoryList];

export default function LibraryScreen({ navigation, route }) {
  const [filter, setFilter] = useState('All');

  // Home's focus-area tiles deep-link here with a preselected category.
  useEffect(() => {
    if (route.params?.category) {
      setFilter(route.params.category);
    }
  }, [route.params?.category]);

  const list = filter === 'All' ? RESOURCES : RESOURCES.filter((r) => r.category === filter);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Resource Library" />

      {/* Search (static for now — wired up with Supabase later) */}
      <View style={styles.searchBox}>
        <Search size={16} color={colors.inkSoft} />
        <Text style={styles.searchText}>Search resources</Text>
      </View>

      {/* Category filter chips */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {FILTERS.map((name) => {
            const active = filter === name;
            return (
              <Pressable
                key={name}
                onPress={() => setFilter(name)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ResourceCard
            resource={item}
            onPress={() => navigation.navigate('ResourceDetail', { id: item.id })}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nothing here yet.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  searchText: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft },

  chipRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 16 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.sageLight,
  },
  chipActive: { backgroundColor: colors.ink },
  chipText: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.ink },
  chipTextActive: { color: colors.white },

  list: { paddingHorizontal: 20, paddingBottom: 24, gap: 10 },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 40,
  },
});
