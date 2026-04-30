import { useTema } from '@/contexts/ThemeContext';
import { convertirRespuestasAEntrada, generarPreguntaGuiada } from '@/services/ia';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import {
  ActivityIndicator, Alert, Modal, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';

type Props = {
  visible: boolean;
  emocion: string | null;
  onCerrar: () => void;
  onEntradaGenerada: (texto: string) => void;
};

const MAX_PREGUNTAS = 4;

export default function ModoGuiado({ visible, emocion, onCerrar, onEntradaGenerada }: Props) {
  const { colores } = useTema();
  const [paso, setPaso] = useState<'intro' | 'pregunta' | 'generando' | 'resultado'>('intro');
  const [preguntaActual, setPreguntaActual] = useState('');
  const [respuestaActual, setRespuestaActual] = useState('');
  const [preguntas, setPreguntas] = useState<string[]>([]);
  const [respuestas, setRespuestas] = useState<string[]>([]);
  const [entradaGenerada, setEntradaGenerada] = useState('');
  const [cargando, setCargando] = useState(false);
  const [numeroPregunta, setNumeroPregunta] = useState(1);

  const iniciar = async () => {
    setCargando(true);
    setPaso('pregunta');
    try {
      const perfilDatos = await AsyncStorage.getItem('perfil');
      const perfil = perfilDatos ? JSON.parse(perfilDatos) : { camino: 'todo' };
      const pregunta = await generarPreguntaGuiada(emocion, perfil.camino, []);
      setPreguntaActual(pregunta);
      setPreguntas([pregunta]);
    } catch {
      Alert.alert('Error', 'No se pudo conectar con la IA');
      onCerrar();
    }
    setCargando(false);
  };

  const siguientePregunta = async () => {
    if (!respuestaActual.trim()) {
      Alert.alert('Escribe algo', 'Por favor responde la pregunta antes de continuar');
      return;
    }

    const nuevasRespuestas = [...respuestas, respuestaActual];
    setRespuestas(nuevasRespuestas);
    setRespuestaActual('');

    if (numeroPregunta >= MAX_PREGUNTAS) {
      await generarEntrada(preguntas, nuevasRespuestas);
      return;
    }

    setCargando(true);
    try {
      const perfilDatos = await AsyncStorage.getItem('perfil');
      const perfil = perfilDatos ? JSON.parse(perfilDatos) : { camino: 'todo' };
      const nuevaPregunta = await generarPreguntaGuiada(emocion, perfil.camino, nuevasRespuestas);
      setPreguntaActual(nuevaPregunta);
      setPreguntas([...preguntas, nuevaPregunta]);
      setNumeroPregunta(numeroPregunta + 1);
    } catch {
      Alert.alert('Error', 'No se pudo conectar con la IA');
    }
    setCargando(false);
  };

  const generarEntrada = async (preguntasList: string[], respuestasList: string[]) => {
    setPaso('generando');
    try {
      const perfilDatos = await AsyncStorage.getItem('perfil');
      const perfil = perfilDatos ? JSON.parse(perfilDatos) : { camino: 'todo' };
      const entrada = await convertirRespuestasAEntrada(preguntasList, respuestasList, perfil.camino);
      setEntradaGenerada(entrada);
      setPaso('resultado');
    } catch {
      Alert.alert('Error', 'No se pudo generar la entrada');
      setPaso('pregunta');
    }
  };

  const usarEntrada = () => {
    onEntradaGenerada(entradaGenerada);
    resetear();
    onCerrar();
  };

  const resetear = () => {
    setPaso('intro');
    setPreguntaActual('');
    setRespuestaActual('');
    setPreguntas([]);
    setRespuestas([]);
    setEntradaGenerada('');
    setNumeroPregunta(1);
  };

  const cerrar = () => {
    resetear();
    onCerrar();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={cerrar}>
      <View style={styles.fondo}>
        <View style={[styles.modal, { backgroundColor: colores.fondoTarjeta }]}>
          <View style={[styles.handle, { backgroundColor: colores.textoSecundario }]} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="compass-outline" size={22} color={colores.acento} />
              <Text style={[styles.headerTitulo, { color: colores.texto }]}>Modo guiado</Text>
            </View>
            <TouchableOpacity onPress={cerrar}>
              <Ionicons name="close" size={24} color={colores.textoSecundario} />
            </TouchableOpacity>
          </View>

          {/* INTRO */}
          {paso === 'intro' && (
            <View style={styles.intro}>
              <Text style={styles.introEmoji}>🧭</Text>
              <Text style={[styles.introTitulo, { color: colores.texto }]}>
                ¿No sabes qué escribir?
              </Text>
              <Text style={[styles.introDesc, { color: colores.textoSecundario }]}>
                La IA te hará {MAX_PREGUNTAS} preguntas para ayudarte a reflexionar. Al final, convertirá tus respuestas en una entrada hermosa.
              </Text>
              <View style={styles.introSteps}>
                {['La IA te pregunta', 'Tú respondes', 'Se genera tu entrada'].map((step, i) => (
                  <View key={i} style={styles.introStep}>
                    <View style={[styles.introStepNum, { backgroundColor: colores.acento }]}>
                      <Text style={styles.introStepNumTexto}>{i + 1}</Text>
                    </View>
                    <Text style={[styles.introStepTexto, { color: colores.textoSecundario }]}>{step}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.botonIniciar, { backgroundColor: colores.acento }]}
                onPress={iniciar}
              >
                <Ionicons name="sparkles" size={18} color="#fff" />
                <Text style={styles.botonIniciarTexto}>Comenzar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* PREGUNTA */}
          {paso === 'pregunta' && (
            <View style={styles.preguntaContainer}>
              {/* Progreso */}
              <View style={styles.progreso}>
                {Array.from({ length: MAX_PREGUNTAS }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.progresoBar,
                      { backgroundColor: i < numeroPregunta ? colores.acento : colores.fondo }
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.progresoTexto, { color: colores.textoSecundario }]}>
                Pregunta {numeroPregunta} de {MAX_PREGUNTAS}
              </Text>

              {cargando ? (
                <View style={styles.cargando}>
                  <ActivityIndicator color={colores.acento} size="large" />
                  <Text style={[styles.cargandoTexto, { color: colores.textoSecundario }]}>
                    La IA está pensando...
                  </Text>
                </View>
              ) : (
                <>
                  <View style={[styles.preguntaCard, { backgroundColor: colores.fondo }]}>
                    <Ionicons name="sparkles" size={18} color={colores.acento} />
                    <Text style={[styles.preguntaTexto, { color: colores.texto }]}>{preguntaActual}</Text>
                  </View>

                  <TextInput
                    style={[styles.respuestaInput, { backgroundColor: colores.fondo, color: colores.texto }]}
                    placeholder="Escribe tu respuesta aquí..."
                    placeholderTextColor={colores.textoSecundario}
                    value={respuestaActual}
                    onChangeText={setRespuestaActual}
                    multiline
                    autoFocus
                  />

                  <View style={styles.botones}>
                    {numeroPregunta > 1 && (
                      <TouchableOpacity
                        style={[styles.botonSaltar, { backgroundColor: colores.fondo }]}
                        onPress={() => generarEntrada(preguntas, [...respuestas, respuestaActual])}
                      >
                        <Text style={[styles.botonSaltarTexto, { color: colores.textoSecundario }]}>
                          Generar ya
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.botonSiguiente, { backgroundColor: colores.acento }]}
                      onPress={siguientePregunta}
                    >
                      <Text style={styles.botonSiguienteTexto}>
                        {numeroPregunta >= MAX_PREGUNTAS ? 'Generar entrada' : 'Siguiente'}
                      </Text>
                      <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          )}

          {/* GENERANDO */}
          {paso === 'generando' && (
            <View style={styles.cargando}>
              <ActivityIndicator color={colores.acento} size="large" />
              <Text style={[styles.cargandoTitulo, { color: colores.texto }]}>
                Creando tu entrada ✨
              </Text>
              <Text style={[styles.cargandoTexto, { color: colores.textoSecundario }]}>
                La IA está convirtiendo tus respuestas en una entrada hermosa...
              </Text>
            </View>
          )}

          {/* RESULTADO */}
          {paso === 'resultado' && (
            <View style={styles.resultadoContainer}>
              <Text style={[styles.resultadoTitulo, { color: colores.texto }]}>
                ✨ Tu entrada está lista
              </Text>
              <ScrollView style={[styles.resultadoScroll, { backgroundColor: colores.fondo }]}>
                <Text style={[styles.resultadoTexto, { color: colores.texto }]}>{entradaGenerada}</Text>
              </ScrollView>
              <View style={styles.botones}>
                <TouchableOpacity
                  style={[styles.botonSaltar, { backgroundColor: colores.fondo }]}
                  onPress={() => { resetear(); setPaso('intro'); }}
                >
                  <Text style={[styles.botonSaltarTexto, { color: colores.textoSecundario }]}>
                    Empezar de nuevo
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.botonSiguiente, { backgroundColor: colores.acento }]}
                  onPress={usarEntrada}
                >
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text style={styles.botonSiguienteTexto}>Usar esta entrada</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, maxHeight: '90%' },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitulo: { fontSize: 18, fontWeight: 'bold' },
  intro: { alignItems: 'center', gap: 16 },
  introEmoji: { fontSize: 52 },
  introTitulo: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  introDesc: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  introSteps: { width: '100%', gap: 10 },
  introStep: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  introStepNum: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  introStepNumTexto: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  introStepTexto: { fontSize: 14 },
  botonIniciar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16, marginTop: 8 },
  botonIniciarTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  preguntaContainer: { gap: 16 },
  progreso: { flexDirection: 'row', gap: 6 },
  progresoBar: { flex: 1, height: 4, borderRadius: 2 },
  progresoTexto: { fontSize: 12, textAlign: 'center' },
  cargando: { alignItems: 'center', gap: 16, paddingVertical: 40 },
  cargandoTitulo: { fontSize: 18, fontWeight: 'bold' },
  cargandoTexto: { fontSize: 14, textAlign: 'center' },
  preguntaCard: { borderRadius: 16, padding: 16, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  preguntaTexto: { flex: 1, fontSize: 16, lineHeight: 24, fontWeight: '500' },
  respuestaInput: { borderRadius: 16, padding: 16, fontSize: 15, minHeight: 120, textAlignVertical: 'top' },
  botones: { flexDirection: 'row', gap: 10 },
  botonSaltar: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
  botonSaltarTexto: { fontSize: 14, fontWeight: '600' },
  botonSiguiente: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, padding: 14 },
  botonSiguienteTexto: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  resultadoContainer: { gap: 16 },
  resultadoTitulo: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  resultadoScroll: { borderRadius: 16, padding: 16, maxHeight: 250 },
  resultadoTexto: { fontSize: 15, lineHeight: 24 },
});