import { useTema } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

export default function BloqueoConfig() {
  const { colores } = useTema();
  const [activo, setActivo] = useState(false);
  const [compatible, setCompatible] = useState(false);

  useEffect(() => {
    verificarCompatibilidad();
    cargarConfig();
  }, []);

  const verificarCompatibilidad = async () => {
    const tiene = await LocalAuthentication.hasHardwareAsync();
    const registrado = await LocalAuthentication.isEnrolledAsync();
    setCompatible(tiene && registrado);
  };

  const cargarConfig = async () => {
    const datos = await AsyncStorage.getItem('bloqueo');
    if (datos) setActivo(JSON.parse(datos).activo);
  };

  const toggleBloqueo = async (valor: boolean) => {
    if (valor) {
      const resultado = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirma tu identidad para activar el bloqueo',
        fallbackLabel: 'Usar PIN',
      });
      if (!resultado.success) {
        Alert.alert('No se pudo activar', 'No se verificó tu identidad');
        return;
      }
    }
    setActivo(valor);
    await AsyncStorage.setItem('bloqueo', JSON.stringify({ activo: valor }));
    Alert.alert(valor ? '🔒 Bloqueo activado' : '🔓 Bloqueo desactivado');
  };

  if (!compatible) {
    return (
      <View style={styles.container}>
        <Text style={[styles.titulo, { color: colores.texto }]}>🔒 Bloqueo con huella</Text>
        <View style={[styles.tarjeta, { backgroundColor: colores.fondoTarjeta }]}>
          <Text style={[styles.noDisponible, { color: colores.textoSecundario }]}>
            Tu dispositivo no tiene huella registrada o no es compatible
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.titulo, { color: colores.texto }]}>🔒 Bloqueo con huella</Text>
      <View style={[styles.tarjeta, { backgroundColor: colores.fondoTarjeta }]}>
        <View style={styles.fila}>
          <View>
            <Text style={[styles.label, { color: colores.texto }]}>Proteger mi diario</Text>
            <Text style={[styles.sub, { color: colores.textoSecundario }]}>
              {activo ? 'La app pedirá tu huella al abrir' : 'La app abre sin verificación'}
            </Text>
          </View>
          <Switch
            value={activo}
            onValueChange={toggleBloqueo}
            trackColor={{ false: colores.fondo, true: colores.acento }}
            thumbColor={activo ? '#fff' : '#555'}
          />
        </View>
        {activo && (
          <View style={styles.activoRow}>
            <Ionicons name="shield-checkmark" size={16} color={colores.acento} />
            <Text style={[styles.activoTexto, { color: colores.acento }]}>Tu diario está protegido</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  titulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  tarjeta: { borderRadius: 16, padding: 16 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 15, fontWeight: 'bold' },
  sub: { fontSize: 13, marginTop: 4 },
  activoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  activoTexto: { fontSize: 13 },
  noDisponible: { fontSize: 14, textAlign: 'center' },
});