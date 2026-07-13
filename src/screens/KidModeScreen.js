import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, Leaf, X } from 'lucide-react-native';
import { CATEGORY_META, colors, fonts } from '../theme/colors';
import { useCart } from '../state/CartContext';
import { useChild } from '../state/ChildContext';

// Kid Mode (prototype KidModeScreen): a simplified, big-button view of only
// the child's unlocked resources. No purchasing, no external links. The lock
// button hands control back to the grown-up.
export default function KidModeScreen({ navigation }) {
  const { purchases } = useCart();
  const { childName } = useChild();
  const [openResource, setOpenResource] = useState(null);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hey {childName}! 🌿</Text>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.lockButton, pressed && styles.pressed]}
          accessibilityLabel="Exit Kid Mode"
        >
          <Lock size={16} color={colors.ink} />
        </Pressable>
      </View>
      <Text style={styles.subtitle}>Tap a card to start!</Text>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {purchases.length === 0 ? (
          <Text style={styles.empty}>No activities yet — ask a grown-up to add some!</Text>
        ) : (
          purchases.map((r) => {
            const meta = CATEGORY_META[r.category];
            return (
              <Pressable
                key={r.id}
                onPress={() => setOpenResource(r)}
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              >
                <View style={[styles.cardIcon, { backgroundColor: meta.color + '22' }]}>
                  <Leaf size={26} color={meta.color} />
                </View>
                <Text style={styles.cardTitle}>{r.title}</Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {/* Full-screen activity preview */}
      <Modal visible={!!openResource} animationType="fade" transparent={false} onRequestClose={() => setOpenResource(null)}>
        {openResource && (
          <SafeAreaView style={styles.previewSafe} edges={['top', 'bottom']}>
            <Pressable
              onPress={() => setOpenResource(null)}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              accessibilityLabel="Close activity"
            >
              <X size={18} color={colors.ink} />
            </Pressable>
            <View style={styles.previewBody}>
              <View
                style={[
                  styles.previewIcon,
                  { backgroundColor: CATEGORY_META[openResource.category].color + '22' },
                ]}
              >
                <Leaf size={48} color={CATEGORY_META[openResource.category].color} />
              </View>
              <Text style={styles.previewTitle}>{openResource.title}</Text>
              <Text style={styles.previewSub}>
                Great job exploring! This is a preview — the full activity opens here.
              </Text>
            </View>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.roseLight },
  pressed: { opacity: 0.8 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  greeting: { fontFamily: fonts.kid, fontSize: 26, color: colors.ink },
  lockButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    paddingHorizontal: 20,
    marginBottom: 16,
    fontFamily: fonts.kid,
    fontSize: 15,
    color: colors.inkSoft,
  },

  grid: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  empty: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft },
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontFamily: fonts.kid, fontSize: 14, color: colors.ink, textAlign: 'center' },

  previewSafe: { flex: 1, backgroundColor: colors.white },
  closeButton: {
    position: 'absolute',
    top: 56,
    right: 16,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.roseLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBody: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  previewIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  previewTitle: {
    fontFamily: fonts.kid,
    fontSize: 22,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  previewSub: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
  },
});
