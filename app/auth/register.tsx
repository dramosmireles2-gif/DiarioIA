import { useTema } from '@/contexts/ThemeContext';
import { registrarConEmail } from '@/services/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Register() {
  const { colores } = useTema();
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  const manejarRegistro = async () => {
    if (!nombre.trim() || !email.trim() || !password || !confirmar) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña muy corta', 'Debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmar) {
      Alert.alert('Contraseñas no coinciden', 'Verifica que ambas contraseñas sean iguales');
      return;
    }

    setCargando(true);
    try {
      await registrarConEmail(email.trim(), password, nombre.trim());
      Alert.alert(
        '¡Cuenta creada! 🎉',
        'Revisa tu correo para confirmar tu cuenta. Luego inicia sesión.',
        [{ text: 'Ir al login', onPress: () => router.replace('/auth/login') }]
      );
    } catch (e: any) {
      Alert.alert('Error al registrarse', tradurirError(e.message));
    } finally {
      setCargando(false);
    }
  };

  const tradurirError = (msg: string) => {
    if (msg.includes('already registered')) return 'Este correo ya tiene una cuenta';
    if (msg.includes('valid email')) return 'Ingresa un correo válido';
    if (msg.includes('Network')) return 'Sin conexión. Verifica tu internet';
    return msg;
  };

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
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colores.texto} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.emoji}>📖</Text>
          <Text style={[styles.titulo, { color: colores.texto }]}>Crear cuenta</Text>
          <Text style={[styles.subtitulo, { color: colores.textoSecundario }]}>
            Únete y comienza tu diario personal
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colores.fondoTarjeta }]}>
          {/* Nombre */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colores.textoSecundario }]}>Nombre</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colores.fondo }]}>
              <Ionicons name="person-outline" size={18} color={colores.textoSecundario} />
              <TextInput
                style={[styles.input, { color: colores.texto }]}
                placeholder="Tu nombre"
                placeholderTextColor={colores.textoSecundario}
                value={nombre}
                onChangeText={setNombre}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email */}
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

          {/* Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colores.textoSecundario }]}>Contraseña</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colores.fondo }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colores.textoSecundario} />
              <TextInput
                style={[styles.input, { color: colores.texto }]}
                placeholder="Mínimo 6 caracteres"
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

          {/* Confirmar contraseña */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colores.textoSecundario }]}>Confirmar contraseña</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colores.fondo, borderColor: confirmar && confirmar !== password ? '#ff6b6b' : 'transparent', borderWidth: 1 }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colores.textoSecundario} />
              <TextInput
                style={[styles.input, { color: colores.texto }]}
                placeholder="Repite tu contraseña"
                placeholderTextColor={colores.textoSecundario}
                value={confirmar}
                onChangeText={setConfirmar}
                secureTextEntry={!mostrarPassword}
                autoCapitalize="none"
              />
              {confirmar.length > 0 && (
                <Ionicons
                  name={confirmar === password ? 'checkmark-circle' : 'close-circle'}
                  size={18}
                  color={confirmar === password ? '#4ecdc4' : '#ff6b6b'}
                />
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.botonPrimario, { backgroundColor: colores.acento }, cargando && styles.botonDeshabilitado]}
            onPress={manejarRegistro}
            disabled={cargando}
          >
            {cargando ? (
              <Text style={styles.botonTexto}>Creando cuenta...</Text>
            ) : (
              <>
                <Ionicons name="person-add-outline" size={18} color="#fff" />
                <Text style={styles.botonTexto}>Crear cuenta</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/auth/login')} style={styles.linkContainer}>
            <Text style={[styles.link, { color: colores.textoSecundario }]}>
              ¿Ya tienes cuenta?{' '}
              <Text style={{ color: colores.acento, fontWeight: '700' }}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.legal, { color: colores.textoSecundario }]}>
          Al registrarte, aceptas nuestros Términos de uso y Política de privacidad
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  back: { marginBottom: 20 },
  header: { alignItems: 'center', marginBottom: 28 },
  emoji: { fontSize: 52, marginBottom: 12 },
  titulo: { fontSize: 26, fontWeight: 'bold', textAlign: 'center' },
  subtitulo: { fontSize: 14, textAlign: 'center', marginTop: 6 },
  card: { borderRadius: 20, padding: 20, marginBottom: 20 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  input: { flex: 1, fontSize: 15 },
  botonPrimario: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, padding: 15, marginTop: 6 },
  botonDeshabilitado: { opacity: 0.6 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkContainer: { alignItems: 'center', marginTop: 14 },
  link: { fontSize: 14 },
  legal: { fontSize: 11, textAlign: 'center', lineHeight: 16 },
});
