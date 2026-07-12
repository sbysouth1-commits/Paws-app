import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme/colors';
import { family } from '../data/mockData';
import HomeScreen from '../screens/HomeScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ResourceDetailScreen from '../screens/ResourceDetailScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: 'home',
  Library: 'book',
  ForChild: 'gift',
  Cart: 'cart',
  Profile: 'person',
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? TAB_ICONS[route.name] : `${TAB_ICONS[route.name]}-outline`}
            size={size}
            color={color}
          />
        ),
        tabBarActiveTintColor: colors.purple,
        tabBarInactiveTintColor: colors.mauve,
        tabBarStyle: { backgroundColor: colors.paper, borderTopColor: colors.cardBorder },
        tabBarLabelStyle: { fontFamily: fonts.bodySemiBold, fontSize: 11 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="ForChild" options={{ title: `For ${family.childName}` }}>
        {() => (
          <PlaceholderScreen
            title={`For ${family.childName}`}
            message={`Resources ${family.therapistName} has shared and ${family.childName}'s success stories will live here — coming in the next build pass.`}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Cart">
        {() => (
          <PlaceholderScreen
            title="Cart"
            message="Your cart and Stripe checkout (AUD) land here once purchasing is wired up."
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {() => (
          <PlaceholderScreen
            title="Profile"
            message={`Parent account, ${family.childName}'s profile, purchase history, settings and a link to pawsitivekids.com.au — coming soon.`}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.paper },
          headerTintColor: colors.purple,
          headerTitleStyle: { fontFamily: fonts.headingMedium, fontSize: 18 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.paper },
        }}
      >
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="ResourceDetail"
          component={ResourceDetailScreen}
          options={{ title: 'Resource' }}
        />
        <Stack.Screen name="KidMode" options={{ title: 'Kid Mode' }}>
          {() => (
            <PlaceholderScreen
              kid
              title={`Hi ${family.childName}!`}
              message="Kid Mode's big-button view of unlocked resources is coming in the next build pass — no purchasing or external links here."
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
