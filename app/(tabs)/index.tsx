import { useTema } from '@/contexts/ThemeContext';
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

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  const cargarDatos = async () => {
    const onboarding = await AsyncStorage.getItem('onboarding_completado');
    if (onboarding !== 'true') {
      router.replace('/onboarding' as any);
      return;
    }
    const perfilGuardado = await AsyncStorage.getItem('perfil');
    const entradasGuardadas = await AsyncStorage.getItem('entradas');
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
  };

  const calcularRacha = (entradas: Entrada[]) => {
    const fechas = entradas.map((e) => new Date(e.fecha).toDateString());
    const unicas = [...new Set(fechas)];
    let rachaTemp = 0;
    const hoy = new Date();
    for (let i = 0; i < unicas.length; i++) {
      const fecha = new Date(unicas[i]);
      const diff = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === i) rachaTemp++;
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

  const fraseDelDia = () => {
    if (!perfil?.camino) return 'Cada día es una nueva oportunidad para crecer ✨';
    const frases: any = {
      biblica: 'Todo lo puedo en Aquel que me fortalece — Filipenses 4:13 ✝️',
      mindfulness: 'Respira. Este momento es suficiente 🧘',
      filosofia: 'Conócete a ti mismo — Sócrates 🌱',
      todo: 'Cada día es una nueva oportunidad para crecer ✨',
    };
    return frases[perfil.camino];
  };

  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colores.fondo }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
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
        <View style={styles.headerBotones}>
          <TouchableOpacity style={[styles.headerBtn, { backgroundColor: colores.fondoTarjeta }]}>
            <Ionicons name="search-outline" size={20} color={colores.texto} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerBtn, { backgroundColor: colores.fondoTarjeta }]}>
            <Ionicons name="notifications-outline" size={20} color={colores.texto} />
          </TouchableOpacity>
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

      {/* Insights de IA */}
      <View style={[styles.card, { backgroundColor: colores.fondoTarjeta }]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Ionicons name="bulb-outline" size={18} color={colores.acento} />
            <Text style={[styles.cardTitulo, { color: colores.texto }]}>Insights de IA</Text>
          </View>
          <TouchableOpacity style={styles.verTodos}>
            <Text style={[styles.verTodosTexto, { color: colores.acento }]}>Ver todos</Text>
            <Ionicons name="chevron-forward" size={14} color={colores.acento} />
          </TouchableOpacity>
        </View>
        <View style={styles.insightContenido}>
          <View style={[styles.insightIcono, { backgroundColor: colores.acento + '20' }]}>
            <Ionicons name="sparkles" size={22} color={colores.acento} />
          </View>
          <Text style={[styles.insightTexto, { color: colores.textoSecundario }]}>
            Conecta la IA para obtener análisis personalizados de tus emociones 💜
          </Text>
        </View>
      </View>

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
                  {new Date(ultimaEntrada.fecha).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
                <Text style={[styles.entradaHora, { color: colores.textoSecundario }]}>
                  · {new Date(ultimaEntrada.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Ionicons name="ellipsis-vertical" size={16} color={colores.textoSecundario} />
            </View>
            <Text style={[styles.entradaTitulo, { color: colores.texto }]} numberOfLines={1}>
              {ultimaEntrada.texto.split('\n')[0] || ultimaEntrada.texto.substring(0, 50)}
            </Text>
            <Text style={[styles.entradaPreview, { color: colores.textoSecundario }]} numberOfLines={2}>
              {ultimaEntrada.texto.substring(0, 120)}...
            </Text>
            <View style={styles.entradaFooter}>
              <View style={[styles.etiqueta, { backgroundColor: colores.acento + '20' }]}>
                <Text style={[styles.etiquetaTexto, { color: colores.acento }]}>Próximamente IA</Text>
              </View>
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
              <Ionicons name="chevron-forward" size={14} color={colores.textoSecundario} />
            </View>
          </TouchableOpacity>
        </>
      )}

      {/* Frase del día */}
      <View style={[styles.fraseCard, { backgroundColor: colores.acento + '15', borderColor: colores.acento + '30' }]}>
        <View style={[styles.fraseIcono, { backgroundColor: colores.acento + '20' }]}>
          <Ionicons name="sparkles" size={20} color={colores.acento} />
        </View>
        <View style={styles.fraseTexto}>
          <Text style={[styles.fraseSub, { color: colores.textoSecundario }]}>¿Quieres ver un resumen de tus emociones esta semana?</Text>
        </View>
        <TouchableOpacity style={[styles.fraseBtn, { backgroundColor: colores.fondoTarjeta }]}>
          <Text style={[styles.fraseBtnTexto, { color: colores.acento }]}>Ver resumen</Text>
          <Ionicons name="chevron-forward" size={14} color={colores.acento} />
        </TouchableOpacity>
      </View>

      {/* Reflexión espiritual */}
      <View style={[styles.reflexionCard, { backgroundColor: colores.fondoTarjeta }]}>
        <Text style={[styles.reflexionTitulo, { color: colores.texto }]}>✨ Reflexión del día</Text>
        <Text style={[styles.reflexionTexto, { color: colores.textoSecundario }]}>{fraseDelDia()}</Text>
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
  headerBotones: { flexDirection: 'row', gap: 8 },
  headerBtn: { padding: 10, borderRadius: 12 },
  card: { borderRadius: 16, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitulo: { fontSize: 15, fontWeight: 'bold' },
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
  insightContenido: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  insightIcono: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  insightTexto: { flex: 1, fontSize: 13, lineHeight: 20 },
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
  etiqueta: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  etiquetaTexto: { fontSize: 11, fontWeight: '600' },
  entradaStat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  entradaStatTexto: { fontSize: 11 },
  fraseCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1 },
  fraseIcono: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  fraseTexto: { flex: 1 },
  fraseSub: { fontSize: 13 },
  fraseBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  fraseBtnTexto: { fontSize: 12, fontWeight: '600' },
  reflexionCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
  reflexionTitulo: { fontSize: 15, fontWeight: 'bold', marginBottom: 8 },
  reflexionTexto: { fontSize: 14, lineHeight: 22, fontStyle: 'italic' },
});