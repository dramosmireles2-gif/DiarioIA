import { useTema } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Terminos() {
  const { colores } = useTema();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colores.fondo }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={colores.texto} />
        </TouchableOpacity>
        <Text style={[styles.titulo, { color: colores.texto }]}>Términos y Privacidad</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <Text style={[styles.fecha, { color: colores.textoSecundario }]}>Última actualización: Abril 2026</Text>

        {/* Términos de uso */}
        <View style={[styles.seccion, { backgroundColor: colores.fondoTarjeta }]}>
          <Text style={[styles.seccionTitulo, { color: colores.texto }]}>📋 Términos de Uso</Text>
          <Text style={[styles.parrafo, { color: colores.textoSecundario }]}>
            Al usar Mi Diario con IA, aceptas estos términos. Esta app está diseñada para el bienestar personal y la reflexión emocional.
          </Text>
          <Text style={[styles.subTitulo, { color: colores.texto }]}>Uso apropiado</Text>
          <Text style={[styles.parrafo, { color: colores.textoSecundario }]}>
            • Esta app es para uso personal únicamente.{'\n'}
            • No debes usar la app para actividades ilegales.{'\n'}
            • El contenido generado por la IA es orientativo y no reemplaza consejo médico o psicológico profesional.
          </Text>
          <Text style={[styles.subTitulo, { color: colores.texto }]}>Contenido de IA</Text>
          <Text style={[styles.parrafo, { color: colores.textoSecundario }]}>
            Las reflexiones generadas por la IA son sugerencias basadas en tu contenido. No garantizamos su exactitud ni nos hacemos responsables de decisiones tomadas en base a ellas.
          </Text>
        </View>

        {/* Privacidad */}
        <View style={[styles.seccion, { backgroundColor: colores.fondoTarjeta }]}>
          <Text style={[styles.seccionTitulo, { color: colores.texto }]}>🔒 Política de Privacidad</Text>
          <Text style={[styles.parrafo, { color: colores.textoSecundario }]}>
            Tu privacidad es nuestra prioridad. Aquí explicamos cómo manejamos tu información.
          </Text>
          <Text style={[styles.subTitulo, { color: colores.texto }]}>Datos que guardamos</Text>
          <Text style={[styles.parrafo, { color: colores.textoSecundario }]}>
            • Nombre, edad, correo y género (proporcionados por ti){'\n'}
            • Entradas de tu diario{'\n'}
            • Preferencias de la app{'\n'}
            • Todos los datos se guardan LOCALMENTE en tu dispositivo
          </Text>
          <Text style={[styles.subTitulo, { color: colores.texto }]}>Datos que NO compartimos</Text>
          <Text style={[styles.parrafo, { color: colores.textoSecundario }]}>
            No vendemos, compartimos ni transferimos tu información personal a terceros. Tu diario es completamente privado.
          </Text>
          <Text style={[styles.subTitulo, { color: colores.texto }]}>API de Inteligencia Artificial</Text>
          <Text style={[styles.parrafo, { color: colores.textoSecundario }]}>
            Cuando usas funciones de IA, el texto de tu entrada se envía de forma segura a la API de Anthropic (Claude) para generar reflexiones. Anthropic tiene su propia política de privacidad disponible en anthropic.com.
          </Text>
          <Text style={[styles.subTitulo, { color: colores.texto }]}>Tus derechos</Text>
          <Text style={[styles.parrafo, { color: colores.textoSecundario }]}>
            • Puedes eliminar tus datos en cualquier momento desde la app{'\n'}
            • Puedes dejar de usar la app cuando quieras{'\n'}
            • Al desinstalar la app, todos tus datos locales se eliminan
          </Text>
        </View>

        {/* Contacto */}
        <View style={[styles.seccion, { backgroundColor: colores.fondoTarjeta }]}>
          <Text style={[styles.seccionTitulo, { color: colores.texto }]}>📬 Contacto</Text>
          <Text style={[styles.parrafo, { color: colores.textoSecundario }]}>
            Si tienes preguntas sobre estos términos o tu privacidad, contáctanos en:
          </Text>
          <Text style={[styles.email, { color: colores.acento }]}>dramosmirieles2@gmail.com</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  headerBtn: { padding: 4 },
  titulo: { fontSize: 20, fontWeight: 'bold' },
  fecha: { fontSize: 12, marginBottom: 16, textAlign: 'center' },
  seccion: { borderRadius: 16, padding: 16, marginBottom: 16 },
  seccionTitulo: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  subTitulo: { fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 6 },
  parrafo: { fontSize: 14, lineHeight: 22 },
  email: { fontSize: 14, fontWeight: 'bold', marginTop: 8 },
});