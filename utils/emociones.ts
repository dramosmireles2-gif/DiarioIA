export const emociones = [
  { emoji: '😄', label: 'Genial',   color: '#f5c518' },
  { emoji: '🙂', label: 'Bien',     color: '#56cba8' },
  { emoji: '😐', label: 'Neutral',  color: '#9b9b9b' },
  { emoji: '😰', label: 'Ansioso',  color: '#ff9f43' },
  { emoji: '😢', label: 'Triste',   color: '#74b9ff' },
  { emoji: '😠', label: 'Enojado',  color: '#ff6b6b' },
  { emoji: '😴', label: 'Cansado',  color: '#a29bfe' },
];

export const emocionEmoji: { [key: string]: string } = Object.fromEntries(
  emociones.map((e) => [e.label, e.emoji])
);

export const emocionColor: { [key: string]: string } = Object.fromEntries(
  emociones.map((e) => [e.label, e.color])
);
