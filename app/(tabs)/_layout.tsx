import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ color }) => <Ionicons name="briefcase" size={28} color={color} />        
        }}
      />
      <Tabs.Screen
        name="agregar"
        options={{
          title: 'Agregar Inversión',
          tabBarIcon: ({ color }) => <Ionicons name="add-circle" size={28} color={color} />,        
        }}
      />
    </Tabs>
  );
}
