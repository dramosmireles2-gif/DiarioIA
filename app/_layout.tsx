import 'react-native-url-polyfill/auto';
import BloqueoApp from '@/components/BloqueoApp';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider as AppThemeProvider } from '@/contexts/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { obtenerPerfilSupabase } from '@/services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { session, user, cargando: cargandoAuth } = useAuth();
  const [bloqueado, setBloqueado] = useState(false);
  const [onboardingListo, setOnboardingListo] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (cargandoAuth) return;
    verificarEstado();
  }, [cargandoAuth, user]);

  const verificarEstado = async () => {
    try {
      const bloqueo = await AsyncStorage.getItem('bloqueo');
      if (bloqueo) {
        const config = JSON.parse(bloqueo);
        setBloqueado(config.activo);
      }

      if (!user) {
        setOnboardingListo(false);
        return;
      }

      // Usuario autenticado: verificar si completó el onboarding en Supabase
      const perfil = await obtenerPerfilSupabase(user.id);
      setOnboardingListo(!!(perfil?.onboarding_completado));
    } catch {
      setOnboardingListo(false);
    }
  };

  useEffect(() => {
    if (cargandoAuth || onboardingListo === null) return;

    const enAuth = segments[0] === 'auth';

    if (!session) {
      // Sin sesión → login
      if (!enAuth) router.replace('/auth/login');
    } else if (!onboardingListo) {
      // Con sesión pero sin onboarding → onboarding
      router.replace('/onboarding/index');
    } else {
      // Todo listo → app principal
      if (enAuth || segments[0] === 'onboarding') {
        router.replace('/(tabs)');
      }
    }
  }, [session, onboardingListo, cargandoAuth]);

  if (cargandoAuth || onboardingListo === null) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 52 }}>✨</Text>
        <Text style={{ color: '#e0e0e0', fontSize: 22, fontWeight: 'bold', marginTop: 16 }}>Mi Diario con IA</Text>
        <Text style={{ color: '#9b9b9b', fontSize: 14, marginTop: 8 }}>Tu espacio para reflexionar</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName={!session ? 'auth' : onboardingListo ? '(tabs)' : 'onboarding/index'}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      {bloqueado && (
        <BloqueoApp onDesbloqueado={() => setBloqueado(false)} />
      )}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppThemeProvider>
        <RootNavigator />
      </AppThemeProvider>
    </AuthProvider>
  );
}
