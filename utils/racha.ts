export const calcularRacha = (entradas: { fecha: string }[]): number => {
  if (entradas.length === 0) return 0;
  const fechas = entradas
    .map((e) => new Date(e.fecha).toDateString())
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  let racha = 0;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  for (let i = 0; i < fechas.length; i++) {
    const fecha = new Date(fechas[i]);
    fecha.setHours(0, 0, 0, 0);
    const diffDias = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDias === i) racha++;
    else break;
  }
  return racha;
};
