import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme/colors';
import PawIcon from '../components/PawIcon';

// Stand-in for screens scheduled for a later build pass (spec §7.3).
export default function PlaceholderScreen({ title, message, kid = false }) {
  return (
    <SafeAreaView style={[styles.safe, kid && styles.safeKid]} edges={['top']}>
      <View style={styles.center}>
        <View style={[styles.iconWrap, kid && styles.iconWrapKid]}>
          <PawIcon size={44} color={kid ? colors.paper : colors.sage} />
        </View>
        <Text style={[styles.title, kid && styles.titleKid]}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  safeKid: { backgroundColor: colors.roseLight },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconWrapKid: { backgroundColor: colors.ink },
  title: { fontFamily: fonts.heading, fontSize: 24, color: colors.ink, textAlign: 'center' },
  titleKid: { fontFamily: fonts.kid, fontSize: 28 },
  message: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkSoft,
    textAlign: 'center',
  },
});
