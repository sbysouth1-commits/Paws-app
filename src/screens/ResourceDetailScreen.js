import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Download, Leaf } from 'lucide-react-native';
import { CATEGORY_META, colors, fonts } from '../theme/colors';
import { AUD } from '../data/mockData';
import { useCart } from '../state/CartContext';
import { useResources } from '../state/ResourcesContext';
import CategoryBadge from '../components/CategoryBadge';
import PriceTag from '../components/PriceTag';

export default function ResourceDetailScreen({ route }) {
  const { getById } = useResources();
  const resource = getById(route.params?.id);
  const { inCart, addToCart, isOwned } = useCart();

  if (!resource) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <Text style={styles.missing}>Resource not found.</Text>
      </SafeAreaView>
    );
  }

  const meta = CATEGORY_META[resource.category];
  const added = inCart(resource.id);
  const owned = isOwned(resource.id);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Preview */}
        <View style={[styles.preview, { backgroundColor: meta.color + '1A' }]}>
          <Leaf size={56} color={meta.color} />
        </View>

        <View style={styles.metaRow}>
          <CategoryBadge category={resource.category} size={24} />
          <Text style={styles.metaText}>
            {resource.category} · {resource.age}
          </Text>
        </View>

        <Text style={styles.title}>{resource.title}</Text>
        <Text style={styles.blurb}>{resource.blurb}</Text>

        <View style={styles.priceRow}>
          <PriceTag price={resource.price} />
          {owned && (
            <View style={styles.ownedRow}>
              <Check size={14} color={colors.sage} />
              <Text style={styles.ownedText}>Purchased</Text>
            </View>
          )}
        </View>

        {!owned ? (
          <Pressable
            onPress={() => addToCart(resource)}
            disabled={added}
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: added ? colors.sage : colors.clay },
              pressed && styles.pressed,
            ]}
          >
            {added ? (
              <>
                <Check size={16} color={colors.white} />
                <Text style={styles.ctaText}>Added to cart</Text>
              </>
            ) : (
              <Text style={styles.ctaText}>Add to cart · {AUD(resource.price)}</Text>
            )}
          </Pressable>
        ) : (
          <Pressable style={({ pressed }) => [styles.cta, styles.ctaOwned, pressed && styles.pressed]}>
            <Download size={16} color={colors.white} />
            <Text style={styles.ctaText}>Open resource</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: 20, paddingBottom: 32 },
  missing: {
    fontFamily: fonts.body,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 40,
  },

  preview: {
    height: 160,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  metaText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.inkSoft },

  title: { fontFamily: fonts.heading, fontSize: 24, color: colors.ink, marginBottom: 8 },
  blurb: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: colors.inkSoft,
    marginBottom: 16,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  ownedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ownedText: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.sage },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 999,
    paddingVertical: 13,
  },
  ctaOwned: { backgroundColor: colors.ink },
  ctaText: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.white },
  pressed: { opacity: 0.9 },
});
