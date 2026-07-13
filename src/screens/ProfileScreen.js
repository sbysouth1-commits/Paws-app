import React from 'react';
import { View, Text, ScrollView, Pressable, Linking, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Download, Globe, LogOut } from 'lucide-react-native';
import { colors, fonts } from '../theme/colors';
import { family } from '../data/mockData';
import { useCart } from '../state/CartContext';
import { useAuth } from '../state/AuthContext';
import ScreenHeader from '../components/ScreenHeader';
import CategoryBadge from '../components/CategoryBadge';

const SETTINGS = ['Child profiles', 'Payment methods', 'Notifications', 'Privacy & data'];
const WEBSITE = 'https://pawsitivekids.com.au';

export default function ProfileScreen({ navigation }) {
  const { purchases } = useCart();
  const { supabaseEnabled, user, signOut } = useAuth();
  const avatarInitial = family.parentName.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Profile" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Account card */}
        <View style={styles.accountCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
          <View style={styles.accountText}>
            <Text style={styles.accountName}>{family.parentName}</Text>
            <Text style={styles.accountSub}>
              1 child profile · {family.childName} ({family.childAge} yrs)
            </Text>
            {supabaseEnabled && user?.email ? (
              <Text style={styles.accountEmail}>{user.email}</Text>
            ) : null}
          </View>
        </View>

        {/* Purchases */}
        <Text style={styles.sectionTitle}>My purchases</Text>
        <View style={styles.purchaseList}>
          {purchases.length === 0 ? (
            <Text style={styles.empty}>Nothing purchased yet.</Text>
          ) : (
            purchases.map((r) => (
              <Pressable
                key={r.id}
                onPress={() => navigation.navigate('ResourceDetail', { id: r.id })}
                style={({ pressed }) => [styles.purchaseItem, pressed && styles.pressed]}
              >
                <CategoryBadge category={r.category} />
                <Text style={styles.purchaseTitle} numberOfLines={1}>
                  {r.title}
                </Text>
                <Download size={16} color={colors.inkSoft} />
              </Pressable>
            ))
          )}
        </View>

        {/* Settings */}
        <View style={styles.settingsList}>
          {SETTINGS.map((s) => (
            <Pressable key={s} style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}>
              <Text style={styles.settingLabel}>{s}</Text>
              <ChevronRight size={16} color={colors.inkSoft} />
            </Pressable>
          ))}
        </View>

        {/* Website link */}
        <Pressable
          onPress={() => Linking.openURL(WEBSITE)}
          style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}
        >
          <View style={styles.websiteLeft}>
            <Globe size={16} color={colors.clay} />
            <Text style={styles.websiteLabel}>Visit pawsitivekids.com.au</Text>
          </View>
          <ChevronRight size={16} color={colors.clay} />
        </Pressable>

        {supabaseEnabled ? (
          <Pressable
            onPress={signOut}
            style={({ pressed }) => [styles.signOutRow, pressed && styles.pressed]}
          >
            <LogOut size={16} color={colors.rose} />
            <Text style={styles.signOutLabel}>Sign out</Text>
          </Pressable>
        ) : null}

        <Text style={styles.footer}>Pawsitive Kids · pawsitivekids.com.au</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { paddingHorizontal: 20, paddingBottom: 24 },
  pressed: { opacity: 0.85 },

  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.bodySemiBold, fontSize: 18, color: colors.white },
  accountText: { flex: 1, minWidth: 0 },
  accountName: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.ink },
  accountSub: { marginTop: 2, fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft },
  accountEmail: { marginTop: 1, fontFamily: fonts.body, fontSize: 11, color: colors.sage },

  sectionTitle: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.ink, marginBottom: 10 },

  purchaseList: { gap: 10, marginBottom: 20 },
  empty: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft },
  purchaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  purchaseTitle: { flex: 1, fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.ink },

  settingsList: { marginBottom: 8 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 8,
  },
  settingLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.ink },
  websiteLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  websiteLabel: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.clay },

  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    marginTop: 4,
  },
  signOutLabel: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.rose },

  footer: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 16,
  },
});
