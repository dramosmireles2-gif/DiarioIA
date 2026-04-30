import { useTema } from '@/contexts/ThemeContext';
import { Logro, calcularLogros } from '@/utils/logros';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Logros() {
  const { colores } = useTema();
  const [logros, setLogros] = useState<Logro[]>([]);
  const [modalLogro, setModalLogro] = useState<Logro | null>(null);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const resultado = await calcularLogros();
    setLogros(resultado);
  };

  const desbloqueados = logros.filter((l) => l.desbloqueado);
  const bloqueados = logros.filter((l) => !l.desbloqueado);

  return (
    <View>
      {/* Resumen */}
      <View style={[styles.resumen, { backgroundColor: colores.acento + '15' }]}>
        <Text style={styles.resumenEmoji}>🏆</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.resumenTitulo, { color: colores.texto }]}>
            {desbloqueados.length} de {logros.length} logros
          </Text>
          <View style={[styles.barra, { backgroundColor: colores.fondo }]}>
            <View style={[styles.barraRelleno, { backgroundColor: colores.acento, width: `${(desbloqueados.length / logros.length) * 100}%` }]} />
          </View>
        </View>
      </View>

      {/* Logros desbloqueados */}
      {desbloqueados.length > 0 && (
        <>
          <Text style={[styles.seccionLabel, { color: colores.textoSecundario }]}>✅ Desbloqueados</Text>
          <View style={styles.grid}>
            {desbloqueados.map((logro) => (
              <TouchableOpacity
                key={logro.id}
                style={[styles.logroCard, { backgroundColor: logro.color + '20', borderColor: logro.color + '40' }]}
                onPress={() => setModalLogro(logro)}
              >
                <Text style={styles.logroEmoji}>{logro.emoji}</Text>
                <Text style={[styles.logroTitulo, { color: colores.texto }]} numberOfLines={1}>{logro.titulo}</Text>
                <Text style={[styles.logroDesc, { color: colores.textoSecundario }]} numberOfLines={2}>{logro.descripcion}</Text>
                {logro.fecha && (
                  <Text style={[styles.logroFecha, { color: logro.color }]}>{logro.fecha}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Logros bloqueados */}
      {bloqueados.length > 0 && (
        <>
          <Text style={[styles.seccionLabel, { color: colores.textoSecundario }]}>🔒 Por desbloquear</Text>
          <View style={styles.grid}>
            {bloqueados.map((logro) => (
              <TouchableOpacity
                key={logro.id}
                style={[styles.logroCard, { backgroundColor: colores.fondoTarjeta, borderColor: colores.fondo }]}
                onPress={() => setModalLogro(logro)}
              >
                <Text style={[styles.logroEmoji, { opacity: 0.3 }]}>{logro.emoji}</Text>
                <Text style={[styles.logroTitulo, { color: colores.textoSecundario }]} numberOfLines={1}>{logro.titulo}</Text>
                <Text style={[styles.logroDesc, { color: colores.textoSecundario }]} numberOfLines={2}>{logro.descripcion}</Text>
                <View style={[styles.bloqueadoBadge, { backgroundColor: colores.fondo }]}>
                  <Ionicons name="lock-closed" size={10} color={colores.textoSecundario} />
                  <Text style={[styles.bloqueadoTexto, { color: colores.textoSecundario }]}>Bloqueado</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Modal logro */}
      <Modal visible={!!modalLogro} animationType="fade" transparent>
        <View style={styles.modalFondo}>
          <View style={[styles.modalCard, { backgroundColor: colores.fondoTarjeta }]}>
            {modalLogro && (
              <>
                <View style={[styles.modalIcono, { backgroundColor: modalLogro.desbloqueado ? modalLogro.color + '20' : colores.fondo }]}>
                  <Text style={[styles.modalEmoji, { opacity: modalLogro.desbloqueado ? 1 : 0.3 }]}>{modalLogro.emoji}</Text>
                  {!modalLogro.desbloqueado && (
                    <View style={styles.modalCandado}>
                      <Ionicons name="lock-closed" size={16} color={colores.textoSecundario} />
                    </View>
                  )}
                </View>
                <Text style={[styles.modalTitulo, { color: colores.texto }]}>{modalLogro.titulo}</Text>
                <Text style={[styles.modalDesc, { color: colores.textoSecundario }]}>{modalLogro.descripcion}</Text>
                {modalLogro.desbloqueado && modalLogro.fecha && (
                  <View style={[styles.modalFechaCard, { backgroundColor: modalLogro.color + '15' }]}>
                    <Ionicons name="checkmark-circle" size={16} color={modalLogro.color} />
                    <Text style={[styles.modalFechaTexto, { color: modalLogro.color }]}>
                      Desbloqueado el {modalLogro.fecha}
                    </Text>
                  </View>
                )}
                {!modalLogro.desbloqueado && (
                  <View style={[styles.modalFechaCard, { backgroundColor: colores.fondo }]}>
                    <Ionicons name="lock-closed" size={16} color={colores.textoSecundario} />
                    <Text style={[styles.modalFechaTexto, { color: colores.textoSecundario }]}>
                      Sigue usando la app para desbloquear este logro
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: modalLogro.desbloqueado ? modalLogro.color : colores.acento }]}
                  onPress={() => setModalLogro(null)}
                >
                  <Text style={styles.modalBtnTexto}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  resumen: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 14, marginBottom: 16 },
  resumenEmoji: { fontSize: 32 },
  resumenTitulo: { fontSize: 14, fontWeight: 'bold', marginBottom: 6 },
  barra: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barraRelleno: { height: 6, borderRadius: 3 },
  seccionLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  logroCard: { width: '47%', borderRadius: 16, padding: 12, borderWidth: 1.5, gap: 4 },
  logroEmoji: { fontSize: 28 },
  logroTitulo: { fontSize: 13, fontWeight: 'bold' },
  logroDesc: { fontSize: 11, lineHeight: 15 },
  logroFecha: { fontSize: 10, fontWeight: '600', marginTop: 2 },
  bloqueadoBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start', marginTop: 2 },
  bloqueadoTexto: { fontSize: 9, fontWeight: '600' },
  modalFondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { borderRadius: 24, padding: 24, alignItems: 'center', gap: 12, width: '100%' },
  modalIcono: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  modalEmoji: { fontSize: 40 },
  modalCandado: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', borderRadius: 10, padding: 2 },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  modalDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  modalFechaCard: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, padding: 10, width: '100%' },
  modalFechaTexto: { fontSize: 13, flex: 1 },
  modalBtn: { borderRadius: 14, paddingHorizontal: 32, paddingVertical: 12, marginTop: 4 },
  modalBtnTexto: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});