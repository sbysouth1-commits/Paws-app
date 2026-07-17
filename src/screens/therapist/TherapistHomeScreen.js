import React, { useCallback } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronRight, LogOut } from 'lucide-react-native';
import { colors, fonts } from '../../theme/colors';
import { useFamiliesList } from '../../lib/useFamiliesList';
import { useAuth } from '../../state/AuthContext';
import ScreenHeader from '../../components/ScreenHeader';

// Therapist-only landing screen: just the families whose child is assigned to
// them (row-level security scopes this automatically — same query AdminScreen
// uses for its Families tab, different rows). No catalogue, no team, no
// family/shopping shell — pure staff accounts skip all of that.
export default function TherapistHomeScreen({ navigation }) {
  const { families, loading, reload } = useFamiliesList();
  const { signOut } = useAuth();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="My families"
        right={
          <Pressable onPress={signOut} style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}>
            <LogOut size={16} color={colors.rose} />
          </Pressable>
        }
      />
      {loading ? (
        <ActivityIndicator color={colors.ink} style={styles.loader} />
      ) : (
        <FlatList
          data={families}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                navigation.navigate('FamilyDetail', {
                  childId: item.child.id,
                  childName: item.child.name,
                  parentName: item.parent_name || item.email,
                })
              }
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{item.parent_name || item.email}</Text>
                <Text style={styles.rowSub}>
                  {item.child.name}
                  {item.child.age ? ` (${item.child.age} yrs)` : ''}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.inkSoft} />
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No families assigned to you yet — an admin assigns clients from Admin → Families.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  pressed: { opacity: 0.85 },
  loader: { marginTop: 40 },

  signOut: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sageLight,
  },

  list: { paddingHorizontal: 20, paddingBottom: 24, gap: 10 },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  rowText: { flex: 1, minWidth: 0 },
  rowTitle: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.ink },
  rowSub: { marginTop: 2, fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft },
});
