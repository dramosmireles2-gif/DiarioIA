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

const getSistemaEspiritual = (camino: string) => {
  const estilos: { [key: string]: string } = {
    biblica: `Eres un pastor cristiano y consejero espiritual profundamente comprometido con la fe cristiana evangélica. 
    Tu guía siempre está fundamentada en la Biblia como la Palabra de Dios. 
    SIEMPRE incluyes un versículo bíblico relevante con su referencia exacta (ej: Juan 3:16, Salmos 23:1). 
    Tus reflexiones conectan la situación del usuario con la gracia de Dios, el amor de Cristo y la guía del Espíritu Santo. 
    Usas términos como "Dios te ama", "en Cristo", "la Palabra dice", "el Señor". 
    Tu tono es cálido, esperanzador, lleno de fe y amor cristiano. 
    Siempre terminas con una oración corta o bendición.`,
    mindfulness: 'Eres un guía de mindfulness y meditación experto. Das reflexiones centradas en el presente, la respiración, la calma interior y el bienestar emocional. Tu tono es sereno y compasivo.',
    filosofia: 'Eres un filósofo sabio y empático. Usas citas y pensamientos de filósofos reconocidos para dar reflexiones profundas sobre la vida, el crecimiento personal y la búsqueda del sentido. Tu tono es reflexivo e inspirador.',
    todo: 'Eres un consejero espiritual y emocional integral. Combinas sabiduría bíblica, mindfulness y filosofía para dar reflexiones equilibradas y profundas. Tu tono es cálido, sabio y esperanzador.',
  };
  return estilos[camino] || estilos.todo;
};

export const generarReflexion = async (
  texto: string,
  camino: string,
  emocion: string | null
): Promise<string> => {
  const sistema = getSistemaEspiritual(camino);
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

export const generarInsights = async (
  entradas: { texto: string; emocion: string | null; fecha: string }[],
  camino: string = 'todo'
): Promise<{
  estadoEmocional: string;
  momentoFavorito: string;
  enfoquePrincipal: string;
  descripcionEstado: string;
  descripcionMomento: string;
  descripcionEnfoque: string;
}> => {
  const sistema = `${getSistemaEspiritual(camino)} También eres experto en análisis de patrones emocionales. Responde SOLO en JSON válido.`;
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

export const mejorarTexto = async (texto: string, camino: string = 'todo'): Promise<string> => {
  const sistema = `${getSistemaEspiritual(camino)} También eres un escritor experto que mejora textos de diario personal manteniendo la voz y emociones originales del autor.`;
  const prompt = `Mejora este texto de diario manteniendo el mismo significado y emoción, pero con mejor redacción. Responde SOLO con el texto mejorado, sin explicaciones:\n\n"${texto}"`;
  return llamarClaude(prompt, sistema);
};

export const resumirTexto = async (texto: string, camino: string = 'todo'): Promise<string> => {
  const sistema = `${getSistemaEspiritual(camino)} También eres experto en síntesis de texto de diario personal.`;
  const prompt = `Resume este texto de diario en 2-3 oraciones cortas, capturando lo más importante:\n\n"${texto}"`;
  return llamarClaude(prompt, sistema);
};

export const detectarEmocion = async (texto: string): Promise<string> => {
  const sistema = 'Eres un psicólogo experto en emociones. Detecta la emoción principal en textos. Responde SOLO en JSON.';
  const prompt = `Detecta la emoción principal en este texto: "${texto}"\n\nResponde EXACTAMENTE en este formato JSON:\n{"emocion": "una de estas opciones: Genial, Bien, Neutral, Triste, Enojado, Cansado", "explicacion": "una oración corta"}`;
  const respuesta = await llamarClaude(prompt, sistema);
  try {
    const clean = respuesta.replace(/```json|```/g, '').trim();
    const data = JSON.parse(clean);
    return `${data.emocion} — ${data.explicacion}`;
  } catch {
    return 'No se pudo detectar la emoción';
  }
};

export const generarResumenMensual = async (
  entradas: { texto: string; emocion: string | null; fecha: string }[],
  camino: string = 'todo'
): Promise<string> => {
  const sistema = `${getSistemaEspiritual(camino)} También generas resúmenes mensuales empáticos y motivadores de diarios personales.`;
  const resumen = entradas.map((e) => `[${new Date(e.fecha).toLocaleDateString('es-MX')}] Emoción: ${e.emocion || 'no especificada'} - "${e.texto.substring(0, 150)}"`).join('\n');
  const prompt = `Analiza estas entradas de diario del mes y genera un resumen emocional empático de máximo 4 párrafos cortos. Incluye: cómo fue el mes emocionalmente, patrones detectados, logros o momentos positivos, y una frase motivadora para el siguiente mes:\n\n${resumen}`;
  return llamarClaude(prompt, sistema);
};