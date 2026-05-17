import { useTema } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert, Animated, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';

const slides = [
  {
    emoji: '📔',
    titulo: 'Tu espacio para entenderte',
    descripcion: 'Escribe lo que sientes, sin juicios. Tu diario te escucha y te ayuda a crecer.',
    gradiente: ['#7c6af7', '#5a4fd1'] as [string, string],
    acento: '#c4beff',
  },
  {
    emoji: '✨',
    titulo: 'IA que reflexiona contigo',
    descripcion: 'Cada entrada recibe una reflexión personalizada según tus emociones y tu camino.',
    gradiente: ['#1a8a7a', '#0d6b5e'] as [string, string],
    acento: '#7fffd4',
  },
  {
    emoji: '🔒',
    titulo: 'Solo tuyo, siempre',
    descripcion: 'Tu diario es completamente privado. Lo que escribes aquí no lo ve nadie más.',
    gradiente: ['#c0392b', '#96281b'] as [string, string],
    acento: '#ffb3ae',
  },
];

const caminos = [
  {
    id: 'biblica',
    emoji: '📖',
    titulo: 'Fe y Espiritualidad',
    descripcion: 'Reflexiones que conectan con Dios, la Biblia y la vida espiritual',
    gradiente: ['#7c6af7', '#5a4fd1'] as [string, string],
  },
  {
    id: 'mindfulness',
    emoji: '🧘',
    titulo: 'Mindfulness',
    descripcion: 'Calma, presencia y bienestar emocional',
    gradiente: ['#1a8a7a', '#0d6b5e'] as [string, string],
  },
  {
    id: 'filosofia',
    emoji: '🌱',
    titulo: 'Filosofía y Crecimiento',
    descripcion: 'Pensamiento profundo y desarrollo personal',
    gradiente: ['#d4820a', '#a8620a'] as [string, string],
  },
  {
    id: 'todo',
    emoji: '✨',
    titulo: 'Libre y abierto',
    descripcion: 'Sin enfoque fijo — reflexiones variadas según el momento',
    gradiente: ['#555', '#333'] as [string, string],
  },
];

const generos = ['Masculino', 'Femenino', 'Prefiero no decir'];

export default function Onboarding() {
  const { colores } = useTema();
  const router = useRouter();
  const [paso, setPaso] = useState(0);
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [cumpleanos, setCumpleanos] = useState('');
  const [genero, setGenero] = useState('');
  const [caminoSeleccionado, setCaminoSeleccionado] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [completado, setCompletado] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const completadoScale = useRef(new Animated.Value(0)).current;
  const completadoOpacity = useRef(new Animated.Value(0)).current;

  const totalPasos = slides.length + 3;
  const esSlideIntro = paso < slides.length;
  const esUltimoPaso = paso === totalPasos - 1;

  useEffect(() => {
    if (!esSlideIntro) return;
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    scaleAnim.setValue(0.85);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 12, useNativeDriver: true }),
    ]).start();
  }, [paso]);

  useEffect(() => {
    if (completado) {
      Animated.parallel([
        Animated.spring(completadoScale, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
        Animated.timing(completadoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();
    }
  }, [completado]);

  const validarPaso = () => {
    if (paso === slides.length) {
      if (!nombre.trim()) { Alert.alert('Campo requerido', 'Por favor escribe tu nombre'); return false; }
      if (!edad.trim()) { Alert.alert('Campo requerido', 'Por favor escribe tu edad'); return false; }
    }
    if (paso === slides.length + 1) {
      if (!genero) { Alert.alert('Campo requerido', 'Por favor selecciona una opción'); return false; }
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
    if (!validarPaso() || guardando) return;
    setGuardando(true);
    try {
      await AsyncStorage.setItem('perfil', JSON.stringify({
        nombre, edad, cumpleanos, genero,
        camino: caminoSeleccionado,
        foto: null,
      }));
      await AsyncStorage.setItem('onboarding_completado', 'true');
      setCompletado(true);
      setTimeout(() => router.replace('/(tabs)'), 2800);
    } catch {
      Alert.alert('Error', 'No se pudo guardar tu perfil. Intenta de nuevo.');
      setGuardando(false);
    }
  };

  if (completado) {
    return (
      <LinearGradient colors={['#7c6af7', '#4a3fa8']} style={styles.completadoContainer}>
        <Animated.View style={[styles.completadoContenido, { opacity: completadoOpacity, transform: [{ scale: completadoScale }] }]}>
          <Text style={styles.completadoEmoji}>🎉</Text>
          <Text style={styles.completadoTitulo}>¡Listo, {nombre}!</Text>
          <Text style={styles.completadoSub}>Tu diario te espera.</Text>
          <View style={styles.completadoBarra}>
            <Animated.View style={[styles.completadoBarraFill, { width: completadoOpacity.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
          </View>
        </Animated.View>
      </LinearGradient>
    );
  }

  const renderPasoFormulario = () => {
    if (paso === slides.length) {
      return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.formSlide, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.formEmoji}>👋</Text>
            <Text style={[styles.formTitulo, { color: colores.texto }]}>¿Cómo te llamas?</Text>
            <Text style={[styles.formSub, { color: colores.textoSecundario }]}>
              Así podemos hablar contigo de forma más personal.
            </Text>
            <View style={styles.inputsContainer}>
              <View style={styles.inputWrapper}>
                <Text style={[styles.inputLabel, { color: colores.textoSecundario }]}>Nombre *</Text>
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
                <Text style={[styles.inputLabel, { color: colores.textoSecundario }]}>Cumpleaños (opcional)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colores.fondoTarjeta, color: colores.texto, borderColor: cumpleanos ? colores.acento : 'transparent' }]}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={colores.textoSecundario}
                  value={cumpleanos}
                  onChangeText={(t) => {
                    const n = t.replace(/\D/g, '');
                    let f = n;
                    if (n.length >= 3 && n.length <= 4) f = n.slice(0, 2) + '/' + n.slice(2);
                    else if (n.length >= 5) f = n.slice(0, 2) + '/' + n.slice(2, 4) + '/' + n.slice(4, 8);
                    setCumpleanos(f);
                  }}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      );
    }

    if (paso === slides.length + 1) {
      return (
        <Animated.View style={[styles.formSlide, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.formEmoji}>🙋</Text>
          <Text style={[styles.formTitulo, { color: colores.texto }]}>¿Cómo te identificas?</Text>
          <Text style={[styles.formSub, { color: colores.textoSecundario }]}>
            Esto nos ayuda a personalizar tu experiencia.
          </Text>
          <View style={styles.generosContainer}>
            {generos.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.generoBadge, { backgroundColor: colores.fondoTarjeta, borderColor: genero === g ? colores.acento : 'transparent' }]}
                onPress={() => setGenero(g)}
              >
                <Text style={[styles.generoTexto, { color: genero === g ? colores.acento : colores.texto }]}>{g}</Text>
                {genero === g && <Ionicons name="checkmark-circle" size={20} color={colores.acento} />}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      );
    }

    if (paso === slides.length + 2) {
      return (
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={[styles.formEmoji, { textAlign: 'center' }]}>🌟</Text>
            <Text style={[styles.formTitulo, { color: colores.texto, textAlign: 'center' }]}>
              ¿Qué tipo de reflexiones quieres?
            </Text>
            <Text style={[styles.formSub, { color: colores.textoSecundario, textAlign: 'center', marginBottom: 20 }]}>
              Puedes cambiarlo cuando quieras.
            </Text>
            {caminos.map((camino) => {
              const seleccionado = caminoSeleccionado === camino.id;
              return (
                <TouchableOpacity
                  key={camino.id}
                  onPress={() => setCaminoSeleccionado(camino.id)}
                  style={styles.caminoWrapper}
                >
                  {seleccionado ? (
                    <LinearGradient colors={camino.gradiente} style={styles.caminoTarjeta}>
                      <Text style={styles.caminoEmoji}>{camino.emoji}</Text>
                      <View style={styles.caminoTexto}>
                        <Text style={[styles.caminoTitulo, { color: '#fff' }]}>{camino.titulo}</Text>
                        <Text style={[styles.caminoDescripcion, { color: '#ffffff99' }]}>{camino.descripcion}</Text>
                      </View>
                      <Ionicons name="checkmark-circle" size={24} color="#fff" />
                    </LinearGradient>
                  ) : (
                    <View style={[styles.caminoTarjeta, { backgroundColor: colores.fondoTarjeta }]}>
                      <Text style={styles.caminoEmoji}>{camino.emoji}</Text>
                      <View style={styles.caminoTexto}>
                        <Text style={[styles.caminoTitulo, { color: colores.texto }]}>{camino.titulo}</Text>
                        <Text style={[styles.caminoDescripcion, { color: colores.textoSecundario }]}>{camino.descripcion}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colores.textoSecundario} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        </ScrollView>
      );
    }
  };

  if (esSlideIntro) {
    const slide = slides[paso];
    return (
      <LinearGradient colors={slide.gradiente} style={styles.slideContainer}>
        <View style={styles.indicadores}>
          {Array.from({ length: totalPasos }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.indicador,
                { backgroundColor: i <= paso ? '#fff' : '#ffffff40' },
                i === paso && { width: 24 },
              ]}
            />
          ))}
        </View>

        <Animated.View style={[styles.slideContenido, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>
          <View style={styles.slideIconoContainer}>
            <Text style={styles.slideEmoji}>{slide.emoji}</Text>
          </View>
          <Text style={styles.slideTitulo}>{slide.titulo}</Text>
          <Text style={[styles.slideDescripcion, { color: slide.acento }]}>{slide.descripcion}</Text>
        </Animated.View>

        <View style={styles.slideBotones}>
          <TouchableOpacity
            style={styles.botonPrimarioBlanco}
            onPress={siguiente}
          >
            <Text style={[styles.botonPrimarioBlancoTexto, { color: slide.gradiente[0] }]}>Continuar</Text>
            <Ionicons name="arrow-forward" size={18} color={slide.gradiente[0]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPaso(slides.length)} style={styles.saltar}>
            <Text style={styles.saltarTexto}>Saltar introducción</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colores.fondo }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={20}
    >
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

      <View style={styles.contenido}>
        {renderPasoFormulario()}
      </View>

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
          style={[styles.botonPrimario, { backgroundColor: guardando ? colores.fondoTarjeta : colores.acento }]}
          onPress={esUltimoPaso ? finalizar : siguiente}
          disabled={guardando}
        >
          <Text style={styles.botonPrimarioTexto}>
            {guardando ? 'Guardando...' : esUltimoPaso ? '¡Empezar mi diario! 🚀' : 'Continuar'}
          </Text>
          {!esUltimoPaso && !guardando && <Ionicons name="arrow-forward" size={18} color="#fff" />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  slideContainer: { flex: 1, paddingHorizontal: 28, paddingTop: 60, paddingBottom: 50, justifyContent: 'space-between' },
  slideContenido: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  slideIconoContainer: { width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  slideEmoji: { fontSize: 64 },
  slideTitulo: { fontSize: 30, fontWeight: 'bold', color: '#fff', textAlign: 'center', lineHeight: 38 },
  slideDescripcion: { fontSize: 16, textAlign: 'center', lineHeight: 24, paddingHorizontal: 8 },
  slideBotones: { gap: 12 },
  botonPrimarioBlanco: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 18, padding: 18 },
  botonPrimarioBlancoTexto: { fontSize: 17, fontWeight: 'bold' },
  saltar: { alignItems: 'center', paddingVertical: 8 },
  saltarTexto: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  indicadores: { flexDirection: 'row', gap: 6, marginBottom: 32, justifyContent: 'center' },
  indicador: { height: 6, width: 8, borderRadius: 3 },
  contenido: { flex: 1, justifyContent: 'center' },
  formSlide: { alignItems: 'center', gap: 12 },
  formEmoji: { fontSize: 52, marginBottom: 4 },
  formTitulo: { fontSize: 26, fontWeight: 'bold', textAlign: 'center' },
  formSub: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  inputsContainer: { width: '100%', gap: 12, marginTop: 16 },
  inputWrapper: { width: '100%' },
  inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { width: '100%', borderRadius: 14, padding: 16, fontSize: 16, borderWidth: 2 },
  generosContainer: { width: '100%', gap: 10, marginTop: 16 },
  generoBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, padding: 18, borderWidth: 2 },
  generoTexto: { fontSize: 16, fontWeight: '600' },
  caminoWrapper: { marginBottom: 12 },
  caminoTarjeta: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, padding: 16, gap: 12 },
  caminoEmoji: { fontSize: 32 },
  caminoTexto: { flex: 1 },
  caminoTitulo: { fontSize: 15, fontWeight: 'bold', marginBottom: 3 },
  caminoDescripcion: { fontSize: 12, lineHeight: 18 },
  botones: { flexDirection: 'row', gap: 12, marginTop: 24 },
  botonSecundario: { padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  botonPrimario: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 16 },
  botonPrimarioTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  completadoContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  completadoContenido: { alignItems: 'center', gap: 16, paddingHorizontal: 40 },
  completadoEmoji: { fontSize: 80 },
  completadoTitulo: { color: '#fff', fontSize: 30, fontWeight: 'bold', textAlign: 'center' },
  completadoSub: { color: 'rgba(255,255,255,0.75)', fontSize: 17, textAlign: 'center' },
  completadoBarra: { marginTop: 24, width: 200, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden' },
  completadoBarraFill: { height: 4, backgroundColor: '#fff', borderRadius: 2 },
});
