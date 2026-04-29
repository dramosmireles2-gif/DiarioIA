import BloqueoConfig from '@/components/BloqueoConfig';
import Estadisticas from '@/components/Estadisticas';
import Recordatorio from '@/components/Recordatorio';
import { useTema } from '@/contexts/ThemeContext';
import { generarInsights } from '@/services/ia';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert, Image, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';

type Camino = 'biblica' | 'mindfulness' | 'filosofia' | 'todo';

const caminos = [
  { id: 'biblica', emoji: '📖', titulo: 'Reflexiones Bíblicas', descripcion: 'Versículos y reflexiones de la Biblia según cómo te sientes' },
  { id: 'mindfulness', emoji: '🧘', titulo: 'Mindfulness', descripcion: 'Meditación, calma y bienestar emocional' },
  { id: 'filosofia', emoji: '🌱', titulo: 'Filosofía', descripcion: 'Reflexiones de pensadores y crecimiento personal' },
  { id: 'todo', emoji: '✨', titulo: 'Un poco de todo', descripcion: 'Mezcla de todas las anteriores según el día' },
];

const generos = ['Masculino', 'Femenino', 'Prefiero no decir'];

export default function Perfil() {
  const [insights, setInsights] = useState<any>(null);
  const [cargandoInsights, setCargandoInsights] = useState(false);
  const { colores, tema, cambiarTema } = useTema();
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [caminoSeleccionado, setCaminoSeleccionado] = useState<Camino | null>(null);
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [correo, setCorreo] = useState('');
  const [genero, setGenero] = useState('');
  const [foto, setFoto] = useState<string | null>(null);
  const [racha, setRacha] = useState(0);
  const [totalEntradas, setTotalEntradas] = useState(0);

  useEffect(() => {
    cargarPerfil();
    cargarEstadisticas();
  }, []);

  const cargarPerfil = async () => {
    const datos = await AsyncStorage.getItem('perfil');
    if (datos) {
      const perfil = JSON.parse(datos);
      setCaminoSeleccionado(perfil.camino || null);
      setNombre(perfil.nombre || '');
      setEdad(perfil.edad || '');
      setCorreo(perfil.correo || '');
      setGenero(perfil.genero || '');
      setFoto(perfil.foto || null);
    } else {
      setEditando(true);
    }
  };

  const cargarEstadisticas = async () => {
    const datos = await AsyncStorage.getItem('entradas');
    if (datos) {
      const entradas = JSON.parse(datos);
      setTotalEntradas(entradas.length);
      const fechas = entradas.map((e: any) => new Date(e.fecha).toLocaleDateString('es-MX'));
      const unicas = [...new Set(fechas)];
      let rachaActual = 0;
      const hoy = new Date();
      for (let i = 0; i < unicas.length; i++) {
        const fecha = new Date(unicas[i] as string);
        const diff = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === i) rachaActual = i + 1;
        else break;
      }
      setRacha(rachaActual);
      if (entradas.length > 0) cargarInsights(entradas);
    }
  };

  const cargarInsights = async (entradasDatos: any[]) => {
    if (entradasDatos.length === 0) return;
    setCargandoInsights(true);
    try {
      const perfilDatos = await AsyncStorage.getItem('perfil');
      const perfil = perfilDatos ? JSON.parse(perfilDatos) : { camino: 'todo' };
      const insightsIA = await generarInsights(
        entradasDatos.map((e: any) => ({
          texto: e.texto,
          emocion: e.emocion,
          fecha: e.fecha,
        })),
        perfil.camino
      );
      setInsights(insightsIA);
    } catch (error) {
      console.log('Error generando insights:', error);
    }
    setCargandoInsights(false);
  };

  const guardarPerfil = async () => {
    await AsyncStorage.setItem('perfil', JSON.stringify({ camino: caminoSeleccionado, nombre, edad, correo, genero, foto }));
    setEditando(false);
    Alert.alert('✅ Listo', 'Tu perfil fue guardado');
  };

  const elegirFoto = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) { Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería'); return; }
    const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (!resultado.canceled) setFoto(resultado.assets[0].uri);
  };

  const caminoActual = caminos.find((c) => c.id === caminoSeleccionado);

  // ── MODO VER PERFIL ──
  if (!editando) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colores.fondo }]} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.titulo, { color: colores.texto }]}>Mi Perfil</Text>
            <Text style={[styles.subtitulo, { color: colores.textoSecundario }]}>Tu espacio personal 💜</Text>
          </View>
          <View style={styles.headerBotones}>
            <TouchableOpacity style={[styles.headerBtn, { backgroundColor: colores.fondoTarjeta }]}>
              <Ionicons name="share-outline" size={20} color={colores.texto} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerBtn, { backgroundColor: colores.fondoTarjeta }]} onPress={() => setEditando(true)}>
              <Ionicons name="settings-outline" size={20} color={colores.texto} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tarjeta de perfil */}
        <View style={[styles.perfilCard, { backgroundColor: colores.fondoTarjeta }]}>
          <View style={styles.perfilInfo}>
            <TouchableOpacity onPress={elegirFoto} style={styles.fotoContainer}>
              {foto ? (
                <Image source={{ uri: foto }} style={styles.foto} />
              ) : (
                <View style={[styles.fotoPlaceholder, { backgroundColor: colores.fondo }]}>
                  <Ionicons name="person" size={40} color="#555" />
                </View>
              )}
              <View style={[styles.fotoEditarBtn, { backgroundColor: colores.acento }]}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
            <View style={styles.perfilTexto}>
              <Text style={[styles.perfilNombre, { color: colores.texto }]}>{nombre || 'Sin nombre'}</Text>
              <Text style={[styles.perfilCorreo, { color: colores.textoSecundario }]}>{correo || 'Sin correo'}</Text>
              <TouchableOpacity style={[styles.rachaBadge, { backgroundColor: colores.fondo }]}>
                <Text style={styles.rachaTexto}>🔥 {racha} días seguidos</Text>
                <Ionicons name="chevron-forward" size={14} color="#ff6b6b" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.infoGrid}>
            <View style={[styles.infoTarjeta, { backgroundColor: colores.fondo }]}>
              <Ionicons name="calendar-outline" size={18} color={colores.acento} />
              <View>
                <Text style={[styles.infoLabel, { color: colores.textoSecundario }]}>EDAD</Text>
                <Text style={[styles.infoValor, { color: colores.texto }]}>{edad || '—'}</Text>
              </View>
            </View>
            <View style={[styles.infoTarjeta, { backgroundColor: colores.fondo }]}>
              <Ionicons name="people-outline" size={18} color={colores.acento} />
              <View>
                <Text style={[styles.infoLabel, { color: colores.textoSecundario }]}>GÉNERO</Text>
                <Text style={[styles.infoValor, { color: colores.texto }]}>{genero || '—'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Insights de IA */}
        <View style={[styles.seccionCard, { backgroundColor: colores.fondoTarjeta }]}>
          <View style={styles.seccionHeader}>
            <Text style={[styles.seccionTitulo, { color: colores.texto }]}>🧠 Insights de IA</Text>
            <TouchableOpacity style={styles.verMas}>
              <Text style={[styles.verMasTexto, { color: colores.acento }]}>
                {cargandoInsights ? 'Analizando...' : 'Ver más'}
              </Text>
              {!cargandoInsights && <Ionicons name="chevron-forward" size={14} color={colores.acento} />}
            </TouchableOpacity>
          </View>
          <View style={styles.insightsGrid}>
            <View style={[styles.insightTarjeta, { backgroundColor: '#7c6af722' }]}>
              <Text style={styles.insightEmoji}>😌</Text>
              <Text style={[styles.insightLabel, { color: colores.textoSecundario }]}>Estado emocional</Text>
              <Text style={[styles.insightValor, { color: colores.texto }]}>
                {insights ? insights.estadoEmocional : cargandoInsights ? '...' : caminoActual?.titulo || 'Sin datos'}
              </Text>
              <Text style={[styles.insightDesc, { color: colores.textoSecundario }]}>
                {insights ? insights.descripcionEstado : caminoActual?.descripcion || 'Escribe entradas para ver insights'}
              </Text>
            </View>
            <View style={[styles.insightTarjeta, { backgroundColor: '#4ecdc422' }]}>
              <Text style={styles.insightEmoji}>🌙</Text>
              <Text style={[styles.insightLabel, { color: colores.textoSecundario }]}>Momento favorito</Text>
              <Text style={[styles.insightValor, { color: colores.texto }]}>
                {insights ? insights.momentoFavorito : cargandoInsights ? '...' : `${totalEntradas} entradas`}
              </Text>
              <Text style={[styles.insightDesc, { color: colores.textoSecundario }]}>
                {insights ? insights.descripcionMomento : 'Sigue escribiendo cada día.'}
              </Text>
            </View>
          </View>
          {insights && (
            <View style={[styles.insightExtra, { backgroundColor: '#ff6b6b22' }]}>
              <Text style={styles.insightEmoji}>🎯</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.insightLabel, { color: colores.textoSecundario }]}>Enfoque principal</Text>
                <Text style={[styles.insightValor, { color: colores.texto }]}>{insights.enfoquePrincipal}</Text>
                <Text style={[styles.insightDesc, { color: colores.textoSecundario }]}>{insights.descripcionEnfoque}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Ajustes */}
        <View style={[styles.seccionCard, { backgroundColor: colores.fondoTarjeta }]}>
          <View style={styles.ajusteFila}>
            <View style={[styles.ajusteIcono, { backgroundColor: '#7c6af722' }]}>
              <Ionicons name="color-palette-outline" size={20} color={colores.acento} />
            </View>
            <View style={styles.ajusteTexto}>
              <Text style={[styles.ajusteTitulo, { color: colores.texto }]}>Tema</Text>
              <Text style={[styles.ajusteSub, { color: colores.textoSecundario }]}>Personaliza la apariencia</Text>
            </View>
            <View style={styles.temaToggle}>
              {[
                { id: 'oscuro', icon: 'moon' },
                { id: 'sistema', icon: 'phone-portrait' },
                { id: 'claro', icon: 'sunny' },
              ].map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.temaBtn, tema === t.id && { backgroundColor: colores.acento }]}
                  onPress={() => cambiarTema(t.id as any)}
                >
                  <Ionicons name={t.icon as any} size={16} color={tema === t.id ? '#fff' : colores.textoSecundario} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={[styles.separador, { backgroundColor: colores.fondo }]} />
          <BloqueoConfig />
          <View style={[styles.separador, { backgroundColor: colores.fondo }]} />
          <Recordatorio />
        </View>

        {/* Estadísticas */}
        <View style={[styles.seccionCard, { backgroundColor: colores.fondoTarjeta }]}>
          <View style={styles.seccionHeader}>
            <Text style={[styles.seccionTitulo, { color: colores.texto }]}>📊 Mis Estadísticas</Text>
            <TouchableOpacity style={styles.verMas}>
              <Text style={[styles.verMasTexto, { color: colores.acento }]}>Ver todas</Text>
              <Ionicons name="chevron-forward" size={14} color={colores.acento} />
            </TouchableOpacity>
          </View>
          <Estadisticas />
        </View>

        {/* Banner motivacional */}
        <View style={[styles.banner, { backgroundColor: colores.acento + '22', borderColor: colores.acento + '44', borderWidth: 1 }]}>
          <Text style={styles.bannerEmoji}>🌙</Text>
          <View style={styles.bannerTexto}>
            <Text style={[styles.bannerTitulo, { color: colores.texto }]}>Sigue escribiendo, {nombre || 'amigo'} ✨</Text>
            <Text style={[styles.bannerSub, { color: colores.textoSecundario }]}>Cada palabra te acerca a tu mejor versión.</Text>
          </View>
          <TouchableOpacity
            style={[styles.bannerBtn, { backgroundColor: colores.acento }]}
            onPress={() => router.push('/(tabs)/nueva_entrada')}
          >
            <Ionicons name="pencil" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    );
  }

  // ── MODO EDITAR PERFIL ──
  return (
    <ScrollView style={[styles.container, { backgroundColor: colores.fondo }]}>
      <View style={styles.header}>
        <Text style={[styles.titulo, { color: colores.texto }]}>Editar Perfil ✏️</Text>
        {nombre !== '' && (
          <TouchableOpacity onPress={() => setEditando(false)}>
            <Ionicons name="close" size={24} color={colores.textoSecundario} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.fotoContainerCentrado} onPress={elegirFoto}>
        {foto ? (
          <Image source={{ uri: foto }} style={styles.foto} />
        ) : (
          <View style={[styles.fotoPlaceholder, { backgroundColor: colores.fondoTarjeta }]}>
            <Ionicons name="person" size={50} color="#555" />
          </View>
        )}
        <View style={[styles.fotoEditarBtn, { backgroundColor: colores.acento }]}>
          <Ionicons name="camera" size={14} color="#fff" />
        </View>
      </TouchableOpacity>

      <Text style={[styles.seccionLabel, { color: colores.textoSecundario }]}>Datos personales</Text>
      <TextInput style={[styles.input, { backgroundColor: colores.fondoTarjeta, color: colores.texto }]} placeholder="Tu nombre" placeholderTextColor="#555" value={nombre} onChangeText={setNombre} />
      <TextInput style={[styles.input, { backgroundColor: colores.fondoTarjeta, color: colores.texto }]} placeholder="Tu edad" placeholderTextColor="#555" value={edad} onChangeText={setEdad} keyboardType="numeric" maxLength={3} />
      <TextInput style={[styles.input, { backgroundColor: colores.fondoTarjeta, color: colores.texto }]} placeholder="Tu correo" placeholderTextColor="#555" value={correo} onChangeText={setCorreo} keyboardType="email-address" autoCapitalize="none" />

      <Text style={[styles.seccionLabel, { color: colores.textoSecundario }]}>Género</Text>
      <View style={styles.generoContainer}>
        {generos.map((g) => (
          <TouchableOpacity key={g} style={[styles.generoBadge, { backgroundColor: colores.fondoTarjeta }, genero === g && { borderColor: colores.acento }]} onPress={() => setGenero(g)}>
            <Text style={[styles.generoTexto, { color: genero === g ? colores.acento : colores.textoSecundario }]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.seccionLabel, { color: colores.textoSecundario }]}>¿Qué reflexiones te gustaría recibir?</Text>
      {caminos.map((camino) => {
        const seleccionado = caminoSeleccionado === camino.id;
        return (
          <TouchableOpacity key={camino.id} style={[styles.caminoTarjeta, { backgroundColor: colores.fondoTarjeta }, seleccionado && { borderColor: colores.acento }]} onPress={() => setCaminoSeleccionado(camino.id as Camino)}>
            <Text style={styles.caminoEmoji}>{camino.emoji}</Text>
            <View style={styles.caminoTexto}>
              <Text style={[styles.caminoTitulo, { color: colores.texto }]}>{camino.titulo}</Text>
              <Text style={[styles.caminoDescripcion, { color: colores.textoSecundario }]}>{camino.descripcion}</Text>
            </View>
            {seleccionado && <Ionicons name="checkmark-circle" size={24} color={colores.acento} />}
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.botonGuardar} onPress={guardarPerfil}>
        <Ionicons name="save-outline" size={20} color="#fff" />
        <Text style={styles.botonGuardarTexto}>Guardar perfil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerBotones: { flexDirection: 'row', gap: 8 },
  headerBtn: { padding: 10, borderRadius: 12 },
  titulo: { fontSize: 26, fontWeight: 'bold' },
  subtitulo: { fontSize: 14, marginTop: 2 },
  perfilCard: { borderRadius: 20, padding: 16, marginBottom: 16 },
  perfilInfo: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  fotoContainer: { position: 'relative' },
  fotoContainerCentrado: { alignSelf: 'center', marginBottom: 24, position: 'relative' },
  foto: { width: 80, height: 80, borderRadius: 40 },
  fotoPlaceholder: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  fotoEditarBtn: { position: 'absolute', bottom: 0, right: 0, borderRadius: 10, padding: 4 },
  perfilTexto: { flex: 1, justifyContent: 'center', gap: 4 },
  perfilNombre: { fontSize: 22, fontWeight: 'bold' },
  perfilCorreo: { fontSize: 13 },
  rachaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginTop: 4 },
  rachaTexto: { color: '#ff6b6b', fontSize: 13, fontWeight: 'bold' },
  infoGrid: { flexDirection: 'row', gap: 12 },
  infoTarjeta: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 12 },
  infoLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  infoValor: { fontSize: 16, fontWeight: 'bold' },
  seccionCard: { borderRadius: 20, padding: 16, marginBottom: 16 },
  seccionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seccionTitulo: { fontSize: 16, fontWeight: 'bold' },
  verMas: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  verMasTexto: { fontSize: 13 },
  insightsGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  insightTarjeta: { flex: 1, borderRadius: 14, padding: 12, gap: 4 },
  insightExtra: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 12, marginTop: 4 },
  insightEmoji: { fontSize: 24 },
  insightLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  insightValor: { fontSize: 14, fontWeight: 'bold' },
  insightDesc: { fontSize: 11 },
  ajusteFila: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  ajusteIcono: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  ajusteTexto: { flex: 1 },
  ajusteTitulo: { fontSize: 15, fontWeight: 'bold' },
  ajusteSub: { fontSize: 12, marginTop: 2 },
  temaToggle: { flexDirection: 'row', gap: 4, backgroundColor: '#00000011', borderRadius: 12, padding: 4 },
  temaBtn: { padding: 6, borderRadius: 8 },
  separador: { height: 1, marginVertical: 8 },
  banner: { borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  bannerEmoji: { fontSize: 36 },
  bannerTexto: { flex: 1 },
  bannerTitulo: { fontSize: 15, fontWeight: 'bold' },
  bannerSub: { fontSize: 12, marginTop: 2 },
  bannerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  seccionLabel: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 8 },
  input: { borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 12 },
  generoContainer: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  generoBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: 'transparent' },
  generoTexto: { fontSize: 13 },
  caminoTarjeta: { borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: 'transparent' },
  caminoEmoji: { fontSize: 32 },
  caminoTexto: { flex: 1 },
  caminoTitulo: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  caminoDescripcion: { fontSize: 13 },
  botonGuardar: { backgroundColor: '#7c6af7', borderRadius: 12, padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 8, marginBottom: 60 },
  botonGuardarTexto: { color: '#fff', fontWeight: 'bold' },
});