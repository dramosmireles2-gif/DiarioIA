import { useTema } from '@/contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const EMOCIONES_VALOR: { [key: string]: number } = {
  'Genial': 5,
  'Bien': 4,
  'Neutral': 3,
  'Cansado': 2,
  'Ansioso': 2,
  'Triste': 1,
  'Enojado': 1,
};

const EMOCIONES_COLOR: { [key: string]: string } = {
  'Genial': '#f5c518',
  'Bien': '#56cba8',
  'Neutral': '#9b9b9b',
  'Ansioso': '#ff9f43',
  'Cansado': '#a29bfe',
  'Triste': '#74b9ff',
  'Enojado': '#ff6b6b',
};

const EMOCIONES_EMOJI: { [key: string]: string } = {
  'Genial': '😄',
  'Bien': '🙂',
  'Neutral': '😐',
  'Ansioso': '😰',
  'Cansado': '😴',
  'Triste': '😢',
  'Enojado': '😠',
};

export default function GraficaEmocional() {
  const { colores } = useTema();
  const [datos, setDatos] = useState<{ dia: string; emocion: string; valor: number }[]>([]);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    const entradasDatos = await AsyncStorage.getItem('entradas');
    if (!entradasDatos) return;

    const entradas = JSON.parse(entradasDatos);
    const ultimos7 = [];
    const hoy = new Date();

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - i);
      const fechaStr = fecha.toDateString();

      const entradasDia = entradas.filter((e: any) =>
        new Date(e.fecha).toDateString() === fechaStr && e.emocion
      );

      const dia = fecha.toLocaleDateString('es-MX', { weekday: 'short' });

      if (entradasDia.length > 0) {
        const ultimaEmocion = entradasDia[entradasDia.length - 1].emocion;
        ultimos7.push({
          dia: dia.charAt(0).toUpperCase() + dia.slice(1),
          emocion: ultimaEmocion,
          valor: EMOCIONES_VALOR[ultimaEmocion] || 3,
        });
      } else {
        ultimos7.push({
          dia: dia.charAt(0).toUpperCase() + dia.slice(1),
          emocion: '',
          valor: 0,
        });
      }
    }

    setDatos(ultimos7);
  };

  const tieneData = datos.some((d) => d.valor > 0);
  const screenWidth = Dimensions.get('window').width - 80;

  if (!tieneData) {
    return (
      <View style={[styles.vacio, { backgroundColor: colores.fondoTarjeta }]}>
        <Text style={styles.vacioEmoji}>📊</Text>
        <Text style={[styles.vacioTexto, { color: colores.textoSecundario }]}>
          Escribe entradas con emoción para ver tu gráfica
        </Text>
      </View>
    );
  }

  const labels = datos.map((d) => d.dia);
  const values = datos.map((d) => d.valor || 0);

  return (
    <View>
      {/* Gráfica */}
      <View style={[styles.graficaContainer, { backgroundColor: colores.fondoTarjeta }]}>
        <Text style={[styles.graficaTitulo, { color: colores.texto }]}>Últimos 7 días</Text>
        <LineChart
          data={{
            labels,
            datasets: [{ data: values, color: () => colores.acento, strokeWidth: 2 }],
          }}
          width={screenWidth}
          height={160}
          yAxisInterval={1}
          fromZero
          chartConfig={{
            backgroundColor: 'transparent',
            backgroundGradientFrom: colores.fondoTarjeta,
            backgroundGradientTo: colores.fondoTarjeta,
            decimalPlaces: 0,
            color: () => colores.acento,
            labelColor: () => colores.textoSecundario,
            propsForDots: { r: '5', strokeWidth: '2', stroke: colores.acento },
            propsForBackgroundLines: { stroke: colores.fondo },
          }}
          bezier
          style={{ borderRadius: 12, marginTop: 8 }}
          withInnerLines={false}
          withOuterLines={false}
        />

        {/* Leyenda de emojis */}
        <View style={styles.leyenda}>
          {datos.map((d, i) => (
            <View key={i} style={styles.leyendaItem}>
              <Text style={styles.leyendaEmoji}>
                {d.emocion ? EMOCIONES_EMOJI[d.emocion] : '—'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Escala de referencia */}
      <View style={[styles.escala, { backgroundColor: colores.fondoTarjeta }]}>
        <Text style={[styles.escalaTitulo, { color: colores.textoSecundario }]}>Escala emocional</Text>
        <View style={styles.escalaGrid}>
          {Object.entries(EMOCIONES_EMOJI).map(([emocion, emoji]) => (
            <View key={emocion} style={[styles.escalaItem, { backgroundColor: EMOCIONES_COLOR[emocion] + '20' }]}>
              <Text style={styles.escalaEmoji}>{emoji}</Text>
              <Text style={[styles.escalaTexto, { color: colores.textoSecundario }]}>{emocion}</Text>
              <Text style={[styles.escalaValor, { color: EMOCIONES_COLOR[emocion] }]}>{EMOCIONES_VALOR[emocion]}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Resumen de la semana */}
      <View style={[styles.resumen, { backgroundColor: colores.fondoTarjeta }]}>
        <Text style={[styles.resumenTitulo, { color: colores.texto }]}>Resumen de la semana</Text>
        {(() => {
          const conData = datos.filter((d) => d.emocion);
          if (conData.length === 0) return null;
          const promedio = conData.reduce((sum, d) => sum + d.valor, 0) / conData.length;
          const mejor = conData.reduce((max, d) => d.valor > max.valor ? d : max, conData[0]);
          const emocionMasFrecuente = conData.reduce((acc: any, d) => {
            acc[d.emocion] = (acc[d.emocion] || 0) + 1;
            return acc;
          }, {});
          const frecuente = Object.entries(emocionMasFrecuente).sort((a: any, b: any) => b[1] - a[1])[0][0];
          return (
            <View style={styles.resumenGrid}>
              <View style={[styles.resumenItem, { backgroundColor: colores.fondo }]}>
                <Text style={styles.resumenEmoji}>📈</Text>
                <Text style={[styles.resumenLabel, { color: colores.textoSecundario }]}>Promedio</Text>
                <Text style={[styles.resumenValor, { color: colores.acento }]}>{promedio.toFixed(1)}/5</Text>
              </View>
              <View style={[styles.resumenItem, { backgroundColor: colores.fondo }]}>
                <Text style={styles.resumenEmoji}>{EMOCIONES_EMOJI[mejor.emocion] || '😊'}</Text>
                <Text style={[styles.resumenLabel, { color: colores.textoSecundario }]}>Mejor día</Text>
                <Text style={[styles.resumenValor, { color: colores.acento }]}>{mejor.dia}</Text>
              </View>
              <View style={[styles.resumenItem, { backgroundColor: colores.fondo }]}>
                <Text style={styles.resumenEmoji}>{EMOCIONES_EMOJI[frecuente] || '😊'}</Text>
                <Text style={[styles.resumenLabel, { color: colores.textoSecundario }]}>Más frecuente</Text>
                <Text style={[styles.resumenValor, { color: colores.acento }]}>{frecuente}</Text>
              </View>
            </View>
          );
        })()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  vacio: { borderRadius: 16, padding: 24, alignItems: 'center', gap: 8 },
  vacioEmoji: { fontSize: 36 },
  vacioTexto: { fontSize: 13, textAlign: 'center' },
  graficaContainer: { borderRadius: 16, padding: 16, marginBottom: 12 },
  graficaTitulo: { fontSize: 14, fontWeight: 'bold' },
  leyenda: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingHorizontal: 4 },
  leyendaItem: { alignItems: 'center' },
  leyendaEmoji: { fontSize: 16 },
  escala: { borderRadius: 16, padding: 16, marginBottom: 12 },
  escalaTitulo: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  escalaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  escalaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  escalaEmoji: { fontSize: 14 },
  escalaTexto: { fontSize: 12 },
  escalaValor: { fontSize: 12, fontWeight: 'bold' },
  resumen: { borderRadius: 16, padding: 16, marginBottom: 12 },
  resumenTitulo: { fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
  resumenGrid: { flexDirection: 'row', gap: 10 },
  resumenItem: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 4 },
  resumenEmoji: { fontSize: 24 },
  resumenLabel: { fontSize: 10, textAlign: 'center' },
  resumenValor: { fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
});