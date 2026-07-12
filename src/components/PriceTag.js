import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme/colors';
import { formatPrice } from '../data/mockData';

export default function PriceTag({ priceAud, size = 'small' }) {
  const big = size === 'large';
  return (
    <View style={[styles.tag, big && styles.tagLarge]}>
      <Text style={[styles.text, big && styles.textLarge]}>{formatPrice(priceAud)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    backgroundColor: colors.yellow,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  tagLarge: { paddingHorizontal: 16, paddingVertical: 8 },
  text: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.purple },
  textLarge: { fontSize: 18 },
});
