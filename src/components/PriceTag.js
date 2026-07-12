import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme/colors';
import { AUD } from '../data/mockData';

// Dashed-border price chip (prototype PriceTag).
export default function PriceTag({ price }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.text}>{AUD(price)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.clay + '88',
    backgroundColor: colors.clayLight,
  },
  text: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.clay },
});
