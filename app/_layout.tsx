import BloqueoApp from '@/components/BloqueoApp';
import { ThemeProvider as AppThemeProvider } from '@/contexts/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [bloqueado, setBloqueado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [onboardingListo, setOnboardingListo] = useState(false);

  useEffect(() => {
    verificarEstado();
  }, []);

  const verificarEstado = async () => {
    try {
      const onboardingCompletado = await AsyncStorage.getItem('onboarding_completado');
      const perfilDatos = await AsyncStorage.getItem('perfil');
      const bloqueo = await AsyncStorage.getItem('bloqueo');

      if (bloqueo) {
        const config = JSON.parse(bloqueo);
        setBloqueado(config.activo);
      }

      const perfil = perfilDatos ? JSON.parse(perfilDatos) : null;
      const completo = !!(onboardingCompletado && perfil?.nombre && perfil?.camino);
      setOnboardingListo(completo);
    } catch {
      setOnboardingListo(false);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) return (
    <View style={{ flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 52 }}>✨</Text>
      <Text style={{ color: '#e0e0e0', fontSize: 22, fontWeight: 'bold', marginTop: 16 }}>Mi Diario con IA</Text>
      <Text style={{ color: '#9b9b9b', fontSize: 14, marginTop: 8 }}>Tu espacio para reflexionar</Text>
    </View>
  );

  return (
    <AppThemeProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName={onboardingListo ? '(tabs)' : 'onboarding/index'}>
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