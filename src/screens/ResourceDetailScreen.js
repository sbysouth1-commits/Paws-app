import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { categories, colors, fonts } from '../theme/colors';
import { resources } from '../data/mockData';
import CategoryBadge from '../components/CategoryBadge';
import PriceTag from '../components/PriceTag';

export default function ResourceDetailScreen({ route }) {
  const resource = resources.find((r) => r.id === route.params?.id);

  if (!resource) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <Text style={styles.missing}>Resource not found.</Text>
      </SafeAreaView>
    );
  }

  const meta = categories[resource.category] ?? { icon: 'pricetag', color: colors.mauve, tint: colors.mauveTint };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Preview */}
        <View style={[styles.preview, { backgroundColor: meta.tint }]}>
          <Ionicons name={meta.icon} size={64} color={meta.color} />
          {resource.tag ? (
            <View style={styles.tagPill}>
              <Text style={styles.tagText}>{resource.tag}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{resource.title}</Text>
          <View style={styles.badgeRow}>
            <CategoryBadge category={resource.category} size="large" />
            <View style={styles.agePill}>
              <Ionicons name="person" size={13} color={colors.mauve} />
              <Text style={styles.ageText}>Ages {resource.ageRange}</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>About this resource</Text>
          <Text style={styles.description}>{resource.description}</Text>

          <Text style={styles.sectionLabel}>What you get</Text>
          <View style={styles.bullet}>
            <Ionicons name="document" size={15} color={colors.mauve} />
            <Text style={styles.bulletText}>Instant digital download (PDF)</Text>
          </View>
          <View style={styles.bullet}>
            <Ionicons name="infinite" size={15} color={colors.mauve} />
            <Text style={styles.bulletText}>Yours forever — re-download any time</Text>
          </View>
        </View>
      </ScrollView>

      {/* Purchase bar — disabled placeholder until Stripe is wired up */}
      <View style={styles.footer}>
        <PriceTag priceAud={resource.priceAud} size="large" />
        <Pressable disabled style={styles.buyButton}>
          <Ionicons name="cart" size={18} color={colors.purple} />
          <Text style={styles.buyText}>Add to cart</Text>
        </Pressable>
      </View>
      <Text style={styles.footerNote}>Purchasing arrives with the Stripe build pass</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { paddingBottom: 16 },
  missing: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },

  preview: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagPill: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: colors.purple,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: { fontFamily: fonts.bodySemiBold, fontSize: 11, color: colors.paper },

  body: { padding: 20, gap: 12 },
  title: { fontFamily: fonts.heading, fontSize: 26, color: colors.purple },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  agePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  ageText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.purple },

  sectionLabel: {
    fontFamily: fonts.headingMedium,
    fontSize: 17,
    color: colors.purple,
    marginTop: 8,
  },
  description: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: '#4A3D57' },
  bullet: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bulletText: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.yellow,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,
    opacity: 0.55,
  },
  buyText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.purple },
  footerNote: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'right',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 4,
  },
});
