import { useTema } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions, ScrollView, StyleSheet, Text,
    TextInput, TouchableOpacity, View,
} from 'react-native';

const { width } = Dimensions.get('window');

const caminos = [
  { id: 'biblica', emoji: '📖', titulo: 'Reflexiones Bíblicas', descripcion: 'Versículos y reflexiones de la Biblia según cómo te sientes' },
  { id: 'mindfulness', emoji: '🧘', titulo: 'Mindfulness', descripcion: 'Meditación, calma y bienestar emocional' },
  { id: 'filosofia', emoji: '🌱', titulo: 'Filosofía', descripcion: 'Reflexiones de pensadores y crecimiento personal' },
  { id: 'todo', emoji: '✨', titulo: 'Un poco de todo', descripcion: 'Mezcla de todas las anteriores según el día' },
];

const slides = [
  {
    emoji: '✨',
    titulo: 'Bienvenido a tu Diario con IA',
    descripcion: 'Un espacio seguro para reflexionar, entender tus emociones y crecer cada día.',
    color: '#7c6af7',
  },
  {
    emoji: '🧠',
    titulo: 'IA que te entiende',
    descripcion: 'Nuestra IA analiza tus entradas y te da reflexiones personalizadas según cómo te sientes.',
    color: '#4ecdc4',
  },
  {
    emoji: '🔒',
    titulo: 'Privado y seguro',
    descripcion: 'Tu diario es completamente privado. Nadie más puede ver lo que escribes.',
    color: '#ff6b6b',
  },
];

export default function Onboarding() {
  const { colores } = useTema();
  const router = useRouter();
  const [paso, setPaso] = useState(0);
  const [nombre, setNombre] = useState('');
  const [caminoSeleccionado, setCaminoSeleccionado] = useState<string | null>(null);

  const totalPasos = slides.length + 2; // slides + nombre + camino

  const siguiente = () => {
    if (paso < totalPasos - 1) setPaso(paso + 1);
  };

  const anterior = () => {
    if (paso > 0) setPaso(paso - 1);
  };

  const finalizar = async () => {
    await AsyncStorage.setItem('onboarding_completado', 'true');
    await AsyncStorage.setItem('perfil', JSON.stringify({
      nombre,
      camino: caminoSeleccionado || 'todo',
      edad: '',
      correo: '',
      genero: '',
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

    // Paso nombre
    if (paso === slides.length) {
      return (
        <View style={styles.slide}>
          <Text style={styles.slideEmoji}>👋</Text>
          <Text style={[styles.slideTitulo, { color: colores.texto }]}>¿Cómo te llamas?</Text>
          <Text style={[styles.slideDescripcion, { color: colores.textoSecundario }]}>
            Así podré saludarte cada vez que abras tu diario.
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colores.fondoTarjeta, color: colores.texto, borderColor: nombre ? colores.acento : 'transparent' }]}
            placeholder="Tu nombre"
            placeholderTextColor={colores.textoSecundario}
            value={nombre}
            onChangeText={setNombre}
            autoFocus
            maxLength={30}
          />
        </View>
      );
    }

    // Paso camino espiritual
    if (paso === slides.length + 1) {
      return (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.slideEmoji}>🌟</Text>
          <Text style={[styles.slideTitulo, { color: colores.texto }]}>
            ¿Qué reflexiones te gustarían?
          </Text>
          <Text style={[styles.slideDescripcion, { color: colores.textoSecundario }]}>
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

  const puedeAvanzar = () => {
    if (paso === slides.length) return nombre.trim().length > 0;
    if (paso === slides.length + 1) return caminoSeleccionado !== null;
    return true;
  };

  const esUltimoPaso = paso === totalPasos - 1;

  return (
    <View style={[styles.container, { backgroundColor: colores.fondo }]}>

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
          style={[
            styles.botonPrimario,
            { backgroundColor: puedeAvanzar() ? colores.acento : colores.fondoTarjeta },
            paso === 0 && { flex: 1 },
          ]}
          onPress={esUltimoPaso ? finalizar : siguiente}
          disabled={!puedeAvanzar()}
        >
          <Text style={[styles.botonPrimarioTexto, { color: puedeAvanzar() ? '#fff' : colores.textoSecundario }]}>
            {esUltimoPaso ? '¡Empezar mi diario! 🚀' : 'Continuar'}
          </Text>
          {!esUltimoPaso && <Ionicons name="arrow-forward" size={18} color={puedeAvanzar() ? '#fff' : colores.textoSecundario} />}
        </TouchableOpacity>
      </View>

      {/* Saltar */}
      {paso < slides.length && (
        <TouchableOpacity onPress={() => setPaso(slides.length)} style={styles.saltar}>
          <Text style={[styles.saltarTexto, { color: colores.textoSecundario }]}>Saltar introducción</Text>
        </TouchableOpacity>
      )}

    </View>
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
  input: { width: '100%', borderRadius: 16, padding: 16, fontSize: 18, textAlign: 'center', marginTop: 8, borderWidth: 2 },
  caminoTarjeta: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 2, gap: 12 },
  caminoEmoji: { fontSize: 32 },
  caminoTexto: { flex: 1 },
  caminoTitulo: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  caminoDescripcion: { fontSize: 12 },
  botones: { flexDirection: 'row', gap: 12, marginTop: 24 },
  botonSecundario: { padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  botonPrimario: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 16 },
  botonPrimarioTexto: { fontSize: 16, fontWeight: 'bold' },
  saltar: { alignItems: 'center', marginTop: 12 },
  saltarTexto: { fontSize: 14 },
});