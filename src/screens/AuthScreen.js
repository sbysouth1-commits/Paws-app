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
import { useAuth } from '../state/AuthContext';
import PawIcon from '../components/PawIcon';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const isSignup = mode === 'signup';

  const submit = async () => {
    setError(null);
    setNotice(null);
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setBusy(true);
    const fn = isSignup ? signUp : signIn;
    const { data, error: authError } = await fn(email, password);
    setBusy(false);

    if (authError) {
      setError(authError.message);
      return;
    }
    // If email confirmation is on, signup returns a user but no session.
    if (isSignup && !data.session) {
      setNotice('Check your email to confirm your account, then sign in.');
      setMode('signin');
    }
    // On success with a session, AuthContext's listener swaps to the app.
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
              <PawIcon size={36} color={colors.clay} />
            </View>
            <Text style={styles.title}>Pawsitive Kids</Text>
            <Text style={styles.subtitle}>
              {isSignup ? 'Create your family account' : 'Welcome back'}
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.inkSoft}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.inkSoft}
              secureTextEntry
              textContentType={isSignup ? 'newPassword' : 'password'}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {notice ? <Text style={styles.notice}>{notice}</Text> : null}

            <Pressable
              onPress={submit}
              disabled={busy}
              style={({ pressed }) => [styles.button, (pressed || busy) && styles.buttonPressed]}
            >
              {busy ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>{isSignup ? 'Create account' : 'Sign in'}</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                setMode(isSignup ? 'signin' : 'signup');
                setError(null);
                setNotice(null);
              }}
              style={styles.switchRow}
            >
              <Text style={styles.switchText}>
                {isSignup ? 'Already have an account? ' : "New here? "}
                <Text style={styles.switchLink}>{isSignup ? 'Sign in' : 'Create one'}</Text>
              </Text>
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

  brand: { alignItems: 'center', marginBottom: 32 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: { fontFamily: fonts.heading, fontSize: 26, color: colors.ink },
  subtitle: { marginTop: 4, fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft },

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
  notice: { marginTop: 12, fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.green },

  button: {
    marginTop: 20,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.clay,
  },
  buttonPressed: { opacity: 0.85 },
  buttonText: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.white },

  switchRow: { marginTop: 18, alignItems: 'center' },
  switchText: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft },
  switchLink: { fontFamily: fonts.bodySemiBold, color: colors.ink },
});
