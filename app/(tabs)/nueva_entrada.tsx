import ModoGuiado from '@/components/ModoGuiado';
import { useTema } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert, Image, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';

const emociones = [
  { emoji: '😄', label: 'Genial' },
  { emoji: '🙂', label: 'Bien' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😢', label: 'Triste' },
  { emoji: '😠', label: 'Enojado' },
  { emoji: '😴', label: 'Cansado' },
];

export default function NuevaEntrada() {
  const [modalGuiado, setModalGuiado] = useState(false);
  const { colores } = useTema();
  const router = useRouter();
  const navigation = useNavigation();
  const [texto, setTexto] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [grabando, setGrabando] = useState(false);
  const [grabacion, setGrabacion] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [sonido, setSonido] = useState<Audio.Sound | null>(null);
  const [emocionSeleccionada, setEmocionSeleccionada] = useState<string | null>(null);
  const guardadoRef = useRef(false);
  const [borradorGuardado, setBorradorGuardado] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  const hayContenido = texto.length > 0 || imagenes.length > 0 || !!audioUri;

  // Cargar borrador al montar
  useEffect(() => {
    const cargarBorrador = async () => {
      const borrador = await AsyncStorage.getItem('borrador');
      if (!borrador) return;
      const { texto: textoBorrador, emocion: emocionBorrador } = JSON.parse(borrador);
      if (!textoBorrador && !emocionBorrador) return;
      Alert.alert(
        'Borrador guardado',
        '¿Continuar con tu entrada anterior?',
        [
          { text: 'Descartar', style: 'destructive', onPress: () => AsyncStorage.removeItem('borrador') },
          { text: 'Continuar', onPress: () => { setTexto(textoBorrador || ''); setEmocionSeleccionada(emocionBorrador || null); } },
        ]
      );
    };
    cargarBorrador();
  }, []);

  // Autoguardar borrador mientras se escribe
  useEffect(() => {
    if (!hayContenido) return;
    const timer = setTimeout(async () => {
      await AsyncStorage.setItem('borrador', JSON.stringify({ texto, emocion: emocionSeleccionada }));
      setBorradorGuardado(true);
      setTimeout(() => setBorradorGuardado(false), 2000);
    }, 1500);
    return () => clearTimeout(timer);
  }, [texto, emocionSeleccionada]);

  // Confirmar salida si hay contenido sin guardar
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove' as any, (e: any) => {
      if (!hayContenido || guardadoRef.current) return;
      e.preventDefault();
      Alert.alert(
        'Salir sin guardar',
        '¿Quieres descartar lo que escribiste?',
        [
          { text: 'Quedarme', style: 'cancel' },
          { text: 'Descartar', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
        ]
      );
    });
    return unsubscribe;
  }, [navigation, hayContenido]);

  const agregarImagen = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) { Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería'); return; }
    const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, quality: 0.7 });
    if (!resultado.canceled) setImagenes([...imagenes, ...resultado.assets.map((a) => a.uri)]);
  };

  const tomarFoto = async () => {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) { Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara'); return; }
    const resultado = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!resultado.canceled) setImagenes([...imagenes, resultado.assets[0].uri]);
  };

  const iniciarGrabacion = async () => {
    try {
      const permiso = await Audio.requestPermissionsAsync();
      if (!permiso.granted) { Alert.alert('Permiso requerido', 'Necesitamos acceso al micrófono'); return; }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setGrabacion(recording);
      setGrabando(true);
    } catch { Alert.alert('Error', 'No se pudo iniciar la grabación'); }
  };

  const detenerGrabacion = async () => {
    if (!grabacion) return;
    await grabacion.stopAndUnloadAsync();
    setAudioUri(grabacion.getURI());
    setGrabacion(null);
    setGrabando(false);
  };

  const reproducirAudio = async () => {
    if (!audioUri) return;
    if (sonido) { await sonido.unloadAsync(); setSonido(null); setReproduciendo(false); return; }
    const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
    setSonido(sound);
    setReproduciendo(true);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) { setReproduciendo(false); setSonido(null); }
    });
  };

  const guardarEntrada = async () => {
    if (texto.trim().length === 0 && imagenes.length === 0 && !audioUri) {
      Alert.alert('Entrada vacía', 'Escribe algo, agrega una imagen o graba un audio');
      return;
    }
    setGuardando(true);
    const nuevaEntrada = {
      id: Date.now().toString(),
      texto,
      fecha: new Date().toISOString(),
      destacada: false,
      imagenes,
      audioUri,
      emocion: emocionSeleccionada,
    };
    try {
      const guardadas = await AsyncStorage.getItem('entradas');
      const entradas = guardadas ? JSON.parse(guardadas) : [];
      entradas.unshift(nuevaEntrada);
      await AsyncStorage.setItem('entradas', JSON.stringify(entradas));
      const fechaInicio = await AsyncStorage.getItem('fechaInicio');
      if (!fechaInicio) await AsyncStorage.setItem('fechaInicio', new Date().toISOString());
      await AsyncStorage.removeItem('borrador');
      guardadoRef.current = true;
      setGuardadoExitoso(true);
      setGuardando(false);
      await new Promise(r => setTimeout(r, 700));
      setTexto('');
      setImagenes([]);
      setAudioUri(null);
      setEmocionSeleccionada(null);
      setGuardadoExitoso(false);
      router.push({ pathname: '/(tabs)/entrada-detalle', params: { id: nuevaEntrada.id, analizar: 'true' } } as any);
    } catch { Alert.alert('Error', 'No se pudo guardar la entrada'); }
    setGuardando(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colores.fondo }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.titulo, { color: colores.texto }]}>¿Cómo te sientes hoy?</Text>
            <Text style={[styles.subtitulo, { color: colores.textoSecundario }]}>
              Escribe, reflexiona y entiende tus emociones 💜
            </Text>
          </View>
        </View>

        {/* Selector de emoción */}
        <View style={[styles.emocionCard, { backgroundColor: colores.fondoTarjeta }]}>
          <Text style={[styles.emocionTitulo, { color: colores.textoSecundario }]}>¿Cómo está tu ánimo ahora?</Text>
          <View style={styles.emocionesGrid}>
            {emociones.map((e) => {
              const seleccionado = emocionSeleccionada === e.label;
              return (
                <TouchableOpacity
                  key={e.label}
                  style={styles.emocionItem}
                  onPress={() => setEmocionSeleccionada(seleccionado ? null : e.label)}
                >
                  <View style={[styles.emocionCirculo, seleccionado && { borderColor: colores.acento, borderWidth: 2 }]}>
                    <Text style={styles.emocionEmoji}>{e.emoji}</Text>
                  </View>
                  <Text style={[styles.emocionLabel, { color: seleccionado ? colores.acento : colores.textoSecundario }]}>
                    {e.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Campo de texto */}
        <View style={[styles.inputCard, { backgroundColor: colores.fondoTarjeta }, texto.length > 0 && { borderColor: colores.acento, borderWidth: 1.5 }]}>
          <View style={styles.inputHeader}>
            <Ionicons name="pencil-outline" size={18} color={colores.acento} />
            <Text style={[styles.inputPlaceholderTitle, { color: colores.acento }]}>
              Escribe lo que hay en tu corazón...
            </Text>
          </View>
          <TextInput
            style={[styles.input, { color: colores.texto }]}
            placeholder="¿Qué pasó hoy? ¿Qué sentiste? ¿Qué quieres recordar?"
            placeholderTextColor={colores.textoSecundario}
            multiline
            value={texto}
            onChangeText={setTexto}
            maxLength={5000}
          />
          <View style={styles.inputFooter}>
            <Text style={[styles.borradorIndicador, { color: '#4ecdc4', opacity: borradorGuardado ? 1 : 0 }]}>
              ✓ Borrador guardado
            </Text>
            <Text style={[styles.contador, { color: texto.length > 4500 ? '#ff6b6b' : colores.textoSecundario }]}>
              {texto.length}/5000
            </Text>
          </View>
        </View>

        {/* Imágenes adjuntas */}
        {imagenes.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagenesContainer}>
            {imagenes.map((uri) => (
              <View key={uri} style={styles.imagenWrapper}>
                <Image source={{ uri }} style={styles.imagen} />
                <TouchableOpacity style={styles.imagenEliminar} onPress={() => setImagenes(imagenes.filter((i) => i !== uri))}>
                  <Ionicons name="close-circle" size={22} color="#ff6b6b" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Audio grabado */}
        {audioUri && (
          <TouchableOpacity style={[styles.audioContainer, { backgroundColor: colores.fondoTarjeta }]} onPress={reproducirAudio}>
            <Ionicons name={reproduciendo ? 'pause-circle' : 'play-circle'} size={32} color={colores.acento} />
            <Text style={[styles.audioTexto, { color: colores.texto }]}>
              {reproduciendo ? 'Pausar audio' : 'Reproducir nota de voz'}
            </Text>
            <TouchableOpacity onPress={() => setAudioUri(null)}>
              <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        {/* Botón modo guiado */}
        <TouchableOpacity
          style={[styles.botonGuiado, { backgroundColor: colores.fondoTarjeta, borderColor: colores.acento + '40' }]}
          onPress={() => setModalGuiado(true)}
        >
          <Ionicons name="compass-outline" size={20} color={colores.acento} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.botonGuiadoTitulo, { color: colores.texto }]}>Modo guiado</Text>
            <Text style={[styles.botonGuiadoSub, { color: colores.textoSecundario }]}>La IA te ayuda a escribir paso a paso</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colores.acento} />
        </TouchableOpacity>

        {/* Botones multimedia */}
        <View style={styles.botonesMultimedia}>
          <TouchableOpacity style={[styles.btnMedia, { backgroundColor: colores.fondoTarjeta }]} onPress={agregarImagen}>
            <Ionicons name="image-outline" size={22} color={colores.acento} />
            <View style={styles.btnMediaTexto}>
              <Text style={[styles.btnMediaTitulo, { color: colores.texto }]} numberOfLines={1}>Galería</Text>
              <Text style={[styles.btnMediaSub, { color: colores.textoSecundario }]} numberOfLines={1}>Foto del momento</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnMedia, { backgroundColor: colores.fondoTarjeta }]} onPress={tomarFoto}>
            <Ionicons name="camera-outline" size={22} color={colores.acento} />
            <View style={styles.btnMediaTexto}>
              <Text style={[styles.btnMediaTitulo, { color: colores.texto }]} numberOfLines={1}>Cámara</Text>
              <Text style={[styles.btnMediaSub, { color: colores.textoSecundario }]} numberOfLines={1}>Captura algo</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnMedia, { backgroundColor: grabando ? '#ff6b6b22' : colores.fondoTarjeta }]}
            onPress={grabando ? detenerGrabacion : iniciarGrabacion}
          >
            <Ionicons name={grabando ? 'stop-circle-outline' : 'mic-outline'} size={22} color={grabando ? '#ff6b6b' : colores.acento} />
            <View style={styles.btnMediaTexto}>
              <Text style={[styles.btnMediaTitulo, { color: grabando ? '#ff6b6b' : colores.texto }]} numberOfLines={1}>
                {grabando ? 'Detener' : 'Grabar'}
              </Text>
              <Text style={[styles.btnMediaSub, { color: colores.textoSecundario }]} numberOfLines={1}>Tu voz</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Botón guardar */}
        <TouchableOpacity
          style={[styles.boton, guardadoExitoso && { backgroundColor: '#4ecdc4' }, !hayContenido && styles.botonDesactivado]}
          disabled={!hayContenido || guardando}
          onPress={guardarEntrada}
        >
          <Ionicons name={guardadoExitoso ? 'checkmark-circle-outline' : 'save-outline'} size={20} color="#fff" />
          <Text style={styles.botonTexto}>
            {guardadoExitoso ? '¡Entrada guardada!' : guardando ? 'Guardando...' : 'Guardar entrada'}
          </Text>
        </TouchableOpacity>

        {/* Nota privacidad */}
        <View style={styles.privacidad}>
          <Ionicons name="lock-closed-outline" size={12} color={colores.textoSecundario} />
          <Text style={[styles.privacidadTexto, { color: colores.textoSecundario }]}>Tu diario es privado y seguro</Text>
        </View>

      </ScrollView>

      <ModoGuiado
        visible={modalGuiado}
        emocion={emocionSeleccionada}
        onCerrar={() => setModalGuiado(false)}
        onEntradaGenerada={(textoGenerado) => setTexto(textoGenerado)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitulo: { fontSize: 14 },
  emocionCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
  emocionTitulo: { fontSize: 14, marginBottom: 12 },
  emocionesGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  emocionItem: { alignItems: 'center', gap: 6 },
  emocionCirculo: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  emocionEmoji: { fontSize: 26 },
  emocionLabel: { fontSize: 11 },
  inputCard: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1.5, borderColor: 'transparent' },
  inputHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  inputPlaceholderTitle: { fontSize: 14, fontWeight: '600' },
  input: { fontSize: 15, lineHeight: 22, minHeight: 120, textAlignVertical: 'top' },
  contador: { fontSize: 11, textAlign: 'right', marginTop: 8 },
  imagenesContainer: { marginBottom: 16 },
  imagenWrapper: { position: 'relative', marginRight: 8 },
  imagen: { width: 100, height: 100, borderRadius: 12 },
  imagenEliminar: { position: 'absolute', top: -6, right: -6 },
  audioContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 12, marginBottom: 16 },
  audioTexto: { flex: 1, fontSize: 14 },
  botonesMultimedia: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  btnMedia: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 14, padding: 10, overflow: 'hidden', minWidth: 0 },
  btnMediaTexto: { flex: 1, minWidth: 0 },
  btnMediaTitulo: { fontSize: 11, fontWeight: 'bold' },
  btnMediaSub: { fontSize: 9, marginTop: 1 },
  boton: { backgroundColor: '#7c6af7', borderRadius: 16, padding: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 12 },
  botonDesactivado: { opacity: 0.4 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  privacidad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 8 },
  privacidadTexto: { fontSize: 12 },
  botonGuiado: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1.5 },
  botonGuiadoTitulo: { fontSize: 14, fontWeight: 'bold' },
  botonGuiadoSub: { fontSize: 12, marginTop: 2 },
  inputFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  borradorIndicador: { fontSize: 11, fontWeight: '600' },
});
