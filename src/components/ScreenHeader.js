import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme/colors';

export default function ScreenHeader({ title, subtitle, right }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.textCol}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  textCol: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.heading, fontSize: 28, color: colors.purple },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted },
});
