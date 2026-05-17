const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
console.log('API KEY existe:', !!API_KEY);
const API_URL = 'https://api.anthropic.com/v1/messages';

const llamarClaude = async (prompt: string, sistema: string): Promise<string> => {
  try {
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

    if (!response.ok) {
      if (response.status === 401) throw new Error('API key inválida');
      if (response.status === 429) throw new Error('Demasiadas solicitudes. Espera un momento');
      if (response.status === 500) throw new Error('Error en el servidor de IA');
      throw new Error('Error al conectar con la IA');
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error: any) {
    if (error.message === 'Network request failed') {
      throw new Error('Sin conexión a internet. Verifica tu red e intenta de nuevo');
    }
    throw error;
  }
};
const llamarClaudeConImagen = async (prompt: string, sistema: string, imagenUri: string): Promise<string> => {
  try {
    const response = await fetch(imagenUri);
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const mimeType = imagenUri.includes('.png') ? 'image/png' : 'image/jpeg';

    const response2 = await fetch(API_URL, {
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
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: base64,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response2.ok) {
      if (response2.status === 401) throw new Error('API key inválida');
      if (response2.status === 429) throw new Error('Demasiadas solicitudes. Espera un momento');
      throw new Error('Error al conectar con la IA');
    }

    const data = await response2.json();
    return data.content[0].text;
  } catch (error: any) {
    if (error.message === 'Network request failed') {
      throw new Error('Sin conexión a internet. Verifica tu red e intenta de nuevo');
    }
    throw error;
  }
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
  const prompt = `Detecta la emoción principal en este texto: "${texto}"\n\nResponde EXACTAMENTE en este formato JSON:\n{"emocion": "una de estas opciones: Genial, Bien, Neutral, Ansioso, Triste, Enojado, Cansado", "explicacion": "una oración corta"}`;
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
export const calcularRachaReal = (entradas: { fecha: string }[]): number => {
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
    if (diffDias === i) {
      racha++;
    } else {
      break;
    }
  }
  return racha;
};
export const generarPreguntaGuiada = async (
  emocion: string | null,
  camino: string,
  respuestasAnteriores: string[]
): Promise<string> => {
  const sistema = `${getSistemaEspiritual(camino)} También eres un terapeuta experto en escritura reflexiva. Tu objetivo es hacer preguntas profundas y empáticas que ayuden al usuario a explorar sus emociones y pensamientos. Haz UNA sola pregunta corta y poderosa.`;
  
  const contexto = respuestasAnteriores.length > 0
    ? `El usuario ha respondido lo siguiente:\n${respuestasAnteriores.map((r, i) => `Respuesta ${i + 1}: "${r}"`).join('\n')}\n\nBasa tu siguiente pregunta en estas respuestas.`
    : `El usuario se siente: ${emocion || 'no especificado'}`;

  const prompt = `${contexto}\n\nHaz UNA pregunta reflexiva y empática para ayudar al usuario a explorar sus pensamientos y emociones más profundamente. La pregunta debe ser corta, directa y poderosa. Solo escribe la pregunta, sin explicaciones.`;
  
  return llamarClaude(prompt, sistema);
};

export const convertirRespuestasAEntrada = async (
  preguntas: string[],
  respuestas: string[],
  camino: string
): Promise<string> => {
  const sistema = `${getSistemaEspiritual(camino)} También eres un escritor experto que transforma conversaciones en entradas de diario hermosas y coherentes.`;
  
  const dialogo = preguntas.map((p, i) => `Pregunta: ${p}\nRespuesta: ${respuestas[i] || ''}`).join('\n\n');
  
  const prompt = `Transforma esta conversación en una entrada de diario personal hermosa, en primera persona, que fluya naturalmente. Mantén las emociones y pensamientos originales del usuario:\n\n${dialogo}\n\nEscribe solo la entrada de diario, sin títulos ni explicaciones.`;
  
  return llamarClaude(prompt, sistema);
};
export const analizarImagen = async (imagenUri: string, texto: string, camino: string): Promise<string> => {
  const sistema = getSistemaEspiritual(camino);
  const prompt = `El usuario compartió esta imagen en su diario personal${texto ? ` junto con este texto: "${texto}"` : ''}.

Analiza la imagen y da una reflexión personalizada y empática que incluya:
1. Lo que observas en la imagen
2. Las emociones o sentimientos que transmite
3. Una reflexión profunda conectada con el camino espiritual

Sé cálido, observador y profundo.`;
  return llamarClaudeConImagen(prompt, sistema, imagenUri);
};