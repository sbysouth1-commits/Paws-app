import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import {
  PublicSans_400Regular,
  PublicSans_500Medium,
  PublicSans_600SemiBold,
  PublicSans_700Bold,
} from '@expo-google-fonts/public-sans';
import { Baloo2_700Bold } from '@expo-google-fonts/baloo-2';
import RootNavigator from './src/navigation/RootNavigator';
import AuthScreen from './src/screens/AuthScreen';
import { CartProvider } from './src/state/CartContext';
import { AuthProvider, useAuth } from './src/state/AuthContext';
import { colors } from './src/theme/colors';

function Loading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.ink} />
    </View>
  );
}

// Decides between the login screen and the app. When Supabase isn't configured
// yet, supabaseEnabled is false and the app runs straight to the mock UI.
function Gate() {
  const { supabaseEnabled, session, loading } = useAuth();

  if (supabaseEnabled && loading) return <Loading />;
  if (supabaseEnabled && !session) return <AuthScreen />;

  return (
    <CartProvider>
      <RootNavigator />
    </CartProvider>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    PublicSans_400Regular,
    PublicSans_500Medium,
    PublicSans_600SemiBold,
    PublicSans_700Bold,
    Baloo2_700Bold,
  });

  if (!fontsLoaded) return <Loading />;

  return (
    <AuthProvider>
      <StatusBar style="dark" backgroundColor={colors.paper} />
      <Gate />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
