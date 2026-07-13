import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, BookOpen, ShoppingBag, User } from 'lucide-react-native';
import { colors, fonts } from '../theme/colors';
import { useCart } from '../state/CartContext';
import { useChild } from '../state/ChildContext';
import PawIcon from '../components/PawIcon';
import HomeScreen from '../screens/HomeScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ResourceDetailScreen from '../screens/ResourceDetailScreen';
import CartScreen from '../screens/CartScreen';
import ForChildScreen from '../screens/ForChildScreen';
import ProfileScreen from '../screens/ProfileScreen';
import KidModeScreen from '../screens/KidModeScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  const { cart } = useCart();
  const { childName } = useChild();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        // Prototype BottomNav: clay for the active tab, soft ink otherwise
        tabBarActiveTintColor: colors.clay,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarStyle: { backgroundColor: colors.paper, borderTopColor: colors.line },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Home size={20} color={color} strokeWidth={focused ? 2.4 : 1.8} />
          ),
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <BookOpen size={20} color={color} strokeWidth={focused ? 2.4 : 1.8} />
          ),
        }}
      />
      <Tab.Screen
        name="ForChild"
        component={ForChildScreen}
        options={{
          title: `For ${childName}`,
          tabBarIcon: ({ color }) => <PawIcon size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <ShoppingBag size={20} color={color} strokeWidth={focused ? 2.4 : 1.8} />
          ),
          tabBarBadge: cart.length > 0 ? cart.length : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.rose,
            color: colors.white,
            fontFamily: fonts.bodySemiBold,
            fontSize: 10,
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <User size={20} color={color} strokeWidth={focused ? 2.4 : 1.8} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
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
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="ResourceDetail" component={ResourceDetailScreen} options={{ title: '' }} />
        {/* Kid Mode has its own in-screen lock button to exit, so no stack header. */}
        <Stack.Screen name="KidMode" component={KidModeScreen} options={{ headerShown: false }} />
        {/* gestureEnabled stays default; the lock button is the intended way out. */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
