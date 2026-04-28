import { useTema } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const temas = [
  { id: 'oscuro', emoji: '🌙', label: 'Oscuro' },
  { id: 'claro', emoji: '☀️', label: 'Claro' },
  { id: 'sistema', emoji: '📱', label: 'Sistema' },
];

export default function TemaSelector() {
  const { tema, cambiarTema, colores } = useTema();

  return (
    <View style={styles.container}>
      <Text style={[styles.titulo, { color: colores.texto }]}>🎨 Tema</Text>
      <View style={[styles.tarjeta, { backgroundColor: colores.fondoTarjeta }]}>
        {temas.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[
              styles.opcion,
              { borderBottomColor: colores.fondo },
              tema === t.id && { backgroundColor: colores.fondo },
            ]}
            onPress={() => cambiarTema(t.id as any)}
          >
            <Text style={styles.emoji}>{t.emoji}</Text>
            <Text style={[styles.label, { color: tema === t.id ? colores.texto : colores.textoSecundario }]}>
              {t.label}
            </Text>
            {tema === t.id && (
              <Ionicons name="checkmark-circle" size={18} color={colores.acento} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  titulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  tarjeta: { borderRadius: 16, overflow: 'hidden' },
  opcion: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, gap: 12 },
  emoji: { fontSize: 20 },
  label: { flex: 1, fontSize: 15 },
});