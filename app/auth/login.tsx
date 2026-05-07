import { useTema } from '@/contexts/ThemeContext';
import {
  cerrarSesion,
  loginConApple,
  loginConEmail,
  loginConFacebook,
  loginConGoogle,
} from '@/services/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { Platform, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const { colores } = useTema();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState<string | null>(null);

  const manejarLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Por favor ingresa tu correo y contraseña');
      return;
    }
    setCargando('email');
    try {
      await loginConEmail(email.trim(), password);
    } catch (e: any) {
      Alert.alert('Error al iniciar sesión', tradurirError(e.message));
    } finally {
      setCargando(null);
    }
  };

  const manejarGoogle = async () => {
    setCargando('google');
    try {
      await loginConGoogle();
    } catch (e: any) {
      Alert.alert('Error con Google', tradurirError(e.message));
    } finally {
      setCargando(null);
    }
  };

  const manejarFacebook = async () => {
    setCargando('facebook');
    try {
      await loginConFacebook();
    } catch (e: any) {
      Alert.alert('Error con Facebook', tradurirError(e.message));
    } finally {
      setCargando(null);
    }
  };

  const manejarApple = async () => {
    setCargando('apple');
    try {
      await loginConApple();
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Error con Apple', tradurirError(e.message));
      }
    } finally {
      setCargando(null);
    }
  };

  const tradurirError = (msg: string) => {
    if (msg.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos';
    if (msg.includes('Email not confirmed')) return 'Confirma tu correo electrónico primero';
    if (msg.includes('Network')) return 'Sin conexión. Verifica tu internet';
    return msg;
  };

  const hayOperacion = cargando !== null;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colores.fondo }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>✨</Text>
          <Text style={[styles.titulo, { color: colores.texto }]}>Mi Diario con IA</Text>
          <Text style={[styles.subtitulo, { color: colores.textoSecundario }]}>
            Tu espacio seguro para reflexionar
          </Text>
        </View>

        {/* Formulario email */}
        <View style={[styles.card, { backgroundColor: colores.fondoTarjeta }]}>
          <Text style={[styles.cardTitulo, { color: colores.texto }]}>Iniciar sesión</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colores.textoSecundario }]}>Correo electrónico</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colores.fondo }]}>
              <Ionicons name="mail-outline" size={18} color={colores.textoSecundario} />
              <TextInput
                style={[styles.input, { color: colores.texto }]}
                placeholder="tu@correo.com"
                placeholderTextColor={colores.textoSecundario}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colores.textoSecundario }]}>Contraseña</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colores.fondo }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colores.textoSecundario} />
              <TextInput
                style={[styles.input, { color: colores.texto }]}
                placeholder="Tu contraseña"
                placeholderTextColor={colores.textoSecundario}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!mostrarPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setMostrarPassword(!mostrarPassword)}>
                <Ionicons
                  name={mostrarPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colores.textoSecundario}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.botonPrimario, { backgroundColor: colores.acento }, hayOperacion && styles.botonDeshabilitado]}
            onPress={manejarLogin}
            disabled={hayOperacion}
          >
            {cargando === 'email' ? (
              <Text style={styles.botonTexto}>Iniciando sesión...</Text>
            ) : (
              <>
                <Ionicons name="log-in-outline" size={18} color="#fff" />
                <Text style={styles.botonTexto}>Entrar</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/register')} style={styles.linkContainer}>
            <Text style={[styles.link, { color: colores.textoSecundario }]}>
              ¿No tienes cuenta?{' '}
              <Text style={{ color: colores.acento, fontWeight: '700' }}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colores.fondoTarjeta }]} />
          <Text style={[styles.dividerTexto, { color: colores.textoSecundario }]}>o continúa con</Text>
          <View style={[styles.dividerLine, { backgroundColor: colores.fondoTarjeta }]} />
        </View>

        {/* Botones sociales */}
        <View style={styles.sociales}>
          <TouchableOpacity
            style={[styles.botonSocial, { backgroundColor: colores.fondoTarjeta }, hayOperacion && styles.botonDeshabilitado]}
            onPress={manejarGoogle}
            disabled={hayOperacion}
          >
            <Text style={styles.googleG}>G</Text>
            <Text style={[styles.botonSocialTexto, { color: colores.texto }]}>
              {cargando === 'google' ? 'Conectando...' : 'Google'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botonSocial, { backgroundColor: '#1877F2' }, hayOperacion && styles.botonDeshabilitado]}
            onPress={manejarFacebook}
            disabled={hayOperacion}
          >
            <Ionicons name="logo-facebook" size={20} color="#fff" />
            <Text style={[styles.botonSocialTexto, { color: '#fff' }]}>
              {cargando === 'facebook' ? 'Conectando...' : 'Facebook'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Apple Sign In (solo iOS) */}
        {Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={14}
            style={styles.botonApple}
            onPress={manejarApple}
          />
        )}

        <Text style={[styles.legal, { color: colores.textoSecundario }]}>
          Al continuar, aceptas nuestros Términos de uso y Política de privacidad
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 32 },
  emoji: { fontSize: 56, marginBottom: 12 },
  titulo: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  subtitulo: { fontSize: 15, textAlign: 'center', marginTop: 6 },
  card: { borderRadius: 20, padding: 20, marginBottom: 20 },
  cardTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  input: { flex: 1, fontSize: 15 },
  botonPrimario: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, padding: 15, marginTop: 6 },
  botonDeshabilitado: { opacity: 0.6 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkContainer: { alignItems: 'center', marginTop: 14 },
  link: { fontSize: 14 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1 },
  dividerTexto: { fontSize: 13 },
  sociales: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  botonSocial: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, padding: 14 },
  googleG: { fontSize: 18, fontWeight: 'bold', color: '#4285F4' },
  botonSocialTexto: { fontSize: 14, fontWeight: '600' },
  botonApple: { height: 50, marginBottom: 12 },
  legal: { fontSize: 11, textAlign: 'center', marginTop: 16, lineHeight: 16 },
});
