import TextoIA from '@/components/TextoIA';
import { useTema } from '@/contexts/ThemeContext';
import { generarInsights, generarReflexion } from '@/services/ia';
import { generarSugerencia } from '@/utils/sugerencias';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  const [sugerencia, setSugerencia] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [cargandoInsights, setCargandoInsights] = useState(false);
  const [modalInsight, setModalInsight] = useState<any>(null);
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
  const [modalReflexion, setModalReflexion] = useState(false);

  useFocusEffect(useCallback(() => { cargarDatos(); }, []));

  const cargarDatos = async () => {
    const perfilGuardado = await AsyncStorage.getItem('perfil');
    const entradasGuardadas = await AsyncStorage.getItem('entradas');
    const reflexionGuardada = await AsyncStorage.getItem('reflexion_diaria');
    const fechaReflexion = await AsyncStorage.getItem('reflexion_fecha');

    if (perfilGuardado) setPerfil(JSON.parse(perfilGuardado));

    const perfilData = perfilGuardado ? JSON.parse(perfilGuardado) : { camino: 'todo' };
    const entradasData = entradasGuardadas ? JSON.parse(entradasGuardadas) : [];

    if (entradasData.length > 0) {
      setTotalEntradas(entradasData.length);
      const ordenadas = [...entradasData].sort((a: Entrada, b: Entrada) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      setUltimaEntrada(ordenadas[0]);
      calcularRacha(ordenadas);
      calcularEstadoSemana(entradasData);
    }

    const hoy = new Date().toDateString();
    if (reflexionGuardada && fechaReflexion === hoy) {
      setReflexionIA(reflexionGuardada);
    } else if (entradasData.length > 0) {
      generarReflexionDiaria(perfilData, entradasData);
    }

    const ultimaEmocion = entradasData.length > 0 ? entradasData[0].emocion : null;
    setSugerencia(generarSugerencia(ultimaEmocion, perfilData.camino, entradasData.length > 0));

    if (entradasData.length > 0) {
      cargarInsights(entradasData, perfilData);
    }
  };

  const cargarInsights = async (entradas: Entrada[], perfilData: any) => {
    setCargandoInsights(true);
    try {
      const insightsIA = await generarInsights(
        entradas.slice(0, 10).map((e) => ({
          texto: e.texto,
          emocion: e.emocion,
          fecha: e.fecha,
        })),
        perfilData.camino
      );
      setInsights(insightsIA);
    } catch {
      console.log('Error cargando insights');
    }
    setCargandoInsights(false);
  };

  const generarReflexionDiaria = async (perfilData: any, entradas: Entrada[]) => {
    setCargandoReflexion(true);
    try {
      const reflexion = await generarReflexion(
        `Genera una reflexión inspiradora para comenzar el día. Contexto de mi última entrada: "${entradas[0]?.texto.substring(0, 200)}"`,
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
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => reflexionIA && setModalReflexion(true)}
        style={[styles.reflexionCard, { backgroundColor: '#7c6af7' }]}
      >
        <View style={styles.reflexionCardContent}>
          <View style={{ flex: 1 }}>
            <View style={styles.reflexionHeader}>
              <Ionicons name="sparkles" size={14} color="#ffffff99" />
              <Text style={[styles.reflexionLabel, { color: '#ffffff99' }]}>Reflexión del día</Text>
              {reflexionIA && !cargandoReflexion && (
                <TouchableOpacity onPress={() => {
                  setReflexionIA(null);
                  AsyncStorage.removeItem('reflexion_diaria');
                  AsyncStorage.removeItem('reflexion_fecha');
                  if (perfil && ultimaEntrada) generarReflexionDiaria(perfil, [ultimaEntrada]);
                }}>
                  <Ionicons name="refresh-outline" size={14} color="#ffffff99" />
                </TouchableOpacity>
              )}
            </View>
            {cargandoReflexion ? (
              <Text style={styles.reflexionTexto}>Generando tu reflexión... ✨</Text>
            ) : reflexionIA ? (
              <>
                <Text style={styles.reflexionTitulo}>
                  {reflexionIA.replace(/[#*_]/g, '').split('\n')[0].trim().substring(0, 40)}
                </Text>
                <Text style={styles.reflexionTexto} numberOfLines={2}>
                  {reflexionIA.replace(/[#*_]/g, '').trim().substring(0, 100)}...
                </Text>
                <TouchableOpacity style={styles.reflexionBtn} onPress={() => setModalReflexion(true)}>
                  <Text style={styles.reflexionBtnTexto}>Leer reflexión completa</Text>
                  <Ionicons name="arrow-forward" size={12} color="#fff" />
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.reflexionTexto}>
                Escribe tu primera entrada para recibir reflexiones 💜
              </Text>
            )}
          </View>
          <Text style={styles.reflexionDecoracion}>📖</Text>
        </View>
      </TouchableOpacity>

      {/* Modal reflexión completa */}
      <Modal visible={modalReflexion} animationType="slide" transparent>
        <View style={styles.modalFondo}>
          <View style={[styles.modalReflexion, { backgroundColor: colores.fondoTarjeta }]}>
            <View style={[styles.modalHandle, { backgroundColor: colores.textoSecundario }]} />
            <View style={styles.modalReflexionHeader}>
              <Ionicons name="sparkles" size={20} color={colores.acento} />
              <Text style={[styles.modalReflexionTitulo, { color: colores.texto }]}>Reflexión del día</Text>
              <TouchableOpacity onPress={() => setModalReflexion(false)}>
                <Ionicons name="close" size={24} color={colores.textoSecundario} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {reflexionIA && <TextoIA texto={reflexionIA} />}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Insights de IA */}
      <View style={styles.seccionHeader}>
        <Text style={[styles.seccionTitulo, { color: colores.texto }]}>🧠 Tus insights</Text>
        {cargandoInsights && (
          <Text style={[styles.verTodosTexto, { color: colores.textoSecundario }]}>Analizando...</Text>
        )}
      </View>

      {insights ? (
        <View style={styles.insightsGrid}>
          <TouchableOpacity
            style={[styles.insightCard, { backgroundColor: '#7c6af722' }]}
            onPress={() => setModalInsight({ emoji: '😌', titulo: 'Estado emocional', valor: insights.estadoEmocional, descripcion: insights.descripcionEstado, color: '#7c6af7' })}
          >
            <Text style={styles.insightEmoji}>😌</Text>
            <Text style={[styles.insightLabel, { color: colores.textoSecundario }]}>Estado emocional</Text>
            <Text style={[styles.insightValor, { color: '#7c6af7' }]} numberOfLines={1}>{insights.estadoEmocional}</Text>
            <Text style={[styles.insightDesc, { color: colores.textoSecundario }]} numberOfLines={2}>{insights.descripcionEstado}</Text>
            <View style={[styles.insightVerMas, { backgroundColor: '#7c6af720' }]}>
              <Text style={[styles.insightVerMasTexto, { color: '#7c6af7' }]}>Ver más</Text>
              <Ionicons name="arrow-forward" size={10} color="#7c6af7" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.insightCard, { backgroundColor: '#4ecdc422' }]}
            onPress={() => setModalInsight({ emoji: '🌙', titulo: 'Momento favorito', valor: insights.momentoFavorito, descripcion: insights.descripcionMomento, color: '#4ecdc4' })}
          >
            <Text style={styles.insightEmoji}>🌙</Text>
            <Text style={[styles.insightLabel, { color: colores.textoSecundario }]}>Momento favorito</Text>
            <Text style={[styles.insightValor, { color: '#4ecdc4' }]} numberOfLines={1}>{insights.momentoFavorito}</Text>
            <Text style={[styles.insightDesc, { color: colores.textoSecundario }]} numberOfLines={2}>{insights.descripcionMomento}</Text>
            <View style={[styles.insightVerMas, { backgroundColor: '#4ecdc420' }]}>
              <Text style={[styles.insightVerMasTexto, { color: '#4ecdc4' }]}>Ver más</Text>
              <Ionicons name="arrow-forward" size={10} color="#4ecdc4" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.insightCard, { backgroundColor: '#ff6b6b22' }]}
            onPress={() => setModalInsight({ emoji: '🎯', titulo: 'Enfoque principal', valor: insights.enfoquePrincipal, descripcion: insights.descripcionEnfoque, color: '#ff6b6b' })}
          >
            <Text style={styles.insightEmoji}>🎯</Text>
            <Text style={[styles.insightLabel, { color: colores.textoSecundario }]}>Enfoque principal</Text>
            <Text style={[styles.insightValor, { color: '#ff6b6b' }]} numberOfLines={1}>{insights.enfoquePrincipal}</Text>
            <Text style={[styles.insightDesc, { color: colores.textoSecundario }]} numberOfLines={2}>{insights.descripcionEnfoque}</Text>
            <View style={[styles.insightVerMas, { backgroundColor: '#ff6b6b20' }]}>
              <Text style={[styles.insightVerMasTexto, { color: '#ff6b6b' }]}>Ver más</Text>
              <Ionicons name="arrow-forward" size={10} color="#ff6b6b" />
            </View>
          </TouchableOpacity>
        </View>
      ) : !cargandoInsights && totalEntradas === 0 ? (
        <View style={[styles.insightVacio, { backgroundColor: colores.fondoTarjeta }]}>
          <Text style={styles.insightVacioEmoji}>🧠</Text>
          <Text style={[styles.insightVacioTexto, { color: colores.textoSecundario }]}>
            Escribe al menos una entrada para ver tus insights
          </Text>
        </View>
      ) : null}

      {/* Modal insight */}
      <Modal visible={!!modalInsight} animationType="slide" transparent>
        <View style={styles.modalFondo}>
          <View style={[styles.modalReflexion, { backgroundColor: colores.fondoTarjeta }]}>
            <View style={[styles.modalHandle, { backgroundColor: colores.textoSecundario }]} />
            {modalInsight && (
              <>
                <View style={[styles.modalInsightHeader, { backgroundColor: modalInsight.color + '15' }]}>
                  <Text style={styles.modalInsightEmoji}>{modalInsight.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modalInsightLabel, { color: modalInsight.color }]}>{modalInsight.titulo}</Text>
                    <Text style={[styles.modalInsightValor, { color: colores.texto }]}>{modalInsight.valor}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setModalInsight(null)}>
                    <Ionicons name="close" size={24} color={colores.textoSecundario} />
                  </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 16 }}>
                  <Text style={[styles.modalInsightDesc, { color: colores.textoSecundario }]}>
                    {modalInsight.descripcion}
                  </Text>
                  <View style={[styles.modalInsightExtra, { backgroundColor: modalInsight.color + '10', borderColor: modalInsight.color + '30' }]}>
                    <Ionicons name="sparkles" size={16} color={modalInsight.color} />
                    <Text style={[styles.modalInsightExtraTexto, { color: colores.texto }]}>
                      Este insight está basado en tus últimas entradas del diario y tu camino espiritual.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.modalInsightBtn, { backgroundColor: modalInsight.color }]}
                    onPress={() => { setModalInsight(null); router.push('/(tabs)/nueva_entrada'); }}
                  >
                    <Ionicons name="pencil-outline" size={16} color="#fff" />
                    <Text style={styles.modalInsightBtnTexto}>Escribir sobre esto</Text>
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Para ti hoy */}
      {sugerencia && (
        <View style={[styles.paraTiCard, { backgroundColor: colores.fondoTarjeta }]}>
          <View style={styles.paraTiTop}>
            <Text style={[styles.paraTiLabel, { color: colores.textoSecundario }]}>PARA TI HOY</Text>
            <Ionicons name="ellipsis-horizontal" size={16} color={colores.textoSecundario} />
          </View>
          <View style={styles.paraTiContenido}>
            <View style={[styles.paraTiIcono, { backgroundColor: sugerencia.color + '30' }]}>
              <Text style={styles.paraTiEmoji}>{sugerencia.emoji}</Text>
            </View>
            <View style={styles.paraTiTexto}>
              <Text style={[styles.paraTiTitulo, { color: colores.texto }]}>{sugerencia.titulo}</Text>
              <Text style={[styles.paraTiDesc, { color: colores.textoSecundario }]} numberOfLines={2}>
                {sugerencia.descripcion}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.paraTiBtn, { backgroundColor: sugerencia.color + '25' }]}
              onPress={() => router.push('/(tabs)/nueva_entrada')}
            >
              <Text style={[styles.paraTiBtnTexto, { color: sugerencia.color }]}>{sugerencia.accion}</Text>
              <Ionicons name="arrow-forward" size={12} color={sugerencia.color} />
            </TouchableOpacity>
          </View>
        </View>
      )}

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
  reflexionCard: { borderRadius: 20, padding: 20, marginBottom: 16, overflow: 'hidden' },
  reflexionCardContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reflexionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  reflexionLabel: { fontSize: 12, fontWeight: '600', flex: 1 },
  reflexionTitulo: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  reflexionTexto: { color: '#ffffffcc', fontSize: 13, lineHeight: 20, marginBottom: 12 },
  reflexionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ffffff25', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' },
  reflexionBtnTexto: { color: '#fff', fontSize: 12, fontWeight: '600' },
  reflexionDecoracion: { fontSize: 64, opacity: 0.3 },
  modalFondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalReflexion: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '80%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalReflexionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  modalReflexionTitulo: { flex: 1, fontSize: 18, fontWeight: 'bold' },
  insightsGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  insightCard: { flex: 1, borderRadius: 18, padding: 12, gap: 4 },
  insightEmoji: { fontSize: 26, marginBottom: 4 },
  insightLabel: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' },
  insightValor: { fontSize: 13, fontWeight: 'bold' },
  insightDesc: { fontSize: 10, lineHeight: 14 },
  insightVerMas: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginTop: 4 },
  insightVerMasTexto: { fontSize: 10, fontWeight: '700' },
  insightVacio: { borderRadius: 16, padding: 20, alignItems: 'center', gap: 8, marginBottom: 16 },
  insightVacioEmoji: { fontSize: 36 },
  insightVacioTexto: { fontSize: 13, textAlign: 'center' },
  modalInsightHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 16 },
  modalInsightEmoji: { fontSize: 40 },
  modalInsightLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  modalInsightValor: { fontSize: 20, fontWeight: 'bold', marginTop: 2 },
  modalInsightDesc: { fontSize: 15, lineHeight: 24, marginBottom: 16 },
  modalInsightExtra: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1 },
  modalInsightExtraTexto: { flex: 1, fontSize: 13, lineHeight: 20 },
  modalInsightBtn: { borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 },
  modalInsightBtnTexto: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  paraTiCard: { borderRadius: 20, padding: 16, marginBottom: 16 },
  paraTiTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  paraTiLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  paraTiContenido: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  paraTiIcono: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  paraTiEmoji: { fontSize: 28 },
  paraTiTexto: { flex: 1 },
  paraTiTitulo: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  paraTiDesc: { fontSize: 12, lineHeight: 18 },
  paraTiBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, alignItems: 'center', gap: 4 },
  paraTiBtnTexto: { fontSize: 11, fontWeight: '700' },
});