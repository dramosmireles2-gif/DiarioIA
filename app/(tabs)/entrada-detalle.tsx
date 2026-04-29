import { useTema } from '@/contexts/ThemeContext';
import { analizarEmocion, detectarEmocion, generarEtiquetas, generarReflexion, mejorarTexto, resumirTexto } from '@/services/ia';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Entrada = {
  id: string;
  texto: string;
  fecha: string;
  destacada: boolean;
  imagenes?: string[];
  audioUri?: string | null;
  emocion?: string | null;
};

export default function EntradaDetalle() {
  const [reflexion, setReflexion] = useState<string | null>(null);
  const [analisis, setAnalisis] = useState<{ nivelEstres: number; emocionPrincipal: string; resumen: string } | null>(null);
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [cargandoIA, setCargandoIA] = useState(false);
  const [cargandoModal, setCargandoModal] = useState(false);
  const [mensajeModal, setMensajeModal] = useState('');
  const { colores } = useTema();
  const { id, analizar } = useLocalSearchParams();
  const router = useRouter();
  const [entrada, setEntrada] = useState<Entrada | null>(null);
  const [editando, setEditando] = useState(false);
  const [textoEditado, setTextoEditado] = useState('');
  const [reproduciendo, setReproduciendo] = useState(false);
  const [sonido, setSonido] = useState<any>(null);
  const [verImagen, setVerImagen] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);

  const cargarEntrada = async () => {
    setReflexion(null);
    setAnalisis(null);
    setEtiquetas([]);
    const datos = await AsyncStorage.getItem('entradas');
    if (datos) {
      const entradas: Entrada[] = JSON.parse(datos);
      const encontrada = entradas.find((e) => e.id === id);
      if (encontrada) {
        setEntrada(encontrada);
        if ((encontrada as any).reflexion) setReflexion((encontrada as any).reflexion);
        if ((encontrada as any).analisis) setAnalisis((encontrada as any).analisis);
        if ((encontrada as any).etiquetas) setEtiquetas((encontrada as any).etiquetas);
        if (analizar === 'true' && !(encontrada as any).reflexion) {
          ejecutarAnalisisIA(encontrada);
        }
      }
    }
  };

  useFocusEffect(useCallback(() => { cargarEntrada(); }, [id]));

  const toggleDestacada = async () => {
    if (!entrada) return;
    const datos = await AsyncStorage.getItem('entradas');
    if (!datos) return;
    const entradas: Entrada[] = JSON.parse(datos);
    const nuevas = entradas.map((e) => e.id === entrada.id ? { ...e, destacada: !e.destacada } : e);
    await AsyncStorage.setItem('entradas', JSON.stringify(nuevas));
    setEntrada({ ...entrada, destacada: !entrada.destacada });
  };

  const eliminar = () => {
    Alert.alert('Eliminar entrada', '¿Estás seguro que quieres borrarla?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          const datos = await AsyncStorage.getItem('entradas');
          if (!datos) return;
          const entradas: Entrada[] = JSON.parse(datos);
          const nuevas = entradas.filter((e) => e.id !== entrada?.id);
          await AsyncStorage.setItem('entradas', JSON.stringify(nuevas));
          router.back();
        },
      },
    ]);
  };

  const guardarEdicion = async () => {
    if (!entrada) return;
    const datos = await AsyncStorage.getItem('entradas');
    if (!datos) return;
    const entradas: Entrada[] = JSON.parse(datos);
    const nuevas = entradas.map((e) => e.id === entrada.id ? { ...e, texto: textoEditado } : e);
    await AsyncStorage.setItem('entradas', JSON.stringify(nuevas));
    setEntrada({ ...entrada, texto: textoEditado });
    setEditando(false);
  };

  const reproducirAudio = async () => {
    if (!entrada?.audioUri) return;
    if (sonido) {
      await sonido.unloadAsync();
      setSonido(null);
      setReproduciendo(false);
      return;
    }
    const { Audio } = await import('expo-av');
    const { sound } = await Audio.Sound.createAsync({ uri: entrada.audioUri });
    setSonido(sound);
    setReproduciendo(true);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status: any) => {
      if (status.isLoaded && status.didJustFinish) {
        setReproduciendo(false);
        setSonido(null);
      }
    });
  };

  const ejecutarAnalisisIA = async (entradaActual: Entrada) => {
    if (!entradaActual.texto) return;
    setCargandoIA(true);
    try {
      const perfilDatos = await AsyncStorage.getItem('perfil');
      const perfil = perfilDatos ? JSON.parse(perfilDatos) : { camino: 'todo' };
      const [reflexionIA, analisisIA, etiquetasIA] = await Promise.all([
        generarReflexion(entradaActual.texto, perfil.camino, entradaActual.emocion || null),
        analizarEmocion(entradaActual.texto),
        generarEtiquetas(entradaActual.texto),
      ]);
      setReflexion(reflexionIA);
      setAnalisis(analisisIA);
      setEtiquetas(etiquetasIA);
      const datos = await AsyncStorage.getItem('entradas');
      if (datos) {
        const entradas: Entrada[] = JSON.parse(datos);
        const nuevas = entradas.map((e) =>
          e.id === entradaActual.id
            ? { ...e, reflexion: reflexionIA, analisis: analisisIA, etiquetas: etiquetasIA }
            : e
        );
        await AsyncStorage.setItem('entradas', JSON.stringify(nuevas));
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con la IA. Verifica tu conexión.');
    }
    setCargandoIA(false);
  };

  const handleMejorarTexto = async () => {
    if (!textoEditado) return;
    setCargandoModal(true);
    setMensajeModal('Mejorando tu texto...');
    try {
      const perfilDatos = await AsyncStorage.getItem('perfil');
      const perfil = perfilDatos ? JSON.parse(perfilDatos) : { camino: 'todo' };
      const mejorado = await mejorarTexto(textoEditado, perfil.camino);
      setTextoEditado(mejorado);
      setMensajeModal('✅ Texto mejorado');
      setTimeout(() => setMensajeModal(''), 2000);
    } catch {
      setMensajeModal('Error al mejorar el texto');
      setTimeout(() => setMensajeModal(''), 2000);
    }
    setCargandoModal(false);
  };

  const handleResumirTexto = async () => {
    if (!textoEditado) return;
    setCargandoModal(true);
    setMensajeModal('Generando resumen...');
    try {
      const perfilDatos = await AsyncStorage.getItem('perfil');
      const perfil = perfilDatos ? JSON.parse(perfilDatos) : { camino: 'todo' };
      const resumen = await resumirTexto(textoEditado, perfil.camino);
      Alert.alert('📄 Resumen de tu entrada', resumen, [
        { text: 'Usar como texto', onPress: () => setTextoEditado(resumen) },
        { text: 'Cerrar', style: 'cancel' },
      ]);
      setMensajeModal('');
    } catch {
      setMensajeModal('Error al resumir');
      setTimeout(() => setMensajeModal(''), 2000);
    }
    setCargandoModal(false);
  };

  const handleDetectarEmocion = async () => {
    if (!textoEditado) return;
    setCargandoModal(true);
    setMensajeModal('Analizando emoción...');
    try {
      const emocion = await detectarEmocion(textoEditado);
      Alert.alert('😊 Emoción detectada', emocion);
      setMensajeModal('');
    } catch {
      setMensajeModal('Error al analizar');
      setTimeout(() => setMensajeModal(''), 2000);
    }
    setCargandoModal(false);
  };

  if (!entrada) return null;

  const fecha = new Date(entrada.fecha);
  const palabras = entrada.texto.split(' ').filter(Boolean).length;

  return (
    <View style={[styles.container, { backgroundColor: colores.fondo }]}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={colores.texto} />
        </TouchableOpacity>
        <View style={styles.headerBotones}>
          <TouchableOpacity onPress={toggleDestacada} style={styles.headerBtn}>
            <Ionicons name={entrada.destacada ? 'star' : 'star-outline'} size={22} color={entrada.destacada ? '#f5c518' : colores.textoSecundario} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setTextoEditado(entrada.texto); setEditando(true); }} style={styles.headerBtn}>
            <Ionicons name="pencil-outline" size={22} color={colores.acento} />
          </TouchableOpacity>
          <TouchableOpacity onPress={eliminar} style={styles.headerBtn}>
            <Ionicons name="trash-outline" size={22} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={styles.fechaRow}>
          <View>
            <View style={styles.fechaFila}>
              <Ionicons name="calendar-outline" size={14} color={colores.acento} />
              <Text style={[styles.fechaTexto, { color: colores.acento }]}>
                {fecha.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </View>
            <Text style={[styles.horaTexto, { color: colores.textoSecundario }]}>
              {fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          {entrada.emocion && (
            <View style={[styles.emocionBadge, { backgroundColor: colores.fondoTarjeta }]}>
              <Text style={styles.emocionEmoji}>
                {entrada.emocion === 'Genial' ? '😄' : entrada.emocion === 'Bien' ? '🙂' : entrada.emocion === 'Neutral' ? '😐' : entrada.emocion === 'Triste' ? '😢' : entrada.emocion === 'Enojado' ? '😠' : '😴'}
              </Text>
              <Text style={[styles.emocionTexto, { color: colores.textoSecundario }]}>{entrada.emocion}</Text>
            </View>
          )}
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colores.fondoTarjeta }]}>
            <View style={[styles.statIcono, { backgroundColor: '#7c6af722' }]}>
              <Ionicons name="text-outline" size={18} color={colores.acento} />
            </View>
            <Text style={[styles.statValor, { color: colores.texto }]}>{entrada.texto.length}</Text>
            <Text style={[styles.statLabel, { color: colores.textoSecundario }]}>caracteres</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colores.fondoTarjeta }]}>
            <View style={[styles.statIcono, { backgroundColor: '#ff6b6b22' }]}>
              <Ionicons name="chatbubble-outline" size={18} color="#ff6b6b" />
            </View>
            <Text style={[styles.statValor, { color: colores.texto }]}>{palabras}</Text>
            <Text style={[styles.statLabel, { color: colores.textoSecundario }]}>palabras</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colores.fondoTarjeta }]}>
            <View style={[styles.statIcono, { backgroundColor: '#f5c51822' }]}>
              <Ionicons name="time-outline" size={18} color="#f5c518" />
            </View>
            <Text style={[styles.statValor, { color: colores.texto }]}>{Math.ceil(palabras / 200) || 1}</Text>
            <Text style={[styles.statLabel, { color: colores.textoSecundario }]}>min lectura</Text>
          </View>
        </View>

        <View style={[styles.textoCard, { backgroundColor: colores.fondoTarjeta }]}>
          <Text style={[styles.texto, { color: colores.texto }]}>{entrada.texto}</Text>
        </View>

        <View style={[styles.reflexionCard, { backgroundColor: colores.acento + '15', borderColor: colores.acento + '30' }]}>
          <View style={styles.reflexionHeader}>
            <Ionicons name="sparkles" size={20} color={colores.acento} />
            <Text style={[styles.reflexionTitulo, { color: colores.acento }]}>Reflexión de IA</Text>
            {cargandoIA && <Text style={[styles.reflexionSub, { color: colores.textoSecundario }]}>Analizando...</Text>}
          </View>
          {reflexion ? (
            <Text style={[styles.reflexionTextoContenido, { color: colores.texto }]}>{reflexion}</Text>
          ) : cargandoIA ? (
            <Text style={[styles.reflexionSub, { color: colores.textoSecundario }]}>La IA está generando tu reflexión... ✨</Text>
          ) : (
            <TouchableOpacity onPress={() => entrada && ejecutarAnalisisIA(entrada)}>
              <Text style={[styles.reflexionSub, { color: colores.acento }]}>Toca para generar reflexión con IA ✨</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.seccion}>
          <View style={styles.seccionHeader}>
            <Ionicons name="pricetag-outline" size={16} color={colores.textoSecundario} />
            <Text style={[styles.seccionTitulo, { color: colores.texto }]}>Etiquetas</Text>
          </View>
          <View style={styles.etiquetasRow}>
            {etiquetas.length > 0 ? (
              etiquetas.map((etiqueta) => (
                <View key={etiqueta} style={[styles.etiqueta, { backgroundColor: colores.acento + '20' }]}>
                  <Text style={[styles.etiquetaTexto, { color: colores.acento }]}>{etiqueta}</Text>
                </View>
              ))
            ) : cargandoIA ? (
              <View style={[styles.etiqueta, { backgroundColor: colores.acento + '20' }]}>
                <Text style={[styles.etiquetaTexto, { color: colores.acento }]}>Generando etiquetas...</Text>
              </View>
            ) : (
              <View style={[styles.etiqueta, { backgroundColor: colores.acento + '20' }]}>
                <Text style={[styles.etiquetaTexto, { color: colores.acento }]}>Sin etiquetas aún</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.seccion}>
          <View style={styles.seccionHeader}>
            <Ionicons name="attach-outline" size={16} color={colores.textoSecundario} />
            <Text style={[styles.seccionTitulo, { color: colores.texto }]}>Archivos adjuntos</Text>
          </View>
          {entrada.imagenes && entrada.imagenes.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {entrada.imagenes.map((uri) => (
                <TouchableOpacity key={uri} onPress={() => { setImagenSeleccionada(uri); setVerImagen(true); }}>
                  <Image source={{ uri }} style={styles.imagenAdjunta} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={[styles.sinAdjuntos, { color: colores.textoSecundario }]}>No hay imágenes adjuntas.</Text>
          )}
          {entrada.audioUri ? (
            <TouchableOpacity style={[styles.audioAdjunto, { backgroundColor: colores.fondoTarjeta }]} onPress={reproducirAudio}>
              <Ionicons name={reproduciendo ? 'pause-circle' : 'play-circle'} size={32} color={colores.acento} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.audioTexto, { color: colores.texto }]}>
                  {reproduciendo ? 'Pausar nota de voz' : 'Reproducir nota de voz'}
                </Text>
                <Text style={{ color: colores.textoSecundario, fontSize: 11 }}>Toca para {reproduciendo ? 'pausar' : 'escuchar'}</Text>
              </View>
              <Ionicons name="mic-outline" size={18} color={colores.textoSecundario} />
            </TouchableOpacity>
          ) : (
            <Text style={[styles.sinAdjuntos, { color: colores.textoSecundario }]}>No hay audio adjunto.</Text>
          )}
        </View>

        <View style={[styles.iaCard, { backgroundColor: colores.acento + '15', borderColor: colores.acento + '30' }]}>
          <View style={styles.iaHeader}>
            <Ionicons name="bulb-outline" size={18} color={colores.acento} />
            <Text style={[styles.iaTitulo, { color: colores.acento }]}>Análisis de IA</Text>
          </View>
          <View style={styles.iaContenido}>
            <Text style={[styles.iaTexto, { color: colores.textoSecundario }]}>
              {analisis ? analisis.resumen : cargandoIA ? 'Analizando tus emociones...' : 'Toca para analizar con IA'}
            </Text>
            <View style={styles.nivelContainer}>
              <View style={[styles.nivelCirculo, { borderColor: analisis ? '#7c6af7' : colores.acento }]}>
                <Text style={[styles.nivelNumero, { color: colores.acento }]}>
                  {analisis ? analisis.nivelEstres : cargandoIA ? '...' : '?'}
                </Text>
              </View>
              <Text style={[styles.nivelLabel, { color: colores.textoSecundario }]}>Nivel de{'\n'}estrés</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.fechaCreacion, { color: colores.textoSecundario }]}>
          Creada el {fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })} a las {fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
        </Text>

      </ScrollView>

      <Modal visible={verImagen} transparent animationType="fade">
        <View style={styles.imagenModal}>
          <TouchableOpacity style={styles.imagenModalCerrar} onPress={() => setVerImagen(false)}>
            <Ionicons name="close-circle" size={36} color="#fff" />
          </TouchableOpacity>
          {imagenSeleccionada && (
            <Image source={{ uri: imagenSeleccionada }} style={styles.imagenCompleta} resizeMode="contain" />
          )}
        </View>
      </Modal>

      <Modal visible={editando} animationType="slide" transparent>
        <View style={styles.modalFondo}>
          <View style={[styles.modal, { backgroundColor: colores.fondoTarjeta }]}>
            <View style={[styles.modalHandle, { backgroundColor: colores.textoSecundario }]} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitulo, { color: colores.texto }]}>Editar entrada</Text>
              <Ionicons name="pencil" size={18} color={colores.acento} />
            </View>
            <View style={styles.modalFechaRow}>
              <View style={[styles.modalFechaBadge, { backgroundColor: colores.fondo }]}>
                <Ionicons name="calendar-outline" size={13} color={colores.textoSecundario} />
                <Text style={[styles.modalFechaTexto, { color: colores.textoSecundario }]}>
                  {fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              </View>
              <View style={[styles.modalFechaBadge, { backgroundColor: colores.fondo }]}>
                <Ionicons name="time-outline" size={13} color={colores.textoSecundario} />
                <Text style={[styles.modalFechaTexto, { color: colores.textoSecundario }]}>
                  {fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              {entrada.emocion && (
                <View style={[styles.modalEmocionBadge, { backgroundColor: colores.fondo }]}>
                  <Text>{entrada.emocion === 'Genial' ? '😄' : entrada.emocion === 'Bien' ? '🙂' : entrada.emocion === 'Neutral' ? '😐' : entrada.emocion === 'Triste' ? '😢' : entrada.emocion === 'Enojado' ? '😠' : '😴'}</Text>
                  <Text style={[styles.modalFechaTexto, { color: colores.textoSecundario }]}>{entrada.emocion}</Text>
                  <Ionicons name="chevron-down" size={12} color={colores.textoSecundario} />
                </View>
              )}
            </View>
            <View style={[styles.modalInputCard, { backgroundColor: colores.fondo, borderColor: colores.acento + '40' }]}>
              <TextInput
                style={[styles.modalInput, { color: colores.texto }]}
                value={textoEditado}
                onChangeText={setTextoEditado}
                multiline
                placeholderTextColor={colores.textoSecundario}
              />
              <View style={styles.modalStats}>
                <View style={styles.modalStat}>
                  <Ionicons name="text-outline" size={12} color={colores.textoSecundario} />
                  <Text style={[styles.modalStatTexto, { color: colores.textoSecundario }]}>{textoEditado.length} caracteres</Text>
                </View>
                <View style={styles.modalStat}>
                  <Ionicons name="chatbubble-outline" size={12} color={colores.textoSecundario} />
                  <Text style={[styles.modalStatTexto, { color: colores.textoSecundario }]}>{textoEditado.split(' ').filter(Boolean).length} palabras</Text>
                </View>
                <View style={styles.modalStat}>
                  <Ionicons name="time-outline" size={12} color={colores.textoSecundario} />
                  <Text style={[styles.modalStatTexto, { color: colores.textoSecundario }]}>{Math.ceil(textoEditado.split(' ').filter(Boolean).length / 200) || 1} min</Text>
                </View>
              </View>
            </View>

            <View style={[styles.modalIaCard, { backgroundColor: colores.acento + '15' }]}>
              <Ionicons name="sparkles" size={18} color={colores.acento} />
              <View style={styles.modalIaTexto}>
                <Text style={[styles.modalIaTitulo, { color: colores.acento }]}>Sugerencia de IA</Text>
                <Text style={[styles.modalIaSub, { color: colores.textoSecundario }]}>
                  {cargandoModal ? mensajeModal : 'Usa la IA para mejorar tu entrada'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.modalIaBtn, { borderColor: colores.acento }]}
                onPress={handleMejorarTexto}
                disabled={cargandoModal}
              >
                <Ionicons name="sparkles" size={12} color={colores.acento} />
                <Text style={[styles.modalIaBtnTexto, { color: colores.acento }]}>
                  {cargandoModal ? '...' : 'Mejorar'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalAcciones}>
              <TouchableOpacity style={[styles.modalAccionBtn, { borderColor: '#ff6b6b' }]} onPress={eliminar}>
                <Ionicons name="trash-outline" size={14} color="#ff6b6b" />
                <Text style={[styles.modalAccionTexto, { color: '#ff6b6b' }]}>Eliminar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalAccionBtn, { borderColor: colores.acento, opacity: cargandoModal ? 0.5 : 1 }]}
                onPress={handleMejorarTexto}
                disabled={cargandoModal}
              >
                <Ionicons name="sparkles-outline" size={14} color={colores.acento} />
                <Text style={[styles.modalAccionTexto, { color: colores.acento }]}>
                  {cargandoModal && mensajeModal.includes('Mejorando') ? 'Mejorando...' : 'Mejorar con IA'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalAccionBtn, { borderColor: '#4ecdc4', opacity: cargandoModal ? 0.5 : 1 }]}
                onPress={handleDetectarEmocion}
                disabled={cargandoModal}
              >
                <Ionicons name="happy-outline" size={14} color="#4ecdc4" />
                <Text style={[styles.modalAccionTexto, { color: '#4ecdc4' }]}>
                  {cargandoModal && mensajeModal.includes('emoción') ? 'Analizando...' : 'Analizar emoción'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalAccionBtn, { borderColor: '#f5c518', opacity: cargandoModal ? 0.5 : 1 }]}
                onPress={handleResumirTexto}
                disabled={cargandoModal}
              >
                <Ionicons name="document-text-outline" size={14} color="#f5c518" />
                <Text style={[styles.modalAccionTexto, { color: '#f5c518' }]}>
                  {cargandoModal && mensajeModal.includes('resumen') ? 'Resumiendo...' : 'Resumir'}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {mensajeModal !== '' && (
              <Text style={[styles.mensajeModal, { color: colores.acento }]}>{mensajeModal}</Text>
            )}

            <View style={styles.modalBotones}>
              <TouchableOpacity style={[styles.modalCancelar, { backgroundColor: colores.fondo }]} onPress={() => setEditando(false)}>
                <Text style={[styles.modalCancelarTexto, { color: colores.textoSecundario }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalGuardar} onPress={guardarEdicion}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                <Text style={styles.modalGuardarTexto}>Guardar cambios</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerBotones: { flexDirection: 'row', gap: 4 },
  headerBtn: { padding: 8 },
  fechaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  fechaFila: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fechaTexto: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  horaTexto: { fontSize: 12, marginTop: 4, marginLeft: 20 },
  emocionBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  emocionEmoji: { fontSize: 18 },
  emocionTexto: { fontSize: 13 },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 16, padding: 12, alignItems: 'center', gap: 6 },
  statIcono: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValor: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 11 },
  textoCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
  texto: { fontSize: 16, lineHeight: 28 },
  reflexionCard: { borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1 },
  reflexionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  reflexionTexto: { flex: 1 },
  reflexionTitulo: { fontSize: 14, fontWeight: 'bold' },
  reflexionSub: { fontSize: 12, marginTop: 2 },
  reflexionTextoContenido: { fontSize: 14, lineHeight: 22 },
  seccion: { marginBottom: 16 },
  seccionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  seccionTitulo: { fontSize: 15, fontWeight: 'bold' },
  etiquetasRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  etiqueta: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  etiquetaTexto: { fontSize: 13, fontWeight: '600' },
  sinAdjuntos: { fontSize: 14 },
  imagenAdjunta: { width: 100, height: 100, borderRadius: 12, marginRight: 8 },
  audioAdjunto: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginTop: 8 },
  audioTexto: { fontSize: 14 },
  iaCard: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
  iaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  iaTitulo: { fontSize: 15, fontWeight: 'bold' },
  iaContenido: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iaTexto: { flex: 1, fontSize: 13, lineHeight: 20 },
  nivelContainer: { alignItems: 'center', gap: 6 },
  nivelCirculo: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  nivelNumero: { fontSize: 22, fontWeight: 'bold' },
  nivelLabel: { fontSize: 11, textAlign: 'center' },
  fechaCreacion: { fontSize: 12, textAlign: 'center', marginBottom: 20 },
  imagenModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  imagenModalCerrar: { position: 'absolute', top: 60, right: 20, zIndex: 10 },
  imagenCompleta: { width: '100%', height: '80%' },
  modalFondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '90%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', flex: 1 },
  modalFechaRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  modalFechaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  modalFechaTexto: { fontSize: 12 },
  modalEmocionBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  modalInputCard: { borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1.5 },
  modalInput: { fontSize: 16, minHeight: 120, textAlignVertical: 'top' },
  modalStats: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  modalStatTexto: { fontSize: 11 },
  modalIaCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, padding: 12, marginBottom: 12 },
  modalIaTexto: { flex: 1 },
  modalIaTitulo: { fontSize: 13, fontWeight: 'bold' },
  modalIaSub: { fontSize: 11, marginTop: 2 },
  modalIaBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  modalIaBtnTexto: { fontSize: 12, fontWeight: 'bold' },
  modalAcciones: { marginBottom: 12 },
  modalAccionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  modalAccionTexto: { fontSize: 12, fontWeight: '600' },
  mensajeModal: { textAlign: 'center', fontSize: 13, marginBottom: 8, fontWeight: '600' },
  modalBotones: { flexDirection: 'row', gap: 12 },
  modalCancelar: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  modalCancelarTexto: { fontWeight: 'bold' },
  modalGuardar: { flex: 1, backgroundColor: '#7c6af7', borderRadius: 12, padding: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  modalGuardarTexto: { color: '#fff', fontWeight: 'bold' },
});