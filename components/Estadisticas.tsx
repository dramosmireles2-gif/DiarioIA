import { useTema } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Entrada = {
  id: string;
  texto: string;
  fecha: string;
  destacada: boolean;
};

export default function Estadisticas() {
  const { colores } = useTema();
  const [totalEntradas, setTotalEntradas] = useState(0);
  const [racha, setRacha] = useState(0);
  const [entradaMasLarga, setEntradaMasLarga] = useState(0);
  const [diasDesde, setDiasDesde] = useState(0);

  useEffect(() => {
    calcularEstadisticas();
  }, []);

  const calcularEstadisticas = async () => {
    const datos = await AsyncStorage.getItem('entradas');
    const fechaInicio = await AsyncStorage.getItem('fechaInicio');
    const entradas: Entrada[] = datos ? JSON.parse(datos) : [];

    setTotalEntradas(entradas.length);

    if (entradas.length > 0) {
      const masLarga = Math.max(...entradas.map((e) => e.texto.length));
      setEntradaMasLarga(masLarga);
    }

    if (fechaInicio) {
      const inicio = new Date(fechaInicio);
      const hoy = new Date();
      const diff = Math.floor((hoy.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
      setDiasDesde(diff + 1);
    }

    if (entradas.length > 0) {
      const fechas = entradas.map((e) => new Date(e.fecha).toLocaleDateString('es-MX'));
      const unicas = [...new Set(fechas)];
      let rachaActual = 1;
      let hoy = new Date();
      for (let i = 0; i < unicas.length; i++) {
        const fecha = new Date(unicas[i]);
        const diff = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === i) rachaActual = i + 1;
        else break;
      }
      setRacha(rachaActual);
    }
  };

  const stats = [
    { icono: 'book-outline', valor: totalEntradas, label: 'Entradas escritas', color: '#7c6af7' },
    { icono: 'flame-outline', valor: racha, label: 'Días seguidos', color: '#ff6b6b' },
    { icono: 'calendar-outline', valor: diasDesde, label: 'Días usando la app', color: '#56cba8' },
    { icono: 'create-outline', valor: entradaMasLarga, label: 'Caracteres en tu entrada más larga', color: '#f5c518' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {stats.map((stat, index) => (
          <View key={index} style={[styles.tarjeta, { backgroundColor: colores.fondoTarjeta }]}>
            <Ionicons name={stat.icono as any} size={24} color={stat.color} />
            <Text style={[styles.valor, { color: stat.color }]}>{stat.valor}</Text>
            <Text style={[styles.label, { color: colores.textoSecundario }]}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  titulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tarjeta: { borderRadius: 16, padding: 16, alignItems: 'center', width: '47%', gap: 8 },
  valor: { fontSize: 28, fontWeight: 'bold' },
  label: { fontSize: 12, textAlign: 'center' },
});