import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { categories, colors, fonts } from '../theme/colors';
import CategoryBadge from './CategoryBadge';
import PriceTag from './PriceTag';

// variant: 'featured' (wide card for horizontal rails) | 'list' (full-width row)
export default function ResourceCard({ resource, onPress, variant = 'list' }) {
  const meta = categories[resource.category] ?? { icon: 'pricetag', color: colors.mauve, tint: colors.mauveTint };

  if (variant === 'featured') {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.featuredCard, pressed && styles.pressed]}>
        <View style={[styles.featuredPreview, { backgroundColor: meta.tint }]}>
          <Ionicons name={meta.icon} size={40} color={meta.color} />
          {resource.tag ? (
            <View style={[styles.tagPill, styles.tagPillFloating]}>
              <Text style={styles.tagText}>{resource.tag}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.featuredBody}>
          <Text style={styles.title} numberOfLines={2}>
            {resource.title}
          </Text>
          <Text style={styles.ageRange}>Ages {resource.ageRange}</Text>
          <View style={styles.rowBetween}>
            <CategoryBadge category={resource.category} />
            <PriceTag priceAud={resource.priceAud} />
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.listCard, pressed && styles.pressed]}>
      <View style={[styles.listPreview, { backgroundColor: meta.tint }]}>
        <Ionicons name={meta.icon} size={28} color={meta.color} />
      </View>
      <View style={styles.listBody}>
        <View style={styles.rowBetween}>
          <Text style={[styles.title, styles.listTitle]} numberOfLines={2}>
            {resource.title}
          </Text>
          {resource.tag ? (
            <View style={styles.tagPill}>
              <Text style={styles.tagText}>{resource.tag}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.ageRange}>Ages {resource.ageRange}</Text>
        <View style={styles.rowBetween}>
          <CategoryBadge category={resource.category} />
          <PriceTag priceAud={resource.priceAud} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: { fontFamily: fonts.headingMedium, fontSize: 16, color: colors.purple },
  ageRange: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  tagPill: {
    backgroundColor: colors.purple,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagPillFloating: { position: 'absolute', top: 10, right: 10 },
  tagText: { fontFamily: fonts.bodySemiBold, fontSize: 10, color: colors.paper },

  featuredCard: {
    width: 220,
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  featuredPreview: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredBody: { padding: 12, gap: 6 },

  listCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  listPreview: {
    width: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listBody: { flex: 1, padding: 12, gap: 6 },
  listTitle: { flex: 1 },
});
