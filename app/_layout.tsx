import BloqueoApp from '@/components/BloqueoApp';
import { ThemeProvider as AppThemeProvider } from '@/contexts/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [bloqueado, setBloqueado] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    verificarEstado();
  }, []);

  const verificarEstado = async () => {
    const bloqueo = await AsyncStorage.getItem('bloqueo');
    if (bloqueo) {
      const config = JSON.parse(bloqueo);
      setBloqueado(config.activo);
    }
    setCargando(false);
  };

  if (cargando) return null;

  return (
    <AppThemeProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        {bloqueado && (
          <BloqueoApp onDesbloqueado={() => setBloqueado(false)} />
        )}
        <StatusBar style="auto" />
      </ThemeProvider>
    </AppThemeProvider>
  );
}