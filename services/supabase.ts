import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as AppleAuthentication from 'expo-apple-authentication';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ── Registro con email/contraseña ──
export const registrarConEmail = async (email: string, password: string, nombre: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre } },
  });
  if (error) throw error;
  return data;
};

// ── Login con email/contraseña ──
export const loginConEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

// ── OAuth con WebBrowser (Google / Facebook) ──
const loginConOAuth = async (provider: 'google' | 'facebook') => {
  const redirectUrl = Linking.createURL('/');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
  });
  if (error) throw error;

  if (data.url) {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
    if (result.type === 'success') {
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(result.url);
      if (sessionError) throw sessionError;
    }
  }
};

export const loginConGoogle = () => loginConOAuth('google');
export const loginConFacebook = () => loginConOAuth('facebook');

// ── Login con Apple (solo iOS) ──
export const loginConApple = async () => {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (credential.identityToken) {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });
    if (error) throw error;
    return data;
  }
  throw new Error('No se pudo obtener el token de Apple');
};

// ── Cerrar sesión ──
export const cerrarSesion = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// ── Perfil en Supabase ──
export const guardarPerfilSupabase = async (userId: string, perfil: {
  nombre: string;
  edad: string;
  cumpleanos: string;
  genero: string;
  camino: string;
  foto: string | null;
}) => {
  const { error } = await supabase.from('perfiles').upsert({
    id: userId,
    ...perfil,
    onboarding_completado: true,
  });
  if (error) throw error;
};

export const obtenerPerfilSupabase = async (userId: string) => {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// ── Entradas en Supabase ──
export const guardarEntradaSupabase = async (userId: string, entrada: {
  id: string;
  texto: string;
  fecha: string;
  emocion: string | null;
  destacada: boolean;
  etiquetas?: string[];
}) => {
  const { error } = await supabase.from('entradas').upsert({
    user_id: userId,
    ...entrada,
  });
  if (error) throw error;
};

export const obtenerEntradasSupabase = async (userId: string) => {
  const { data, error } = await supabase
    .from('entradas')
    .select('*')
    .eq('user_id', userId)
    .order('fecha', { ascending: false });
  if (error) throw error;
  return data || [];
};
