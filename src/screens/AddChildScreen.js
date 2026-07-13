import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme/colors';
import { useChild } from '../state/ChildContext';
import PawIcon from '../components/PawIcon';

// One-time onboarding: collect the parent's name and create the family's
// child profile. Shown after login when either is missing.
export default function AddChildScreen() {
  const { saveProfile } = useChild();
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    setError(null);
    if (!parentName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!childName.trim()) {
      setError("Please enter your child's name.");
      return;
    }
    const parsedAge = childAge.trim() ? parseInt(childAge, 10) : null;
    if (childAge.trim() && (Number.isNaN(parsedAge) || parsedAge < 0 || parsedAge > 18)) {
      setError('Please enter an age between 0 and 18.');
      return;
    }
    setBusy(true);
    const { error: saveError } = await saveProfile({
      parentName: parentName.trim(),
      childName: childName.trim(),
      childAge: parsedAge,
    });
    setBusy(false);
    if (saveError) setError(saveError);
    // On success the ChildProvider sets parentName/child and the app moves on.
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <View style={styles.logo}>
              <PawIcon size={34} color={colors.clay} />
            </View>
            <Text style={styles.title}>Tell us about your family</Text>
            <Text style={styles.subtitle}>
              We'll personalise resources and your therapist's updates for you.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Your name</Text>
            <TextInput
              style={styles.input}
              value={parentName}
              onChangeText={setParentName}
              placeholder="e.g. Sarah"
              placeholderTextColor={colors.inkSoft}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Child's name</Text>
            <TextInput
              style={styles.input}
              value={childName}
              onChangeText={setChildName}
              placeholder="e.g. Miller"
              placeholderTextColor={colors.inkSoft}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Age (optional)</Text>
            <TextInput
              style={styles.input}
              value={childAge}
              onChangeText={setChildAge}
              placeholder="e.g. 6"
              placeholderTextColor={colors.inkSoft}
              keyboardType="number-pad"
              maxLength={2}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              onPress={submit}
              disabled={busy}
              style={({ pressed }) => [styles.button, (pressed || busy) && styles.buttonPressed]}
            >
              {busy ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },

  brand: { alignItems: 'center', marginBottom: 28 },
  logo: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: { fontFamily: fonts.heading, fontSize: 24, color: colors.ink, textAlign: 'center' },
  subtitle: {
    marginTop: 6,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkSoft,
    textAlign: 'center',
    paddingHorizontal: 12,
  },

  form: { gap: 6 },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.ink, marginTop: 10 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
  error: { marginTop: 12, fontFamily: fonts.bodyMedium, fontSize: 13, color: '#B3261E' },

  button: {
    marginTop: 20,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.clay,
  },
  buttonPressed: { opacity: 0.85 },
  buttonText: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.white },
});
