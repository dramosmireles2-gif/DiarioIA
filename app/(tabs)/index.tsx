import { useTema } from '@/contexts/ThemeContext';
import { generarReflexion } from '@/services/ia';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Entrada = {
  id: string;
  texto: string;
  fecha: string;
  emocion: string | null;
  destacada: boolean;
};

const emociones = [
  { emoji: '😄', label: 'Genial', color: '#f5c518' },
  { emoji: '🙂', label: 'Bien', color: '#4ecdc4' },
  { emoji: '😐', label: 'Neutral', color: '#9b9b9b' },
  { emoji: '😢', label: 'Triste', color: '#74b9ff' },
  { emoji: '😠', label: 'Enojado', color: '#ff6b6b' },
  { emoji: '😴', label: 'Cansado', color: '#a29bfe' },
];

const emocionEmoji: { [key: string]: string } = {
  'Genial': '😄', 'Bien': '🙂', 'Neutral': '😐',
  'Triste': '😢', 'Enojado': '😠', 'Cansado': '😴',
};

export default function Inicio() {
  const { colores } = useTema();
  const router = useRouter();
  const [perfil, setPerfil] = useState<any>(null);
  const [ultimaEntrada, setUltimaEntrada] = useState<Entrada | null>(null);
  const [racha, setRacha] = useState(0);
  const [totalEntradas, setTotalEntradas] = useState(0);
  const [emocionSeleccionada, setEmocionSeleccionada] = useState<string | null>(null);
  const [estadoSemana, setEstadoSemana] = useState('Sin datos');
  const [reflexionIA, setReflexionIA] = useState<string | null>(null);
  const [cargandoReflexion, setCargandoReflexion] = useState(false);

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  const cargarDatos = async () => {
    const perfilGuardado = await AsyncStorage.getItem('perfil');
    const entradasGuardadas = await AsyncStorage.getItem('entradas');
    const reflexionGuardada = await AsyncStorage.getItem('reflexion_diaria');
    const fechaReflexion = await AsyncStorage.getItem('reflexion_fecha');

    if (perfilGuardado) setPerfil(JSON.parse(perfilGuardado));

    if (entradasGuardadas) {
      const entradas: Entrada[] = JSON.parse(entradasGuardadas);
      setTotalEntradas(entradas.length);
      if (entradas.length > 0) {
        const ordenadas = [...entradas].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        setUltimaEntrada(ordenadas[0]);
        calcularRacha(ordenadas);
        calcularEstadoSemana(entradas);
      }
    }

    // Cargar reflexión del día (si ya se generó hoy)
    const hoy = new Date().toDateString();
    if (reflexionGuardada && fechaReflexion === hoy) {
      setReflexionIA(reflexionGuardada);
    } else if (perfilGuardado && entradasGuardadas) {
      const entradas: Entrada[] = JSON.parse(entradasGuardadas);
      if (entradas.length > 0) {
        generarReflexionDiaria(JSON.parse(perfilGuardado), entradas);
      }
    }
  };

  const generarReflexionDiaria = async (perfilData: any, entradas: Entrada[]) => {
    setCargandoReflexion(true);
    try {
      const ultimaEntradaTexto = entradas[0]?.texto || 'Hoy es un nuevo día';
      const reflexion = await generarReflexion(
        `Genera una reflexión inspiradora para comenzar el día. Contexto de mi última entrada: "${ultimaEntradaTexto.substring(0, 200)}"`,
        perfilData.camino || 'todo',
        entradas[0]?.emocion || null
      );
      setReflexionIA(reflexion);
      await AsyncStorage.setItem('reflexion_diaria', reflexion);
      await AsyncStorage.setItem('reflexion_fecha', new Date().toDateString());
    } catch {
      setReflexionIA(null);
    }
    setCargandoReflexion(false);
  };

  const calcularRacha = (entradas: Entrada[]) => {
    const fechas = entradas
      .map((e) => new Date(e.fecha).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let rachaTemp = 0;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    for (let i = 0; i < fechas.length; i++) {
      const fecha = new Date(fechas[i]);
      fecha.setHours(0, 0, 0, 0);
      const diffDias = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDias === i) rachaTemp++;
      else break;
    }
    setRacha(rachaTemp);
  };

  const calcularEstadoSemana = (entradas: Entrada[]) => {
    const hace7dias = new Date();
    hace7dias.setDate(hace7dias.getDate() - 7);
    const recientes = entradas.filter((e) => new Date(e.fecha) >= hace7dias);
    const conteo: { [key: string]: number } = {};
    recientes.forEach((e) => { if (e.emocion) conteo[e.emocion] = (conteo[e.emocion] || 0) + 1; });
    if (Object.keys(conteo).length > 0) {
      setEstadoSemana(Object.entries(conteo).sort((a, b) => b[1] - a[1])[0][0]);
    }
  };

  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colores.fondo }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.saludo, { color: colores.texto }]}>
            {saludo}, {perfil?.nombre || 'amigo'} 👋
          </Text>
          <Text style={[styles.saludoSub, { color: colores.textoSecundario }]}>¿Cómo te sientes hoy?</Text>
          <Text style={[styles.saludoSub2, { color: colores.textoSecundario }]}>Tu bienestar es importante ✨</Text>
        </View>
      </View>

      {/* Selector de emoción */}
      <View style={[styles.card, { backgroundColor: colores.fondoTarjeta }]}>
        <Text style={[styles.cardTitulo, { color: colores.texto }]}>Elige tu estado de ánimo</Text>
        <View style={styles.emocionesGrid}>
          {emociones.map((e) => {
            const seleccionada = emocionSeleccionada === e.label;
            return (
              <TouchableOpacity
                key={e.label}
                style={styles.emocionItem}
                onPress={() => {
                  setEmocionSeleccionada(seleccionada ? null : e.label);
                  router.push('/(tabs)/nueva_entrada');
                }}
              >
                <View style={[styles.emocionCirculo, { backgroundColor: e.color + '25' }, seleccionada && { borderColor: e.color, borderWidth: 2 }]}>
                  <Text style={styles.emocionEmoji}>{e.emoji}</Text>
                </View>
                <Text style={[styles.emocionLabel, { color: seleccionada ? e.color : colores.textoSecundario }]}>
                  {e.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.emocionHint}>
          <Ionicons name="sparkles" size={12} color={colores.acento} />
          <Text style={[styles.emocionHintTexto, { color: colores.acento }]}>Tu estado de ánimo nos ayuda a entenderte mejor</Text>
        </View>
      </View>

      {/* Botón escribir */}
      <TouchableOpacity
        style={[styles.botonEscribir, { backgroundColor: colores.acento }]}
        onPress={() => router.push('/(tabs)/nueva_entrada')}
      >
        <View style={[styles.botonIcono, { backgroundColor: '#ffffff30' }]}>
          <Ionicons name="pencil-outline" size={22} color="#fff" />
        </View>
        <View style={styles.botonTextoContainer}>
          <Text style={styles.botonTitulo}>Escribir nueva entrada</Text>
          <Text style={styles.botonSub}>Cuenta lo que hay en tu corazón...</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Tu progreso */}
      <View style={styles.seccionHeader}>
        <Text style={[styles.seccionTitulo, { color: colores.texto }]}>Tu progreso</Text>
        <TouchableOpacity style={styles.verTodos} onPress={() => router.push('/(tabs)/perfil')}>
          <Text style={[styles.verTodosTexto, { color: colores.acento }]}>Ver estadísticas</Text>
          <Ionicons name="chevron-forward" size={14} color={colores.acento} />
        </TouchableOpacity>
      </View>
      <View style={styles.progresoGrid}>
        <View style={[styles.progresoCard, { backgroundColor: '#ff6b6b20' }]}>
          <Ionicons name="flame" size={24} color="#ff6b6b" />
          <Text style={[styles.progresoValor, { color: '#ff6b6b' }]}>{racha}</Text>
          <Text style={[styles.progresoLabel, { color: colores.textoSecundario }]}>días{'\n'}Racha actual</Text>
        </View>
        <View style={[styles.progresoCard, { backgroundColor: '#4ecdc420' }]}>
          <Ionicons name="book" size={24} color="#4ecdc4" />
          <Text style={[styles.progresoValor, { color: '#4ecdc4' }]}>{totalEntradas}</Text>
          <Text style={[styles.progresoLabel, { color: colores.textoSecundario }]}>Entradas{'\n'}escritas</Text>
        </View>
        <View style={[styles.progresoCard, { backgroundColor: '#f5c51820' }]}>
          <Text style={styles.progresoEmoji}>{emocionEmoji[estadoSemana] || '😊'}</Text>
          <Text style={[styles.progresoValor, { color: '#f5c518', fontSize: 13 }]}>{estadoSemana}</Text>
          <Text style={[styles.progresoLabel, { color: colores.textoSecundario }]}>Estado promedio{'\n'}esta semana</Text>
        </View>
      </View>

      {/* Última entrada */}
      {ultimaEntrada && (
        <>
          <View style={styles.seccionHeader}>
            <Text style={[styles.seccionTitulo, { color: colores.texto }]}>Tu última entrada</Text>
            <TouchableOpacity style={styles.verTodos} onPress={() => router.push('/(tabs)/Mis_Entradas')}>
              <Text style={[styles.verTodosTexto, { color: colores.acento }]}>Ver todas</Text>
              <Ionicons name="chevron-forward" size={14} color={colores.acento} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colores.fondoTarjeta }]}
            onPress={() => router.push('/(tabs)/Mis_Entradas')}
          >
            <View style={styles.entradaHeader}>
              <Text style={styles.entradaEmoji}>{emocionEmoji[ultimaEntrada.emocion || ''] || '📝'}</Text>
              <View style={styles.entradaFechaContainer}>
                <Text style={[styles.entradaFecha, { color: colores.textoSecundario }]}>
                  {new Date(ultimaEntrada.fecha).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Text>
                <Text style={[styles.entradaHora, { color: colores.textoSecundario }]}>
                  · {new Date(ultimaEntrada.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colores.textoSecundario} />
            </View>
            <Text style={[styles.entradaTitulo, { color: colores.texto }]} numberOfLines={1}>
              {ultimaEntrada.texto.split('\n')[0] || ultimaEntrada.texto.substring(0, 50)}
            </Text>
            <Text style={[styles.entradaPreview, { color: colores.textoSecundario }]} numberOfLines={2}>
              {ultimaEntrada.texto.substring(0, 120)}
            </Text>
            <View style={styles.entradaFooter}>
              <View style={styles.entradaStat}>
                <Ionicons name="document-text-outline" size={12} color={colores.textoSecundario} />
                <Text style={[styles.entradaStatTexto, { color: colores.textoSecundario }]}>
                  {ultimaEntrada.texto.split(' ').filter(Boolean).length} palabras
                </Text>
              </View>
              <View style={styles.entradaStat}>
                <Ionicons name="time-outline" size={12} color={colores.textoSecundario} />
                <Text style={[styles.entradaStatTexto, { color: colores.textoSecundario }]}>1 min lectura</Text>
              </View>
            </View>
          </TouchableOpacity>
        </>
      )}

      {/* Reflexión del día con IA */}
      <View style={[styles.reflexionCard, { backgroundColor: colores.fondoTarjeta }]}>
        <View style={styles.reflexionHeader}>
          <Ionicons name="sparkles" size={18} color={colores.acento} />
          <Text style={[styles.reflexionTitulo, { color: colores.texto }]}>Reflexión del día ✨</Text>
        </View>
        {cargandoReflexion ? (
          <Text style={[styles.reflexionTexto, { color: colores.textoSecundario }]}>
            La IA está generando tu reflexión personalizada...
          </Text>
        ) : reflexionIA ? (
          <Text style={[styles.reflexionTexto, { color: colores.textoSecundario }]}>{reflexionIA}</Text>
        ) : (
          <Text style={[styles.reflexionTexto, { color: colores.textoSecundario }]}>
            Escribe tu primera entrada para recibir reflexiones personalizadas 💜
          </Text>
        )}
        {reflexionIA && !cargandoReflexion && (
          <TouchableOpacity
            style={[styles.reflexionBtn, { backgroundColor: colores.acento + '20' }]}
            onPress={() => {
              setReflexionIA(null);
              AsyncStorage.removeItem('reflexion_diaria');
              AsyncStorage.removeItem('reflexion_fecha');
              if (perfil && ultimaEntrada) {
                generarReflexionDiaria(perfil, ultimaEntrada ? [ultimaEntrada] : []);
              }
            }}
          >
            <Ionicons name="refresh-outline" size={14} color={colores.acento} />
            <Text style={[styles.reflexionBtnTexto, { color: colores.acento }]}>Nueva reflexión</Text>
          </TouchableOpacity>
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  saludo: { fontSize: 24, fontWeight: 'bold' },
  saludoSub: { fontSize: 14, marginTop: 2 },
  saludoSub2: { fontSize: 13, marginTop: 1 },
  headerBtn: { padding: 10, borderRadius: 12 },
  card: { borderRadius: 16, padding: 16, marginBottom: 16 },
  cardTitulo: { fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  verTodos: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  verTodosTexto: { fontSize: 13 },
  emocionesGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  emocionItem: { alignItems: 'center', gap: 6 },
  emocionCirculo: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  emocionEmoji: { fontSize: 26 },
  emocionLabel: { fontSize: 11 },
  emocionHint: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center' },
  emocionHintTexto: { fontSize: 12 },
  botonEscribir: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, padding: 16, marginBottom: 16 },
  botonIcono: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  botonTextoContainer: { flex: 1 },
  botonTitulo: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  botonSub: { color: '#ffffff99', fontSize: 12, marginTop: 2 },
  seccionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seccionTitulo: { fontSize: 16, fontWeight: 'bold' },
  progresoGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  progresoCard: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', gap: 4 },
  progresoValor: { fontSize: 22, fontWeight: 'bold' },
  progresoEmoji: { fontSize: 24 },
  progresoLabel: { fontSize: 10, textAlign: 'center' },
  entradaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  entradaEmoji: { fontSize: 20 },
  entradaFechaContainer: { flex: 1, flexDirection: 'row', flexWrap: 'wrap' },
  entradaFecha: { fontSize: 12, textTransform: 'capitalize' },
  entradaHora: { fontSize: 12 },
  entradaTitulo: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  entradaPreview: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  entradaFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  entradaStat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  entradaStatTexto: { fontSize: 11 },
  reflexionCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
  reflexionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  reflexionTitulo: { fontSize: 15, fontWeight: 'bold' },
  reflexionTexto: { fontSize: 14, lineHeight: 22, fontStyle: 'italic' },
  reflexionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start', marginTop: 12 },
  reflexionBtnTexto: { fontSize: 12, fontWeight: '600' },
});