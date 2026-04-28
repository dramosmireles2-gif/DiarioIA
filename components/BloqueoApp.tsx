import { useTema } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  onDesbloqueado: () => void;
};

export default function BloqueoApp({ onDesbloqueado }: Props) {
  const { colores } = useTema();
  const [error, setError] = useState('');

  useEffect(() => {
    autenticar();
  }, []);

  const autenticar = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const registrado = await LocalAuthentication.isEnrolledAsync();

    if (!compatible || !registrado) {
      // Si el dispositivo no tiene huella, dejar pasar
      onDesbloqueado();
      return;
    }

    const resultado = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verifica tu identidad para abrir tu diario',
      fallbackLabel: 'Usar PIN',
      cancelLabel: 'Cancelar',
    });

    if (resultado.success) {
      onDesbloqueado();
    } else {
      setError('No se pudo verificar tu identidad');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colores.fondo }]}>
      <Ionicons name="lock-closed" size={64} color={colores.acento} />
      <Text style={[styles.titulo, { color: colores.texto }]}>Tu diario está protegido</Text>
      <Text style={[styles.subtitulo, { color: colores.textoSecundario }]}>
        Usa tu huella o PIN para acceder
      </Text>

      {error !== '' && (
        <Text style={styles.error}>{error}</Text>
      )}

      <TouchableOpacity style={[styles.boton, { backgroundColor: colores.acento }]} onPress={autenticar}>
        <Ionicons name="finger-print" size={22} color="#fff" />
        <Text style={styles.botonTexto}>Intentar de nuevo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginTop: 16 },
  subtitulo: { fontSize: 15, textAlign: 'center' },
  error: { color: '#ff6b6b', fontSize: 14, textAlign: 'center' },
  boton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, marginTop: 8 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});