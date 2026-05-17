import { useTema } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

const MINUTOS = [0, 15, 30, 45];

export default function Recordatorio() {
  const { colores } = useTema();
  const [activo, setActivo] = useState(false);
  const [hora, setHora] = useState(20);
  const [minuto, setMinuto] = useState(0);

  useEffect(() => {
    cargarRecordatorio();
  }, []);

  const cargarRecordatorio = async () => {
    const datos = await AsyncStorage.getItem('recordatorio');
    if (datos) {
      const r = JSON.parse(datos);
      setActivo(r.activo);
      setHora(r.hora);
      setMinuto(r.minuto);
    }
  };

  const toggleRecordatorio = async (valor: boolean) => {
    setActivo(valor);
    if (valor) {
      await programarNotificacion(hora, minuto, true);
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.setItem('recordatorio', JSON.stringify({ activo: false, hora, minuto }));
      Alert.alert('🔕 Recordatorio desactivado');
    }
  };

  const programarNotificacion = async (h: number, m: number, mostrarAlerta = false) => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos permiso para enviarte notificaciones');
      setActivo(false);
      return;
    }
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✨ Tu diario te espera',
        body: '¿Cómo te fue hoy? Escribe unas líneas para reflexionar.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: h,
        minute: m,
      },
    });
    await AsyncStorage.setItem('recordatorio', JSON.stringify({ activo: true, hora: h, minuto: m }));
    if (mostrarAlerta) {
      Alert.alert('🔔 Listo', `Te recordaremos cada día a las ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  };

  const cambiarHora = (direccion: number) => {
    const nueva = (hora + direccion + 24) % 24;
    setHora(nueva);
    if (activo) programarNotificacion(nueva, minuto);
  };

  const cambiarMinuto = (direccion: number) => {
    const idx = MINUTOS.indexOf(minuto);
    const nuevoIdx = (idx + direccion + MINUTOS.length) % MINUTOS.length;
    const nuevo = MINUTOS[nuevoIdx];
    setMinuto(nuevo);
    if (activo) programarNotificacion(hora, nuevo);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.titulo, { color: colores.texto }]}>🔔 Recordatorio diario</Text>
      <View style={[styles.tarjeta, { backgroundColor: colores.fondoTarjeta }]}>
        <View style={styles.switchRow}>
          <View>
            <Text style={[styles.switchLabel, { color: colores.texto }]}>Recordarme escribir</Text>
            <Text style={[styles.switchSub, { color: colores.textoSecundario }]}>Notificación diaria</Text>
          </View>
          <Switch
            value={activo}
            onValueChange={toggleRecordatorio}
            trackColor={{ false: colores.fondo, true: colores.acento }}
            thumbColor={activo ? '#fff' : '#555'}
          />
        </View>

        {activo && (
          <View style={styles.horaContainer}>
            <Text style={[styles.horaLabel, { color: colores.textoSecundario }]}>¿A qué hora?</Text>
            <View style={styles.horaSelector}>
              <View style={styles.columna}>
                <TouchableOpacity onPress={() => cambiarHora(1)}>
                  <Ionicons name="chevron-up" size={24} color={colores.acento} />
                </TouchableOpacity>
                <Text style={[styles.horaNumero, { color: colores.texto }]}>{hora.toString().padStart(2, '0')}</Text>
                <TouchableOpacity onPress={() => cambiarHora(-1)}>
                  <Ionicons name="chevron-down" size={24} color={colores.acento} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.separador, { color: colores.texto }]}>:</Text>
              <View style={styles.columna}>
                <TouchableOpacity onPress={() => cambiarMinuto(1)}>
                  <Ionicons name="chevron-up" size={24} color={colores.acento} />
                </TouchableOpacity>
                <Text style={[styles.horaNumero, { color: colores.texto }]}>{minuto.toString().padStart(2, '0')}</Text>
                <TouchableOpacity onPress={() => cambiarMinuto(-1)}>
                  <Ionicons name="chevron-down" size={24} color={colores.acento} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.horaActual, { color: colores.acento }]}>
              Todos los días a las {hora.toString().padStart(2, '0')}:{minuto.toString().padStart(2, '0')}
            </Text>
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
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel: { fontSize: 15, fontWeight: 'bold' },
  switchSub: { fontSize: 13, marginTop: 4 },
  horaContainer: { marginTop: 16, alignItems: 'center' },
  horaLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  horaSelector: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  columna: { alignItems: 'center', gap: 8 },
  horaNumero: { fontSize: 40, fontWeight: 'bold', width: 70, textAlign: 'center' },
  separador: { fontSize: 40, fontWeight: 'bold' },
  horaActual: { fontSize: 13, marginTop: 12 },
});