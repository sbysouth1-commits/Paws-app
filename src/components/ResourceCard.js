import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Leaf } from 'lucide-react-native';
import { CATEGORY_META, colors, fonts } from '../theme/colors';
import PriceTag from './PriceTag';

// Row-style catalogue card (prototype ResourceCard): tinted leaf tile,
// title + optional tag pill, "Category · age", dashed price chip.
export default function ResourceCard({ resource, onPress }) {
  const meta = CATEGORY_META[resource.category];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.tile, { backgroundColor: meta.color + '1A' }]}>
        <Leaf size={26} color={meta.color} />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {resource.title}
          </Text>
          {resource.tag ? (
            <View style={styles.tagPill}>
              <Text style={styles.tagText}>{resource.tag}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.meta}>
          {resource.category} · {resource.age}
        </Text>
        <View style={styles.priceRow}>
          <PriceTag price={resource.price} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  pressed: { opacity: 0.85 },
  tile: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: {
    flexShrink: 1,
    fontFamily: fonts.heading,
    fontSize: 16,
    lineHeight: 21,
    color: colors.ink,
  },
  tagPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.sageLight,
  },
  tagText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.ink,
  },
  meta: { marginTop: 2, fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft },
  priceRow: { marginTop: 6 },
});
