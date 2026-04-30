import AsyncStorage from '@react-native-async-storage/async-storage';

export type Logro = {
  id: string;
  emoji: string;
  titulo: string;
  descripcion: string;
  color: string;
  desbloqueado: boolean;
  fecha?: string;
};

export const LOGROS: Logro[] = [
  { id: 'primera_entrada', emoji: '✍️', titulo: 'Primera palabra', descripcion: 'Escribiste tu primera entrada', color: '#7c6af7', desbloqueado: false },
  { id: 'tres_entradas', emoji: '📖', titulo: 'Escritor en ciernes', descripcion: 'Escribiste 3 entradas', color: '#4ecdc4', desbloqueado: false },
  { id: 'diez_entradas', emoji: '📚', titulo: 'Diario activo', descripcion: 'Escribiste 10 entradas', color: '#f5c518', desbloqueado: false },
  { id: 'treinta_entradas', emoji: '🏆', titulo: 'Maestro del diario', descripcion: 'Escribiste 30 entradas', color: '#ff6b6b', desbloqueado: false },
  { id: 'racha_3', emoji: '🔥', titulo: 'En racha', descripcion: '3 días seguidos escribiendo', color: '#ff6b6b', desbloqueado: false },
  { id: 'racha_7', emoji: '⚡', titulo: 'Semana completa', descripcion: '7 días seguidos escribiendo', color: '#f5c518', desbloqueado: false },
  { id: 'racha_30', emoji: '🌟', titulo: 'Imparable', descripcion: '30 días seguidos escribiendo', color: '#7c6af7', desbloqueado: false },
  { id: 'primera_foto', emoji: '📸', titulo: 'Memoria visual', descripcion: 'Adjuntaste tu primera foto', color: '#4ecdc4', desbloqueado: false },
  { id: 'primer_audio', emoji: '🎙️', titulo: 'Voz del corazón', descripcion: 'Grabaste tu primera nota de voz', color: '#a29bfe', desbloqueado: false },
  { id: 'primera_reflexion', emoji: '🧠', titulo: 'Reflexión profunda', descripcion: 'Generaste tu primera reflexión con IA', color: '#7c6af7', desbloqueado: false },
  { id: 'modo_guiado', emoji: '🧭', titulo: 'Explorador guiado', descripcion: 'Usaste el modo guiado por primera vez', color: '#4ecdc4', desbloqueado: false },
  { id: 'cinco_emociones', emoji: '🎭', titulo: 'Paleta emocional', descripcion: 'Registraste 5 emociones diferentes', color: '#ff6b6b', desbloqueado: false },
  { id: 'primera_destacada', emoji: '⭐', titulo: 'Momento especial', descripcion: 'Destacaste tu primera entrada', color: '#f5c518', desbloqueado: false },
  { id: 'cumpleanos', emoji: '🎂', titulo: 'Feliz cumpleaños', descripcion: 'Escribiste en tu cumpleaños', color: '#ff6b6b', desbloqueado: false },
];

export const calcularLogros = async (): Promise<Logro[]> => {
  const entradasDatos = await AsyncStorage.getItem('entradas');
  const logrosDatos = await AsyncStorage.getItem('logros');

  const entradas = entradasDatos ? JSON.parse(entradasDatos) : [];
  const logrosGuardados = logrosDatos ? JSON.parse(logrosDatos) : {};

  const totalEntradas = entradas.length;

  const fechas = entradas
    .map((e: any) => new Date(e.fecha).toDateString())
    .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
    .sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());

  let racha = 0;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  for (let i = 0; i < fechas.length; i++) {
    const fecha = new Date(fechas[i]);
    fecha.setHours(0, 0, 0, 0);
    const diff = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === i) racha++;
    else break;
  }

  const tieneFoto = entradas.some((e: any) => e.imagenes && e.imagenes.length > 0);
  const tieneAudio = entradas.some((e: any) => e.audioUri);
  const tieneReflexion = entradas.some((e: any) => e.reflexion);
  const tieneDestacada = entradas.some((e: any) => e.destacada);
  const emociones = new Set(entradas.map((e: any) => e.emocion).filter(Boolean));
  const hoyStr = new Date().toDateString();
  const escribioHoy = fechas.includes(hoyStr);

  const perfilDatos = await AsyncStorage.getItem('perfil');
  const perfil = perfilDatos ? JSON.parse(perfilDatos) : null;
  const esCumpleanos = (() => {
    if (!perfil?.cumpleanos) return false;
    const partes = perfil.cumpleanos.split('/');
    if (partes.length !== 3) return false;
    const hoyD = new Date();
    return hoyD.getDate() === parseInt(partes[0]) && hoyD.getMonth() === parseInt(partes[1]) - 1;
  })();

  const condiciones: Record<string, boolean> = {
    primera_entrada: totalEntradas >= 1,
    tres_entradas: totalEntradas >= 3,
    diez_entradas: totalEntradas >= 10,
    treinta_entradas: totalEntradas >= 30,
    racha_3: racha >= 3,
    racha_7: racha >= 7,
    racha_30: racha >= 30,
    primera_foto: tieneFoto,
    primer_audio: tieneAudio,
    primera_reflexion: tieneReflexion,
    modo_guiado: logrosGuardados['modo_guiado']?.desbloqueado || false,
    cinco_emociones: emociones.size >= 5,
    primera_destacada: tieneDestacada,
    cumpleanos: esCumpleanos && escribioHoy,
  };

  const logrosActualizados = LOGROS.map((logro) => {
    const desbloqueado = condiciones[logro.id] || false;
    const yaEstaba = logrosGuardados[logro.id]?.desbloqueado || false;
    return {
      ...logro,
      desbloqueado,
      fecha: desbloqueado ? (yaEstaba ? logrosGuardados[logro.id]?.fecha : new Date().toLocaleDateString('es-MX')) : undefined,
    };
  });

  const logrosObj: any = {};
  logrosActualizados.forEach((l) => { logrosObj[l.id] = { desbloqueado: l.desbloqueado, fecha: l.fecha }; });
  await AsyncStorage.setItem('logros', JSON.stringify(logrosObj));

  return logrosActualizados;
};

export const desbloquearLogro = async (id: string) => {
  const logrosDatos = await AsyncStorage.getItem('logros');
  const logros = logrosDatos ? JSON.parse(logrosDatos) : {};
  logros[id] = { desbloqueado: true, fecha: new Date().toLocaleDateString('es-MX') };
  await AsyncStorage.setItem('logros', JSON.stringify(logros));
};