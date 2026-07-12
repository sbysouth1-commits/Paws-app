import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Sparkles } from 'lucide-react-native';
import { CATEGORY_META, colors, fonts } from '../theme/colors';
import { RESOURCES, family } from '../data/mockData';
import PawIcon from '../components/PawIcon';
import ResourceCard from '../components/ResourceCard';

export default function HomeScreen({ navigation }) {
  const featured = RESOURCES.slice(0, 3);
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Brand row */}
        <View style={styles.brandRow}>
          <PawIcon size={16} color={colors.clay} />
          <Text style={styles.brandText}>Pawsitive Kids</Text>
        </View>

        {/* Greeting */}
        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>G'day, {family.parentName} 👋</Text>
          <Text style={styles.headline}>Resources for {family.childName}</Text>
        </View>

        {/* Kid Mode card */}
        <View style={styles.kidCard}>
          <View style={styles.kidCardText}>
            <Text style={styles.kicker}>Just for kids</Text>
            <Text style={styles.cardSub}>Switch to {family.childName}'s simple view</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('KidMode')}
            style={({ pressed }) => [styles.kidButton, pressed && styles.pressed]}
          >
            <Sparkles size={14} color={colors.white} />
            <Text style={styles.kidButtonText}>Kid Mode</Text>
          </Pressable>
        </View>

        {/* From the therapist */}
        <Pressable
          onPress={() => navigation.navigate('Tabs', { screen: 'ForChild' })}
          style={({ pressed }) => [styles.promoCard, pressed && styles.pressed]}
        >
          <View style={styles.promoLeft}>
            <View style={styles.promoIcon}>
              <PawIcon size={18} color={colors.rose} />
            </View>
            <View>
              <Text style={styles.kicker}>From {family.therapistName}</Text>
              <Text style={styles.cardSub}>New resource + a success story this week</Text>
            </View>
          </View>
          <ChevronRight size={18} color={colors.inkSoft} />
        </Pressable>

        {/* Picked for Miller's age */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Picked for {family.childName}'s age</Text>
          <Pressable onPress={() => navigation.navigate('Tabs', { screen: 'Library' })}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>
        <View style={styles.cardList}>
          {featured.map((r) => (
            <ResourceCard
              key={r.id}
              resource={r}
              onPress={() => navigation.navigate('ResourceDetail', { id: r.id })}
            />
          ))}
        </View>

        {/* Browse by focus area */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Browse by focus area</Text>
        </View>
        <View style={styles.focusGrid}>
          {Object.entries(CATEGORY_META).map(([name, meta]) => {
            const Icon = meta.icon;
            return (
              <Pressable
                key={name}
                onPress={() =>
                  navigation.navigate('Tabs', { screen: 'Library', params: { category: name } })
                }
                style={({ pressed }) => [styles.focusTile, pressed && styles.pressed]}
              >
                <Icon size={20} color={meta.color} />
                <Text style={styles.focusLabel}>{name}</Text>
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
  scroll: { paddingBottom: 24 },
  pressed: { opacity: 0.85 },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  brandText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.clay,
  },

  greetingBlock: { paddingHorizontal: 20, paddingBottom: 16, gap: 2 },
  greeting: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft },
  headline: { fontFamily: fonts.heading, fontSize: 24, color: colors.ink },

  kicker: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: colors.ink,
  },
  cardSub: { marginTop: 2, fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft },

  kidCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.sageLight,
  },
  kidCardText: { flex: 1 },
  kidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: colors.ink,
  },
  kidButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.white },

  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.roseLight,
  },
  promoLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  promoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.ink },
  seeAll: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.clay },

  cardList: { paddingHorizontal: 20, gap: 10, marginBottom: 20 },

  focusGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 8 },
  focusTile: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  focusLabel: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.ink },
});
