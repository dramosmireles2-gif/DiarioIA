import { useTema } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Modal, ScrollView, SectionList, StyleSheet, Text,
    TextInput, TouchableOpacity, View
} from 'react-native';

type Entrada = {
  id: string;
  texto: string;
  fecha: string;
  destacada: boolean;
  emocion?: string | null;
};

type Seccion = {
  titulo: string;
  mes: string;
  data: Entrada[];
};

const emocionEmoji: { [key: string]: string } = {
  'Genial': '😄', 'Bien': '🙂', 'Neutral': '😐',
  'Triste': '😢', 'Enojado': '😠', 'Cansado': '😴',
};

export default function MisEntradas() {
  const { colores } = useTema();
  const router = useRouter();
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroEmocion, setFiltroEmocion] = useState<string | null>(null);
  const [filtroDestacadas, setFiltroDestacadas] = useState(false);
  const [filtroOrden, setFiltroOrden] = useState<'recientes' | 'antiguas' | 'az'>('recientes');

  const cargarEntradas = async () => {
    const datos = await AsyncStorage.getItem('entradas');
    if (datos) setEntradas(JSON.parse(datos));
  };

  useFocusEffect(useCallback(() => { cargarEntradas(); }, []));

  const toggleDestacada = async (id: string) => {
    const nuevas = entradas.map((e) => e.id === id ? { ...e, destacada: !e.destacada } : e);
    const ordenadas = [...nuevas.filter((e) => e.destacada), ...nuevas.filter((e) => !e.destacada)];
    await AsyncStorage.setItem('entradas', JSON.stringify(ordenadas));
    setEntradas(ordenadas);
  };

  const formatearMes = (fechaISO: string) => {
    return new Date(fechaISO).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  };

  const formatearFechaCorta = (fechaISO: string) => {
    return new Date(fechaISO).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const primerLinea = (texto: string) => {
    const lineas = texto.split('\n').filter(Boolean);
    return lineas[0] || texto.substring(0, 50);
  };

  const resto = (texto: string) => {
    const lineas = texto.split('\n').filter(Boolean);
    if (lineas.length > 1) return lineas.slice(1).join(' ');
    return texto.length > 50 ? texto.substring(50) : '';
  };
    const entradasFiltradas = entradas
    .filter((e) =>
        e.texto.toLowerCase().includes(busqueda.toLowerCase()) ||
        (e.emocion && e.emocion.toLowerCase().includes(busqueda.toLowerCase()))
    )
    .filter((e) => !filtroEmocion || e.emocion === filtroEmocion)
    .filter((e) => !filtroDestacadas || e.destacada)
    .sort((a, b) => {
        if (filtroOrden === 'recientes') return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        if (filtroOrden === 'antiguas') return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
        return a.texto.localeCompare(b.texto);
    });

  const agruparPorMes = (lista: Entrada[]): Seccion[] => {
    const grupos: { [key: string]: Entrada[] } = {};
    lista.forEach((e) => {
      const mes = formatearMes(e.fecha);
      if (!grupos[mes]) grupos[mes] = [];
      grupos[mes].push(e);
    });
    return Object.entries(grupos).map(([titulo, data]) => ({ titulo, mes: titulo, data }));
  };

  const secciones = agruparPorMes(entradasFiltradas);

  // Stats
  const totalEntradas = entradas.length;
  const racha = 1;
  const diasEsteMes = entradas.filter((e) => {
    const mes = new Date(e.fecha).getMonth();
    return mes === new Date().getMonth();
  }).length;
  const emocionMasFrecuente = entradas.length > 0
    ? entradas.reduce((acc: { [key: string]: number }, e) => {
        if (e.emocion) acc[e.emocion] = (acc[e.emocion] || 0) + 1;
        return acc;
      }, {})
    : {};
  const estadoEmocional = Object.keys(emocionMasFrecuente).length > 0
    ? Object.entries(emocionMasFrecuente).sort((a, b) => b[1] - a[1])[0][0]
    : 'Sin datos';

  return (
    <View style={[styles.container, { backgroundColor: colores.fondo }]}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.titulo, { color: colores.texto }]}>Mis Entradas 📚</Text>
          <Text style={[styles.subtitulo, { color: colores.textoSecundario }]}>Tu historia, día a día 💜</Text>
        </View>
        <View style={styles.headerBotones}>
            <TouchableOpacity 
            style={[styles.headerBtn, { backgroundColor: filtroEmocion || filtroDestacadas ? colores.acento : colores.fondoTarjeta }]}
            onPress={() => setMostrarFiltros(true)}
            >
            <Ionicons name="options-outline" size={20} color={filtroEmocion || filtroDestacadas ? '#fff' : colores.texto} />
            </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerBtnPrimary, { backgroundColor: colores.acento }]}
            onPress={() => router.push('/(tabs)/nueva_entrada')}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Buscador */}
      <View style={[styles.buscador, { backgroundColor: colores.fondoTarjeta }]}>
        <Ionicons name="search-outline" size={18} color={colores.textoSecundario} />
        <TextInput
          style={[styles.buscadorInput, { color: colores.texto }]}
          placeholder="Buscar entradas, emociones, etiquetas..."
          placeholderTextColor={colores.textoSecundario}
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda !== '' && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <Ionicons name="close-circle" size={18} color={colores.textoSecundario} />
          </TouchableOpacity>
        )}
      </View>

      {/* Mini stats */}
      <View style={[styles.statsCard, { backgroundColor: colores.fondoTarjeta }]}>
        <View style={styles.statItem}>
          <Ionicons name="book-outline" size={22} color={colores.acento} />
          <Text style={[styles.statValor, { color: colores.texto }]}>{totalEntradas}</Text>
          <Text style={[styles.statLabel, { color: colores.textoSecundario }]}>Entradas</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colores.fondo }]} />
        <View style={styles.statItem}>
          <Ionicons name="flame-outline" size={22} color="#ff6b6b" />
          <Text style={[styles.statValor, { color: colores.texto }]}>{racha}</Text>
          <Text style={[styles.statLabel, { color: colores.textoSecundario }]}>Días seguidos</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colores.fondo }]} />
        <View style={styles.statItem}>
          <Ionicons name="calendar-outline" size={22} color="#4ecdc4" />
          <Text style={[styles.statValor, { color: colores.texto }]}>{diasEsteMes}</Text>
          <Text style={[styles.statLabel, { color: colores.textoSecundario }]}>Días este mes</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colores.fondo }]} />
        <View style={styles.statItem}>
          <Ionicons name="happy-outline" size={22} color="#f5c518" />
          <Text style={[styles.statValorSmall, { color: colores.texto }]}>{estadoEmocional}</Text>
          <Text style={[styles.statLabel, { color: colores.textoSecundario }]}>Estado emocional</Text>
        </View>
      </View>

      {entradas.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={[styles.vacioEmoji]}>📖</Text>
          <Text style={[styles.vacioTexto, { color: colores.texto }]}>Aún no tienes entradas</Text>
          <Text style={[styles.vacioHint, { color: colores.textoSecundario }]}>Escribe tu primera entrada</Text>
          <TouchableOpacity
            style={[styles.vacioBtn, { backgroundColor: colores.acento }]}
            onPress={() => router.push('/(tabs)/nueva_entrada')}
          >
            <Ionicons name="pencil-outline" size={18} color="#fff" />
            <Text style={styles.vacioBtnTexto}>Escribir</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={secciones}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section }) => (
            <View style={styles.mesHeader}>
              <Text style={[styles.mesTitulo, { color: colores.acento }]}>
                {section.titulo.charAt(0).toUpperCase() + section.titulo.slice(1)}
              </Text>
              <View style={[styles.mesCount, { backgroundColor: colores.acento + '20' }]}>
                <Text style={[styles.mesCountTexto, { color: colores.acento }]}>
                  {section.data.length} {section.data.length === 1 ? 'entrada' : 'entradas'}
                </Text>
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tarjeta, { backgroundColor: colores.fondoTarjeta }, item.destacada && { borderColor: '#f5c518', borderWidth: 1.5 }]}
              onPress={() => router.push({ pathname: '/(tabs)/entrada-detalle', params: { id: item.id } })}
            >
              {/* Barra lateral de color */}
              <View style={[styles.tarjetaBarra, { backgroundColor: colores.acento }]} />

              <View style={styles.tarjetaContenido}>
                {/* Fecha y emoción */}
                <View style={styles.tarjetaHeader}>
                  <Text style={[styles.tarjetaFecha, { color: colores.acento }]}>
                    {formatearFechaCorta(item.fecha)}
                  </Text>
                  <View style={styles.tarjetaHeaderRight}>
                    {item.emocion && (
                      <View style={[styles.emocionBadge, { backgroundColor: colores.fondo }]}>
                        <Text style={styles.emocionEmoji}>{emocionEmoji[item.emocion] || '😊'}</Text>
                        <Text style={[styles.emocionTexto, { color: colores.textoSecundario }]}>{item.emocion}</Text>
                      </View>
                    )}
                    <TouchableOpacity onPress={() => toggleDestacada(item.id)}>
                      <Ionicons name={item.destacada ? 'star' : 'star-outline'} size={18} color={item.destacada ? '#f5c518' : colores.textoSecundario} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Título y preview */}
                <Text style={[styles.tarjetaTitulo, { color: colores.texto }]} numberOfLines={1}>
                  {primerLinea(item.texto)}
                </Text>
                {resto(item.texto) !== '' && (
                  <Text style={[styles.tarjetaPreview, { color: colores.textoSecundario }]} numberOfLines={2}>
                    {resto(item.texto)}
                  </Text>
                )}

                {/* Footer */}
                <View style={styles.tarjetaFooter}>
                  <View style={styles.tarjetaStat}>
                    <Ionicons name="document-text-outline" size={12} color={colores.textoSecundario} />
                    <Text style={[styles.tarjetaStatTexto, { color: colores.textoSecundario }]}>
                      {item.texto.split(' ').filter(Boolean).length} palabras
                    </Text>
                  </View>
                  <View style={styles.tarjetaStat}>
                    <Ionicons name="time-outline" size={12} color={colores.textoSecundario} />
                    <Text style={[styles.tarjetaStatTexto, { color: colores.textoSecundario }]}>
                      {Math.ceil(item.texto.split(' ').filter(Boolean).length / 200) || 1} min lectura
                    </Text>
                  </View>
                  <View style={[styles.etiqueta, { backgroundColor: colores.acento + '20' }]}>
                    <Text style={[styles.etiquetaTexto, { color: colores.acento }]}>Trabajo</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colores.textoSecundario} />
                </View>
              </View>
            </TouchableOpacity>
          )}
          renderSectionFooter={({ section }) => (
            <View style={[styles.bannerAsistente, { backgroundColor: colores.acento + '10', borderColor: colores.acento + '20' }]}>
              <View style={[styles.bannerIcono, { backgroundColor: colores.acento + '20' }]}>
                <Ionicons name="sparkles" size={20} color={colores.acento} />
              </View>
              <View style={styles.bannerTexto}>
                <Text style={[styles.bannerTitulo, { color: colores.acento }]}>Tu asistente de diario</Text>
                <Text style={[styles.bannerSub, { color: colores.textoSecundario }]}>¿Quieres ver un resumen de tus emociones este mes?</Text>
              </View>
              <TouchableOpacity style={[styles.bannerBtn, { backgroundColor: colores.fondoTarjeta }]}>
                <Text style={[styles.bannerBtnTexto, { color: colores.acento }]}>Ver resumen</Text>
                <Ionicons name="chevron-forward" size={14} color={colores.acento} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      {/* Modal filtros */}
        <Modal visible={mostrarFiltros} animationType="slide" transparent>
        <View style={styles.modalFondo}>
            <View style={[styles.modalFiltros, { backgroundColor: colores.fondoTarjeta }]}>
            
            <View style={[styles.modalHandle, { backgroundColor: colores.textoSecundario }]} />
            
            <View style={styles.modalFiltrosHeader}>
                <Text style={[styles.modalFiltrosTitulo, { color: colores.texto }]}>Filtros</Text>
                <TouchableOpacity onPress={() => {
                setFiltroEmocion(null);
                setFiltroDestacadas(false);
                setFiltroOrden('recientes');
                }}>
                <Text style={[styles.limpiar, { color: colores.acento }]}>Limpiar</Text>
                </TouchableOpacity>
            </View>

            {/* Filtro por emoción */}
            <Text style={[styles.filtroLabel, { color: colores.textoSecundario }]}>Por emoción</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtroRow}>
                {['Genial', 'Bien', 'Neutral', 'Triste', 'Enojado', 'Cansado'].map((e) => (
                <TouchableOpacity
                    key={e}
                    style={[styles.filtroBadge, { backgroundColor: filtroEmocion === e ? colores.acento : colores.fondo }]}
                    onPress={() => setFiltroEmocion(filtroEmocion === e ? null : e)}
                >
                    <Text>{emocionEmoji[e]}</Text>
                    <Text style={[styles.filtroBadgeTexto, { color: filtroEmocion === e ? '#fff' : colores.texto }]}>{e}</Text>
                </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Filtro destacadas */}
            <Text style={[styles.filtroLabel, { color: colores.textoSecundario }]}>Tipo</Text>
            <TouchableOpacity
                style={[styles.filtroOpcion, { backgroundColor: filtroDestacadas ? colores.acento + '20' : colores.fondo, borderColor: filtroDestacadas ? colores.acento : 'transparent' }]}
                onPress={() => setFiltroDestacadas(!filtroDestacadas)}
            >
                <Ionicons name="star" size={18} color={filtroDestacadas ? '#f5c518' : colores.textoSecundario} />
                <Text style={[styles.filtroOpcionTexto, { color: filtroDestacadas ? colores.acento : colores.texto }]}>Solo destacadas</Text>
                {filtroDestacadas && <Ionicons name="checkmark-circle" size={18} color={colores.acento} />}
            </TouchableOpacity>

            {/* Ordenar */}
            <Text style={[styles.filtroLabel, { color: colores.textoSecundario }]}>Ordenar por</Text>
            {[
                { id: 'recientes', label: 'Más recientes primero', icon: 'time-outline' },
                { id: 'antiguas', label: 'Más antiguas primero', icon: 'calendar-outline' },
                { id: 'az', label: 'Alfabético A-Z', icon: 'text-outline' },
            ].map((o) => (
                <TouchableOpacity
                key={o.id}
                style={[styles.filtroOpcion, { backgroundColor: filtroOrden === o.id ? colores.acento + '20' : colores.fondo, borderColor: filtroOrden === o.id ? colores.acento : 'transparent' }]}
                onPress={() => setFiltroOrden(o.id as any)}
                >
                <Ionicons name={o.icon as any} size={18} color={filtroOrden === o.id ? colores.acento : colores.textoSecundario} />
                <Text style={[styles.filtroOpcionTexto, { color: filtroOrden === o.id ? colores.acento : colores.texto }]}>{o.label}</Text>
                {filtroOrden === o.id && <Ionicons name="checkmark-circle" size={18} color={colores.acento} />}
                </TouchableOpacity>
            ))}

            <TouchableOpacity
                style={[styles.filtroAplicar, { backgroundColor: colores.acento }]}
                onPress={() => setMostrarFiltros(false)}
            >
                <Text style={styles.filtroAplicarTexto}>Aplicar filtros</Text>
            </TouchableOpacity>

            </View>
        </View>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  titulo: { fontSize: 26, fontWeight: 'bold' },
  subtitulo: { fontSize: 13, marginTop: 2 },
  headerBotones: { flexDirection: 'row', gap: 8 },
  headerBtn: { padding: 10, borderRadius: 12 },
  headerBtnPrimary: { padding: 10, borderRadius: 14 },
  buscador: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, gap: 8, marginBottom: 12 },
  buscadorInput: { flex: 1, fontSize: 14 },
  statsCard: { flexDirection: 'row', borderRadius: 16, padding: 14, marginBottom: 16, alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, height: 40, marginHorizontal: 4 },
  statValor: { fontSize: 18, fontWeight: 'bold' },
  statValorSmall: { fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  statLabel: { fontSize: 10, textAlign: 'center' },
  mesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 8 },
  mesTitulo: { fontSize: 15, fontWeight: 'bold', textTransform: 'capitalize' },
  mesCount: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  mesCountTexto: { fontSize: 12, fontWeight: '600' },
  tarjeta: { borderRadius: 16, marginBottom: 12, flexDirection: 'row', overflow: 'hidden' },
  tarjetaBarra: { width: 4 },
  tarjetaContenido: { flex: 1, padding: 14 },
  tarjetaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  tarjetaHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tarjetaFecha: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  emocionBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  emocionEmoji: { fontSize: 14 },
  emocionTexto: { fontSize: 11 },
  tarjetaTitulo: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  tarjetaPreview: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  tarjetaFooter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tarjetaStat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  tarjetaStatTexto: { fontSize: 11 },
  etiqueta: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  etiquetaTexto: { fontSize: 11, fontWeight: '600' },
  vacio: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  vacioEmoji: { fontSize: 60 },
  vacioTexto: { fontSize: 20, fontWeight: 'bold' },
  vacioHint: { fontSize: 14 },
  vacioBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  vacioBtnTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  bannerAsistente: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1 },
  bannerIcono: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  bannerTexto: { flex: 1 },
  bannerTitulo: { fontSize: 13, fontWeight: 'bold' },
  bannerSub: { fontSize: 11, marginTop: 2 },
  bannerBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  bannerBtnTexto: { fontSize: 12, fontWeight: '600' },
  modalFondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalFiltros: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalFiltrosHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalFiltrosTitulo: { fontSize: 20, fontWeight: 'bold' },
  limpiar: { fontSize: 14, fontWeight: '600' },
  filtroLabel: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 8 },
  filtroRow: { marginBottom: 8 },
  filtroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  filtroBadgeTexto: { fontSize: 13, fontWeight: '600' },
  filtroOpcion: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1.5 },
  filtroOpcionTexto: { flex: 1, fontSize: 14 },
  filtroAplicar: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  filtroAplicarTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});