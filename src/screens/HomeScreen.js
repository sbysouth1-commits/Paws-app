import React from 'react';
import { View, Text, ScrollView, Pressable, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, categories, categoryList } from '../theme/colors';
import { family, featuredResources } from '../data/mockData';
import PawIcon from '../components/PawIcon';
import ResourceCard from '../components/ResourceCard';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>G'day, {family.parentName}</Text>
            <Text style={styles.subGreeting}>Let's find something great for {family.childName}</Text>
          </View>
          <PawIcon size={40} />
        </View>

        {/* Kid Mode shortcut */}
        <Pressable
          onPress={() => navigation.navigate('KidMode')}
          style={({ pressed }) => [styles.kidMode, pressed && styles.pressed]}
        >
          <View style={styles.kidModeIcon}>
            <PawIcon size={28} color={colors.paper} />
          </View>
          <View style={styles.kidModeText}>
            <Text style={styles.kidModeTitle}>Kid Mode</Text>
            <Text style={styles.kidModeSub}>Hand the phone to {family.childName}</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.paper} />
        </Pressable>

        {/* From the therapist */}
        <Pressable
          onPress={() => navigation.navigate('Tabs', { screen: 'ForChild' })}
          style={({ pressed }) => [styles.promo, pressed && styles.pressed]}
        >
          <View style={styles.promoIcon}>
            <Ionicons name="gift" size={24} color={colors.purple} />
          </View>
          <View style={styles.promoText}>
            <Text style={styles.promoTitle}>From {family.therapistName}</Text>
            <Text style={styles.promoSub}>
              2 new resources and a success story for {family.childName}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.purple} />
        </Pressable>

        {/* Featured */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured resources</Text>
          <Pressable onPress={() => navigation.navigate('Tabs', { screen: 'Library' })}>
            <Text style={styles.sectionLink}>See all</Text>
          </Pressable>
        </View>
        <FlatList
          horizontal
          data={featuredResources}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredRail}
          renderItem={({ item }) => (
            <ResourceCard
              resource={item}
              variant="featured"
              onPress={() => navigation.navigate('ResourceDetail', { id: item.id })}
            />
          )}
        />

        {/* Browse by category */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse by category</Text>
        </View>
        <View style={styles.categoryGrid}>
          {categoryList.map((name) => {
            const meta = categories[name];
            return (
              <Pressable
                key={name}
                onPress={() =>
                  navigation.navigate('Tabs', { screen: 'Library', params: { category: name } })
                }
                style={({ pressed }) => [
                  styles.categoryTile,
                  { backgroundColor: meta.tint },
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name={meta.icon} size={26} color={meta.color} />
                <Text style={[styles.categoryLabel, { color: meta.color }]}>{name}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { paddingBottom: 32 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerText: { flex: 1, gap: 2 },
  greeting: { fontFamily: fonts.heading, fontSize: 28, color: colors.purple },
  subGreeting: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted },

  kidMode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.purple,
  },
  kidModeIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kidModeText: { flex: 1, gap: 1 },
  kidModeTitle: { fontFamily: fonts.kid, fontSize: 20, color: colors.paper },
  kidModeSub: { fontFamily: fonts.body, fontSize: 13, color: colors.mauveTint },

  promo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.yellowTint,
    borderWidth: 1,
    borderColor: colors.yellow,
  },
  promoIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoText: { flex: 1, gap: 1 },
  promoTitle: { fontFamily: fonts.headingMedium, fontSize: 17, color: colors.purple },
  promoSub: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontFamily: fonts.headingMedium, fontSize: 20, color: colors.purple },
  sectionLink: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.mauve },

  featuredRail: { paddingHorizontal: 20, gap: 12, paddingBottom: 24 },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryTile: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  categoryLabel: { fontFamily: fonts.bodySemiBold, fontSize: 14 },
});
