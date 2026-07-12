import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Trash2 } from 'lucide-react-native';
import { colors, fonts } from '../theme/colors';
import { AUD, family } from '../data/mockData';
import { useCart } from '../state/CartContext';
import ScreenHeader from '../components/ScreenHeader';
import CategoryBadge from '../components/CategoryBadge';

// Mock checkout matching the prototype — "Pay with card" becomes real Stripe
// checkout in a later build pass.
export default function CartScreen() {
  const { cart, removeFromCart, checkout } = useCart();
  const [done, setDone] = useState(false);
  const total = cart.reduce((s, r) => s + r.price, 0);

  if (done) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.doneWrap}>
          <View style={styles.doneIcon}>
            <Check size={30} color={colors.ink} />
          </View>
          <Text style={styles.doneTitle}>Purchase complete</Text>
          <Text style={styles.doneSub}>Your resources are ready in Purchases.</Text>
          <Pressable
            onPress={() => setDone(false)}
            style={({ pressed }) => [styles.doneButton, pressed && styles.pressed]}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Your Cart" />
      {cart.length === 0 ? (
        <Text style={styles.empty}>
          Your cart is empty. Browse the library to find resources for {family.childName}.
        </Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.itemList}>
            {cart.map((r) => (
              <View key={r.id} style={styles.item}>
                <CategoryBadge category={r.category} />
                <View style={styles.itemBody}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {r.title}
                  </Text>
                  <Text style={styles.itemPrice}>{AUD(r.price)}</Text>
                </View>
                <Pressable onPress={() => removeFromCart(r.id)} style={styles.removeButton}>
                  <Trash2 size={16} color={colors.rose} />
                </Pressable>
              </View>
            ))}
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{AUD(total)}</Text>
          </View>
          <Pressable
            onPress={() => {
              checkout();
              setDone(true);
            }}
            style={({ pressed }) => [styles.payButton, pressed && styles.pressed]}
          >
            <Text style={styles.payText}>Pay with card</Text>
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { paddingHorizontal: 20, paddingBottom: 24 },
  pressed: { opacity: 0.9 },

  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginTop: 40,
  },

  itemList: { gap: 10, marginBottom: 16 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  itemBody: { flex: 1, minWidth: 0 },
  itemTitle: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.ink },
  itemPrice: { marginTop: 1, fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft },
  removeButton: { padding: 6 },

  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft },
  totalValue: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.ink },

  payButton: {
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: colors.clay,
  },
  payText: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.white },

  doneWrap: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 72 },
  doneIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  doneTitle: { fontFamily: fonts.heading, fontSize: 20, color: colors.ink, marginBottom: 4 },
  doneSub: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    marginBottom: 24,
  },
  doneButton: {
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.ink,
  },
  doneButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.white },
});
