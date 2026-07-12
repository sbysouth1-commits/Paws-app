import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, categoryList } from '../theme/colors';
import { resources } from '../data/mockData';
import ScreenHeader from '../components/ScreenHeader';
import ResourceCard from '../components/ResourceCard';

const FILTERS = ['All', ...categoryList];

export default function LibraryScreen({ navigation, route }) {
  const [filter, setFilter] = useState('All');

  // Home's category tiles deep-link here with a preselected category.
  useEffect(() => {
    if (route.params?.category) {
      setFilter(route.params.category);
    }
  }, [route.params?.category]);

  const filtered = filter === 'All' ? resources : resources.filter((r) => r.category === filter);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Library" subtitle="Every resource in the catalogue" />

      {/* Search (static for now — wired up with Supabase later) */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.mauve} />
        <TextInput
          placeholder="Search resources…"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
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
        data={filtered}
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
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.purple,
  },

  chipRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chipActive: { backgroundColor: colors.purple, borderColor: colors.purple },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.purple },
  chipTextActive: { color: colors.paper },

  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
});
