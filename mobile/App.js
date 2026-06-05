import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import FeedScreen from './src/screens/FeedScreen';
import MapScreen from './src/screens/MapScreen';
import MarketplaceScreen from './src/screens/MarketplaceScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const DetroitDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#000000',
    card: '#111111',
    text: '#ffffff',
    border: '#333333',
    primary: '#39ff14', // Neon Green active tint
  },
};

export default function App() {
  return (
    <NavigationContainer theme={DetroitDarkTheme}>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#111' },
          headerTitleStyle: { fontWeight: '900', letterSpacing: 2 },
          tabBarActiveTintColor: '#39ff14',
          tabBarInactiveTintColor: '#888',
          tabBarStyle: { borderTopColor: '#333' }
        }}
      >
        <Tab.Screen name="Feed" component={FeedScreen} options={{ title: 'THE HUB' }} />
        <Tab.Screen name="Map" component={MapScreen} options={{ title: 'RADAR' }} />
        <Tab.Screen name="Store" component={MarketplaceScreen} options={{ title: 'EXCHANGE' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'ID' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
