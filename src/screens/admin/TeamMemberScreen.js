import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { colors, fonts } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../state/AuthContext';
import ScreenHeader from '../../components/ScreenHeader';

const ROLES = [
  { key: 'family', label: 'Family', description: "A regular parent account — no staff access." },
  { key: 'therapist', label: 'Therapist', description: 'Can add private resources and success stories for their assigned families.' },
  { key: 'admin', label: 'Admin', description: 'Full access: manage the catalogue, every family, and the team.' },
];

// Change one account's role. Reachable only from Admin → Team.
export default function TeamMemberScreen({ route, navigation }) {
  const { id, email, parentName, role: initialRole } = route.params;
  const { user } = useAuth();
  const [role, setRole] = useState(initialRole);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const isSelf = id === user?.id;

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    const { error: saveError } = await supabase.from('families').update({ role }).eq('id', id);
    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScreenHeader title={parentName || email} subtitle={email} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.label}>Role</Text>

        {isSelf ? (
          <Text style={styles.selfNote}>
            This is your own account — to avoid accidentally locking yourself out, change your own
            role from another admin account instead.
          </Text>
        ) : (
          <View style={styles.roleList}>
            {ROLES.map((r) => {
              const active = role === r.key;
              return (
                <Pressable
                  key={r.key}
                  onPress={() => setRole(r.key)}
                  style={[styles.roleCard, active && styles.roleCardActive]}
                >
                  <View style={styles.roleHead}>
                    <Text style={[styles.roleLabel, active && styles.roleLabelActive]}>
                      {r.label}
                    </Text>
                    {active ? <Check size={16} color={colors.white} /> : null}
                  </View>
                  <Text style={[styles.roleDescription, active && styles.roleDescriptionActive]}>
                    {r.description}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!isSelf ? (
          <Pressable
            onPress={handleSave}
            disabled={saving || role === initialRole}
            style={({ pressed }) => [
              styles.saveButton,
              (pressed || saving || role === initialRole) && styles.pressed,
            ]}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveText}>Save role</Text>
            )}
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: 20, paddingBottom: 40 },
  pressed: { opacity: 0.6 },

  label: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.ink, marginBottom: 10 },
  selfNote: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.inkSoft,
  },

  roleList: { gap: 10 },
  roleCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  roleCardActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  roleHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  roleLabel: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.ink },
  roleLabelActive: { color: colors.white },
  roleDescription: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.inkSoft,
  },
  roleDescriptionActive: { color: colors.sageLight },

  error: {
    marginTop: 16,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: '#B3261E',
    textAlign: 'center',
  },

  saveButton: {
    marginTop: 20,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.clay,
  },
  saveText: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.white },
});
