import { useTema } from '@/contexts/ThemeContext';
import { generarReflexion } from '@/services/ia';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView, StyleSheet,
    Text, TextInput, TouchableOpacity, View
} from 'react-native';

type Modo = 'menu' | 'chat' | 'reflexion' | 'versiculo';

export default function Asistente() {
  const { colores } = useTema();
  const router = useRouter();
  const [modo, setModo] = useState<Modo>('menu');
  const [chatTexto, setChatTexto] = useState('');
  const [chatRespuesta, setChatRespuesta] = useState('');
  const [cargando, setCargando] = useState(false);
  const [reflexionDia, setReflexionDia] = useState('');
  const [versiculo, setVersiculo] = useState('');

  const generarReflexionDia = async () => {
    setModo('reflexion');
    setCargando(true);
    try {
      const perfilDatos = await AsyncStorage.getItem('perfil');
      const perfil = perfilDatos ? JSON.parse(perfilDatos) : { camino: 'todo' };
      const entradasDatos = await AsyncStorage.getItem('entradas');
      const entradas = entradasDatos ? JSON.parse(entradasDatos) : [];
      const contexto = entradas.length > 0
        ? `Última entrada: "${entradas[0].texto.substring(0, 200)}"`
        : 'El usuario aún no ha escrito entradas';
      const reflexion = await generarReflexion(contexto, perfil.camino, entradas[0]?.emocion || null);
      setReflexionDia(reflexion);
      await AsyncStorage.setItem('reflexion_diaria', reflexion);
      await AsyncStorage.setItem('reflexion_fecha', new Date().toDateString());
    } catch {
      setReflexionDia('No se pudo conectar con la IA. Verifica tu conexión.');
    }
    setCargando(false);
  };

  const generarVersiculo = async () => {
    setModo('versiculo');
    setCargando(true);
    try {
      const perfilDatos = await AsyncStorage.getItem('perfil');
      const perfil = perfilDatos ? JSON.parse(perfilDatos) : { camino: 'biblica' };
      const respuesta = await generarReflexion(
        'Dame un versículo bíblico poderoso y esperanzador para el día de hoy, con su referencia exacta y una reflexión corta de 2 líneas.',
        'biblica',
        null
      );
      setVersiculo(respuesta);
    } catch {
      setVersiculo('No se pudo conectar con la IA.');
    }
    setCargando(false);
  };

  const enviarChat = async () => {
    if (!chatTexto.trim()) return;
    setCargando(true);
    try {
      const perfilDatos = await AsyncStorage.getItem('perfil');
      const perfil = perfilDatos ? JSON.parse(perfilDatos) : { camino: 'todo' };
      const respuesta = await generarReflexion(chatTexto, perfil.camino, null);
      setChatRespuesta(respuesta);
    } catch {
      setChatRespuesta('No se pudo conectar con la IA.');
    }
    setCargando(false);
  };

  const opciones = [
    { id: 'reflexion', emoji: '✨', titulo: 'Reflexión del día', descripcion: 'Genera una reflexión personalizada', color: '#7c6af722', onPress: generarReflexionDia },
    { id: 'chat', emoji: '💬', titulo: 'Hablar con la IA', descripcion: 'Cuéntame algo y te ayudo', color: '#4ecdc422', onPress: () => setModo('chat') },
    { id: 'guiado', emoji: '🧭', titulo: 'Modo guiado', descripcion: 'Escribe con ayuda de la IA', color: '#f5c51822', onPress: () => router.push('/(tabs)/nueva_entrada') },
    { id: 'versiculo', emoji: '📖', titulo: 'Versículo del día', descripcion: 'Palabra de Dios para hoy', color: '#ff6b6b22', onPress: generarVersiculo },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colores.fondo }]}>

      {/* Header */}
      <View style={styles.header}>
        {modo !== 'menu' ? (
          <TouchableOpacity onPress={() => { setModo('menu'); setChatRespuesta(''); setChatTexto(''); }} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colores.texto} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}
        <View style={styles.headerCenter}>
          <Text style={[styles.titulo, { color: colores.texto }]}>Asistente IA</Text>
          <Text style={[styles.subtitulo, { color: colores.textoSecundario }]}>Tu compañero espiritual 🤖</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      {/* MENÚ PRINCIPAL */}
      {modo === 'menu' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={[styles.bienvenida, { backgroundColor: colores.acento + '15', borderColor: colores.acento + '30' }]}>
            <Text style={styles.bienvenidaEmoji}>🤖</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bienvenidaTitulo, { color: colores.texto }]}>¿En qué puedo ayudarte?</Text>
              <Text style={[styles.bienvenidaSub, { color: colores.textoSecundario }]}>Estoy aquí para acompañarte en tu reflexión</Text>
            </View>
          </View>

          {opciones.map((op) => (
            <TouchableOpacity
              key={op.id}
              style={[styles.opcionCard, { backgroundColor: colores.fondoTarjeta }]}
              onPress={op.onPress}
            >
              <View style={[styles.opcionIcono, { backgroundColor: op.color }]}>
                <Text style={styles.opcionEmoji}>{op.emoji}</Text>
              </View>
              <View style={styles.opcionTexto}>
                <Text style={[styles.opcionTitulo, { color: colores.texto }]}>{op.titulo}</Text>
                <Text style={[styles.opcionDesc, { color: colores.textoSecundario }]}>{op.descripcion}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colores.textoSecundario} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* CHAT */}
      {modo === 'chat' && (
        <View style={styles.chatContainer}>
          <Text style={[styles.modoTitulo, { color: colores.texto }]}>💬 Hablar con la IA</Text>

          {chatRespuesta !== '' && (
            <ScrollView style={[styles.respuestaCard, { backgroundColor: colores.fondoTarjeta }]}>
              <View style={styles.respuestaHeader}>
                <Ionicons name="sparkles" size={16} color={colores.acento} />
                <Text style={[styles.respuestaLabel, { color: colores.acento }]}>Respuesta de la IA</Text>
              </View>
              <Text style={[styles.respuestaTexto, { color: colores.texto }]}>{chatRespuesta}</Text>
              <TouchableOpacity
                style={[styles.usarBtn, { backgroundColor: colores.acento }]}
                onPress={() => {
                  router.push('/(tabs)/nueva_entrada');
                }}
              >
                <Ionicons name="pencil-outline" size={14} color="#fff" />
                <Text style={styles.usarBtnTexto}>Escribir una entrada sobre esto</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          <View style={[styles.chatInputContainer, { backgroundColor: colores.fondoTarjeta }]}>
            <TextInput
              style={[styles.chatInput, { color: colores.texto }]}
              placeholder="Cuéntame cómo te sientes..."
              placeholderTextColor={colores.textoSecundario}
              value={chatTexto}
              onChangeText={setChatTexto}
              multiline
              maxLength={500}
            />
          </View>

          <TouchableOpacity
            style={[styles.chatBoton, { backgroundColor: cargando || !chatTexto.trim() ? colores.fondoTarjeta : colores.acento }]}
            onPress={enviarChat}
            disabled={cargando || !chatTexto.trim()}
          >
            {cargando ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="sparkles" size={18} color="#fff" />
            )}
            <Text style={styles.chatBotonTexto}>
              {cargando ? 'Reflexionando...' : 'Enviar'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* REFLEXIÓN DEL DÍA */}
      {modo === 'reflexion' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={[styles.modoTitulo, { color: colores.texto }]}>✨ Reflexión del día</Text>
          {cargando ? (
            <View style={styles.cargandoContainer}>
              <ActivityIndicator color={colores.acento} size="large" />
              <Text style={[styles.cargandoTexto, { color: colores.textoSecundario }]}>
                Generando tu reflexión personalizada...
              </Text>
            </View>
          ) : (
            <View style={[styles.reflexionCard, { backgroundColor: colores.fondoTarjeta }]}>
              <Text style={[styles.reflexionTexto, { color: colores.texto }]}>{reflexionDia}</Text>
              <TouchableOpacity
                style={[styles.usarBtn, { backgroundColor: colores.acento, marginTop: 16 }]}
                onPress={generarReflexionDia}
              >
                <Ionicons name="refresh-outline" size={14} color="#fff" />
                <Text style={styles.usarBtnTexto}>Generar otra</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* VERSÍCULO */}
      {modo === 'versiculo' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={[styles.modoTitulo, { color: colores.texto }]}>📖 Versículo del día</Text>
          {cargando ? (
            <View style={styles.cargandoContainer}>
              <ActivityIndicator color={colores.acento} size="large" />
              <Text style={[styles.cargandoTexto, { color: colores.textoSecundario }]}>
                Buscando la Palabra para ti...
              </Text>
            </View>
          ) : (
            <View style={[styles.reflexionCard, { backgroundColor: colores.fondoTarjeta }]}>
              <Text style={[styles.reflexionTexto, { color: colores.texto }]}>{versiculo}</Text>
              <TouchableOpacity
                style={[styles.usarBtn, { backgroundColor: colores.acento, marginTop: 16 }]}
                onPress={generarVersiculo}
              >
                <Ionicons name="refresh-outline" size={14} color="#fff" />
                <Text style={styles.usarBtnTexto}>Otro versículo</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backBtn: { width: 40 },
  headerCenter: { alignItems: 'center' },
  titulo: { fontSize: 20, fontWeight: 'bold' },
  subtitulo: { fontSize: 12, marginTop: 2 },
  bienvenida: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
  bienvenidaEmoji: { fontSize: 36 },
  bienvenidaTitulo: { fontSize: 15, fontWeight: 'bold' },
  bienvenidaSub: { fontSize: 12, marginTop: 2 },
  opcionCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, padding: 16, marginBottom: 12 },
  opcionIcono: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  opcionEmoji: { fontSize: 24 },
  opcionTexto: { flex: 1 },
  opcionTitulo: { fontSize: 15, fontWeight: 'bold' },
  opcionDesc: { fontSize: 12, marginTop: 2 },
  modoTitulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  chatContainer: { flex: 1, gap: 12 },
  respuestaCard: { borderRadius: 16, padding: 16, maxHeight: 300 },
  respuestaHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  respuestaLabel: { fontSize: 13, fontWeight: 'bold' },
  respuestaTexto: { fontSize: 14, lineHeight: 22 },
  chatInputContainer: { borderRadius: 16, padding: 14, minHeight: 100 },
  chatInput: { fontSize: 15, textAlignVertical: 'top', minHeight: 70 },
  chatBoton: { borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  chatBotonTexto: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  cargandoContainer: { alignItems: 'center', gap: 16, paddingVertical: 60 },
  cargandoTexto: { fontSize: 14, textAlign: 'center' },
  reflexionCard: { borderRadius: 16, padding: 20 },
  reflexionTexto: { fontSize: 15, lineHeight: 26 },
  usarBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, padding: 12, alignSelf: 'flex-start' },
  usarBtnTexto: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
});