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

// One-time onboarding: create the family's child profile. Shown after login
// when no child exists yet.
export default function AddChildScreen() {
  const { saveChild } = useChild();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [focusArea, setFocusArea] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Please enter your child's name.");
      return;
    }
    const parsedAge = age.trim() ? parseInt(age, 10) : null;
    if (age.trim() && (Number.isNaN(parsedAge) || parsedAge < 0 || parsedAge > 18)) {
      setError('Please enter an age between 0 and 18.');
      return;
    }
    setBusy(true);
    const { error: saveError } = await saveChild({
      name: name.trim(),
      age: parsedAge,
      focusArea: focusArea.trim() || null,
    });
    setBusy(false);
    if (saveError) setError(saveError);
    // On success the ChildProvider sets the child and the app moves on.
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
            <Text style={styles.title}>Add your child</Text>
            <Text style={styles.subtitle}>
              We'll personalise resources and their therapist's updates for them.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Child's name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Miller"
              placeholderTextColor={colors.inkSoft}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Age (optional)</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="e.g. 6"
              placeholderTextColor={colors.inkSoft}
              keyboardType="number-pad"
              maxLength={2}
            />

            <Text style={styles.label}>Focus area (optional)</Text>
            <TextInput
              style={styles.input}
              value={focusArea}
              onChangeText={setFocusArea}
              placeholder="e.g. Speech, Sensory"
              placeholderTextColor={colors.inkSoft}
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
  title: { fontFamily: fonts.heading, fontSize: 24, color: colors.ink },
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
