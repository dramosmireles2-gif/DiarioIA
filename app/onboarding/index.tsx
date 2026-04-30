import { useTema } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';

const caminos = [
  { id: 'biblica', emoji: '📖', titulo: 'Reflexiones Bíblicas', descripcion: 'Versículos y reflexiones de la Biblia según cómo te sientes' },
  { id: 'mindfulness', emoji: '🧘', titulo: 'Mindfulness', descripcion: 'Meditación, calma y bienestar emocional' },
  { id: 'filosofia', emoji: '🌱', titulo: 'Filosofía', descripcion: 'Reflexiones de pensadores y crecimiento personal' },
  { id: 'todo', emoji: '✨', titulo: 'Un poco de todo', descripcion: 'Mezcla de todas las anteriores según el día' },
];

const generos = ['Masculino', 'Femenino', 'Prefiero no decir'];

const slides = [
  { emoji: '✨', titulo: 'Bienvenido a tu Diario con IA', descripcion: 'Un espacio seguro para reflexionar, entender tus emociones y crecer cada día.', color: '#7c6af7' },
  { emoji: '🧠', titulo: 'IA que te entiende', descripcion: 'Nuestra IA analiza tus entradas y te da reflexiones personalizadas según cómo te sientes.', color: '#4ecdc4' },
  { emoji: '🔒', titulo: 'Privado y seguro', descripcion: 'Tu diario es completamente privado. Nadie más puede ver lo que escribes.', color: '#ff6b6b' },
];

export default function Onboarding() {
  const { colores } = useTema();
  const router = useRouter();
  const [paso, setPaso] = useState(0);
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [cumpleanos, setCumpleanos] = useState('');
  const [genero, setGenero] = useState('');
  const [caminoSeleccionado, setCaminoSeleccionado] = useState<string | null>(null);

  const totalPasos = slides.length + 3; // slides + datos + genero + camino

  const validarPaso = () => {
    if (paso === slides.length) {
      if (!nombre.trim()) { Alert.alert('Campo requerido', 'Por favor escribe tu nombre'); return false; }
      if (!edad.trim()) { Alert.alert('Campo requerido', 'Por favor escribe tu edad'); return false; }
      if (!cumpleanos.trim()) { Alert.alert('Campo requerido', 'Por favor escribe tu fecha de cumpleaños'); return false; }
    }
    if (paso === slides.length + 1) {
      if (!genero) { Alert.alert('Campo requerido', 'Por favor selecciona tu género'); return false; }
    }
    if (paso === slides.length + 2) {
      if (!caminoSeleccionado) { Alert.alert('Campo requerido', 'Por favor elige tu tipo de reflexiones'); return false; }
    }
    return true;
  };

  const siguiente = () => {
    if (!validarPaso()) return;
    if (paso < totalPasos - 1) setPaso(paso + 1);
  };

  const anterior = () => {
    if (paso > 0) setPaso(paso - 1);
  };

  const finalizar = async () => {
    if (!validarPaso()) return;
    await AsyncStorage.setItem('onboarding_completado', 'true');
    await AsyncStorage.setItem('perfil', JSON.stringify({
      nombre, edad, cumpleanos, genero,
      camino: caminoSeleccionado,
      foto: null,
    }));
    router.replace('/(tabs)');
  };

  const renderPaso = () => {
    // Slides informativos
    if (paso < slides.length) {
      const slide = slides[paso];
      return (
        <View style={styles.slide}>
          <View style={[styles.slideIcono, { backgroundColor: slide.color + '20' }]}>
            <Text style={styles.slideEmoji}>{slide.emoji}</Text>
          </View>
          <Text style={[styles.slideTitulo, { color: colores.texto }]}>{slide.titulo}</Text>
          <Text style={[styles.slideDescripcion, { color: colores.textoSecundario }]}>{slide.descripcion}</Text>
        </View>
      );
    }

    // Paso datos básicos
    if (paso === slides.length) {
      return (
        <View style={styles.slide}>
          <Text style={styles.slideEmoji}>👋</Text>
          <Text style={[styles.slideTitulo, { color: colores.texto }]}>Cuéntanos sobre ti</Text>
          <Text style={[styles.slideDescripcion, { color: colores.textoSecundario }]}>
            Estos datos son necesarios para personalizar tu experiencia.
          </Text>
          <View style={styles.inputsContainer}>
            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: colores.textoSecundario }]}>Nombre completo *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colores.fondoTarjeta, color: colores.texto, borderColor: nombre ? colores.acento : 'transparent' }]}
                placeholder="Tu nombre"
                placeholderTextColor={colores.textoSecundario}
                value={nombre}
                onChangeText={setNombre}
                maxLength={50}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: colores.textoSecundario }]}>Edad *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colores.fondoTarjeta, color: colores.texto, borderColor: edad ? colores.acento : 'transparent' }]}
                placeholder="Tu edad"
                placeholderTextColor={colores.textoSecundario}
                value={edad}
                onChangeText={setEdad}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: colores.textoSecundario }]}>Fecha de cumpleaños *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colores.fondoTarjeta, color: colores.texto, borderColor: cumpleanos ? colores.acento : 'transparent' }]}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={colores.textoSecundario}
                value={cumpleanos}
                onChangeText={(texto) => {
                  const soloNumeros = texto.replace(/\D/g, '');
                  let formateado = soloNumeros;
                  if (soloNumeros.length >= 3 && soloNumeros.length <= 4) {
                    formateado = soloNumeros.slice(0, 2) + '/' + soloNumeros.slice(2);
                  } else if (soloNumeros.length >= 5) {
                    formateado = soloNumeros.slice(0, 2) + '/' + soloNumeros.slice(2, 4) + '/' + soloNumeros.slice(4, 8);
                  }
                  setCumpleanos(formateado);
                }}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>
        </View>
      );
    }

    // Paso género
    if (paso === slides.length + 1) {
      return (
        <View style={styles.slide}>
          <Text style={styles.slideEmoji}>🙋</Text>
          <Text style={[styles.slideTitulo, { color: colores.texto }]}>¿Cómo te identificas?</Text>
          <Text style={[styles.slideDescripcion, { color: colores.textoSecundario }]}>
            Esto nos ayuda a personalizar mejor tu experiencia.
          </Text>
          <View style={styles.generosContainer}>
            {generos.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.generoBadge, { backgroundColor: colores.fondoTarjeta, borderColor: genero === g ? colores.acento : 'transparent' }]}
                onPress={() => setGenero(g)}
              >
                <Text style={[styles.generoTexto, { color: genero === g ? colores.acento : colores.textoSecundario }]}>{g}</Text>
                {genero === g && <Ionicons name="checkmark-circle" size={18} color={colores.acento} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    // Paso camino espiritual
    if (paso === slides.length + 2) {
      return (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[styles.slideEmoji, { textAlign: 'center' }]}>🌟</Text>
          <Text style={[styles.slideTitulo, { color: colores.texto, textAlign: 'center' }]}>
            ¿Qué reflexiones te gustarían?
          </Text>
          <Text style={[styles.slideDescripcion, { color: colores.textoSecundario, textAlign: 'center' }]}>
            Puedes cambiar esto cuando quieras desde tu perfil.
          </Text>
          {caminos.map((camino) => {
            const seleccionado = caminoSeleccionado === camino.id;
            return (
              <TouchableOpacity
                key={camino.id}
                style={[styles.caminoTarjeta, { backgroundColor: colores.fondoTarjeta, borderColor: seleccionado ? colores.acento : 'transparent' }]}
                onPress={() => setCaminoSeleccionado(camino.id)}
              >
                <Text style={styles.caminoEmoji}>{camino.emoji}</Text>
                <View style={styles.caminoTexto}>
                  <Text style={[styles.caminoTitulo, { color: colores.texto }]}>{camino.titulo}</Text>
                  <Text style={[styles.caminoDescripcion, { color: colores.textoSecundario }]}>{camino.descripcion}</Text>
                </View>
                {seleccionado && <Ionicons name="checkmark-circle" size={24} color={colores.acento} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      );
    }
  };

  const esUltimoPaso = paso === totalPasos - 1;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colores.fondo }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Indicadores de progreso */}
      <View style={styles.indicadores}>
        {Array.from({ length: totalPasos }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.indicador,
              { backgroundColor: i <= paso ? colores.acento : colores.fondoTarjeta },
              i === paso && { width: 24 },
            ]}
          />
        ))}
      </View>

      {/* Contenido */}
      <View style={styles.contenido}>
        {renderPaso()}
      </View>

      {/* Botones */}
      <View style={styles.botones}>
        {paso > 0 && (
          <TouchableOpacity
            style={[styles.botonSecundario, { backgroundColor: colores.fondoTarjeta }]}
            onPress={anterior}
          >
            <Ionicons name="arrow-back" size={20} color={colores.texto} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.botonPrimario, { backgroundColor: colores.acento }, paso === 0 && { flex: 1 }]}
          onPress={esUltimoPaso ? finalizar : siguiente}
        >
          <Text style={styles.botonPrimarioTexto}>
            {esUltimoPaso ? '¡Empezar mi diario! 🚀' : 'Continuar'}
          </Text>
          {!esUltimoPaso && <Ionicons name="arrow-forward" size={18} color="#fff" />}
        </TouchableOpacity>
      </View>

      {/* Saltar solo en slides */}
      {paso < slides.length && (
        <TouchableOpacity onPress={() => setPaso(slides.length)} style={styles.saltar}>
          <Text style={[styles.saltarTexto, { color: colores.textoSecundario }]}>Saltar introducción</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  indicadores: { flexDirection: 'row', gap: 6, marginBottom: 40, justifyContent: 'center' },
  indicador: { height: 6, width: 8, borderRadius: 3 },
  contenido: { flex: 1, justifyContent: 'center' },
  slide: { alignItems: 'center', gap: 16 },
  slideIcono: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  slideEmoji: { fontSize: 52, textAlign: 'center' },
  slideTitulo: { fontSize: 26, fontWeight: 'bold', textAlign: 'center' },
  slideDescripcion: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
  inputsContainer: { width: '100%', gap: 12, marginTop: 8 },
  inputWrapper: { width: '100%' },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { width: '100%', borderRadius: 14, padding: 14, fontSize: 16, borderWidth: 2 },
  generosContainer: { width: '100%', gap: 10, marginTop: 8 },
  generoBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, padding: 16, borderWidth: 2 },
  generoTexto: { fontSize: 16, fontWeight: '600' },
  caminoTarjeta: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 2, gap: 12 },
  caminoEmoji: { fontSize: 32 },
  caminoTexto: { flex: 1 },
  caminoTitulo: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  caminoDescripcion: { fontSize: 12 },
  botones: { flexDirection: 'row', gap: 12, marginTop: 24 },
  botonSecundario: { padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  botonPrimario: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 16 },
  botonPrimarioTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  saltar: { alignItems: 'center', marginTop: 12 },
  saltarTexto: { fontSize: 14 },
});