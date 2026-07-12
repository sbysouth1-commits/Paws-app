import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { categories, colors, fonts } from '../theme/colors';

export default function CategoryBadge({ category, size = 'small' }) {
  const meta = categories[category] ?? { icon: 'pricetag', color: colors.mauve, tint: colors.mauveTint };
  const big = size === 'large';
  return (
    <View style={[styles.badge, { backgroundColor: meta.tint }, big && styles.badgeLarge]}>
      <Ionicons name={meta.icon} size={big ? 16 : 12} color={meta.color} />
      <Text style={[styles.label, { color: meta.color }, big && styles.labelLarge]}>{category}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeLarge: { paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 11 },
  labelLarge: { fontSize: 13 },
});
