import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, fonts } from '../theme/colors';
import TherapistHomeScreen from '../screens/therapist/TherapistHomeScreen';
import FamilyDetailScreen from '../screens/admin/FamilyDetailScreen';
import TherapistResourceFormScreen from '../screens/admin/TherapistResourceFormScreen';
import SuccessStoryFormScreen from '../screens/admin/SuccessStoryFormScreen';

const Stack = createNativeStackNavigator();

// Separate top-level navigator for therapist accounts — pure staff with no
// family/child of their own, so they skip the consumer Tabs entirely and land
// straight on their assigned families. Reuses FamilyDetail and the two
// content-form screens from the admin section unchanged: row-level security
// already scopes what a therapist can see/add to just their own clients, so
// the same screens work correctly for both roles with no special-casing.
export default function TherapistNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.paper },
          headerTintColor: colors.ink,
          headerTitleStyle: { fontFamily: fonts.heading, fontSize: 18 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.paper },
        }}
      >
        <Stack.Screen name="TherapistHome" component={TherapistHomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="FamilyDetail" component={FamilyDetailScreen} options={{ title: '' }} />
        <Stack.Screen
          name="TherapistResourceForm"
          component={TherapistResourceFormScreen}
          options={{ title: '' }}
        />
        <Stack.Screen name="SuccessStoryForm" component={SuccessStoryFormScreen} options={{ title: '' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
