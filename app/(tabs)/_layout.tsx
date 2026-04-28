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
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="nueva_entrada"
        options={{
          title: 'Escribir',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="add-circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Mis_Entradas"
        options={{
          title: 'Mis Entradas',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="person" color={color} />,
        }}
      />
      <Tabs.Screen
        name="entrada-detalle"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}