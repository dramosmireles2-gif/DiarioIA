const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
const API_URL = 'https://api.anthropic.com/v1/messages';

const llamarClaude = async (prompt: string, sistema: string): Promise<string> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: sistema,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  return data.content[0].text;
};

export const generarReflexion = async (
  texto: string,
  camino: string,
  emocion: string | null
): Promise<string> => {
  const estilos: { [key: string]: string } = {
    biblica: 'Eres un consejero espiritual cristiano que usa versículos bíblicos para dar reflexiones profundas y reconfortantes. Siempre incluye un versículo relevante.',
    mindfulness: 'Eres un guía de mindfulness y meditación que da reflexiones calmantes y centradas en el presente.',
    filosofia: 'Eres un filósofo que usa citas y pensamientos filosóficos para dar reflexiones profundas sobre la vida.',
    todo: 'Eres un consejero espiritual y emocional que combina sabiduría bíblica, mindfulness y filosofía para dar reflexiones equilibradas.',
  };

  const sistema = estilos[camino] || estilos.todo;
  const prompt = `El usuario escribió en su diario: "${texto}"\n\nSu estado emocional es: ${emocion || 'no especificado'}\n\nDa una reflexión personalizada, empática y profunda en español. Máximo 3 párrafos cortos. Sé cálido y esperanzador.`;

  return llamarClaude(prompt, sistema);
};

export const analizarEmocion = async (texto: string): Promise<{
  nivelEstres: number;
  emocionPrincipal: string;
  resumen: string;
}> => {
  const sistema = 'Eres un psicólogo experto en análisis emocional. Analiza el texto y responde SOLO en JSON válido sin explicaciones.';
  const prompt = `Analiza este texto de diario: "${texto}"\n\nResponde EXACTAMENTE en este formato JSON:\n{"nivelEstres": número del 0 al 100, "emocionPrincipal": "una palabra", "resumen": "una oración corta describiendo el estado emocional"}`;

  const respuesta = await llamarClaude(prompt, sistema);
  try {
    const clean = respuesta.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return { nivelEstres: 50, emocionPrincipal: 'neutral', resumen: 'Estado emocional en proceso de análisis' };
  }
};

export const generarEtiquetas = async (texto: string): Promise<string[]> => {
  const sistema = 'Eres un experto en categorización de emociones y temas. Responde SOLO en JSON válido.';
  const prompt = `Analiza este texto de diario: "${texto}"\n\nResponde EXACTAMENTE en este formato JSON con máximo 3 etiquetas relevantes:\n{"etiquetas": ["etiqueta1", "etiqueta2", "etiqueta3"]}`;

  const respuesta = await llamarClaude(prompt, sistema);
  try {
    const clean = respuesta.replace(/```json|```/g, '').trim();
    const data = JSON.parse(clean);
    return data.etiquetas || [];
  } catch {
    return ['Personal'];
  }
};

export const generarInsights = async (entradas: { texto: string; emocion: string | null; fecha: string }[]): Promise<{
  estadoEmocional: string;
  momentoFavorito: string;
  enfoquePrincipal: string;
  descripcionEstado: string;
  descripcionMomento: string;
  descripcionEnfoque: string;
}> => {
  const sistema = 'Eres un psicólogo experto en bienestar emocional. Analiza patrones en entradas de diario. Responde SOLO en JSON válido.';
  const resumen = entradas.slice(0, 10).map((e) => `[${e.fecha}] Emoción: ${e.emocion || 'no especificada'} - "${e.texto.substring(0, 100)}"`).join('\n');
  const prompt = `Analiza estas entradas de diario:\n${resumen}\n\nResponde EXACTAMENTE en este formato JSON:\n{"estadoEmocional": "descripción breve", "momentoFavorito": "momento del día", "enfoquePrincipal": "tema principal", "descripcionEstado": "una oración", "descripcionMomento": "una oración", "descripcionEnfoque": "una oración"}`;

  const respuesta = await llamarClaude(prompt, sistema);
  try {
    const clean = respuesta.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return {
      estadoEmocional: 'En análisis',
      momentoFavorito: 'Por determinar',
      enfoquePrincipal: 'Crecimiento personal',
      descripcionEstado: 'Analizando tus emociones',
      descripcionMomento: 'Detectando tus patrones',
      descripcionEnfoque: 'Identificando tus temas',
    };
  }
};