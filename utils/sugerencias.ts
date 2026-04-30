type Camino = 'biblica' | 'mindfulness' | 'filosofia' | 'todo';

type Sugerencia = {
  emoji: string;
  titulo: string;
  descripcion: string;
  accion: string;
  color: string;
};

const getPeriodoDia = (): 'mañana' | 'tarde' | 'noche' => {
  const hora = new Date().getHours();
  if (hora >= 5 && hora < 12) return 'mañana';
  if (hora >= 12 && hora < 19) return 'tarde';
  return 'noche';
};

const sugerencias: Record<string, Record<string, Record<Camino, Sugerencia>>> = {
  Triste: {
    mañana: {
      biblica: { emoji: '🙏', titulo: 'Desahoga tu corazón', descripcion: 'Esta mañana, cuéntale a Dios lo que sientes. Él escucha cada lágrima tuya.', accion: 'Escribir a Dios', color: '#74b9ff' },
      mindfulness: { emoji: '🌊', titulo: 'Suelta con calma', descripcion: 'Respira profundo. Esta mañana, escribe lo que pesa en tu corazón y suéltalo.', accion: 'Soltar y respirar', color: '#74b9ff' },
      filosofia: { emoji: '🌧️', titulo: 'La tristeza es maestra', descripcion: 'Como dijo Rumi: "La herida es el lugar por donde entra la luz." ¿Qué te enseña esto?', accion: 'Reflexionar', color: '#74b9ff' },
      todo: { emoji: '💙', titulo: 'Empieza con honestidad', descripcion: 'Esta mañana puedes ser honesto contigo mismo. ¿Qué te entristece realmente?', accion: 'Escribir ahora', color: '#74b9ff' },
    },
    tarde: {
      biblica: { emoji: '🕊️', titulo: 'Paz en la tormenta', descripcion: '"Él sana a los quebrantados de corazón." (Sal 147:3) Escribe cómo te sientes hoy.', accion: 'Escribir con fe', color: '#74b9ff' },
      mindfulness: { emoji: '🧘', titulo: 'Observa sin juzgar', descripcion: 'Tu tristeza es válida. Obsérvala sin resistirla. ¿Dónde la sientes en tu cuerpo?', accion: 'Explorar adentro', color: '#74b9ff' },
      filosofia: { emoji: '📖', titulo: 'El dolor tiene sentido', descripcion: 'Nietzsche decía que lo que no te mata te fortalece. ¿Qué fuerza está naciendo en ti?', accion: 'Escribir y crecer', color: '#74b9ff' },
      todo: { emoji: '💧', titulo: 'Está bien no estar bien', descripcion: 'Esta tarde date permiso de sentir. Escribe sin filtros, sin juicios.', accion: 'Escribir libremente', color: '#74b9ff' },
    },
    noche: {
      biblica: { emoji: '🌙', titulo: 'Noche de descanso', descripcion: '"Venid a mí todos los que estáis cansados." Entrega tu tristeza a Dios esta noche.', accion: 'Orar y escribir', color: '#74b9ff' },
      mindfulness: { emoji: '🌌', titulo: 'Cierra el día con calma', descripcion: 'Antes de dormir, escribe 3 cosas pequeñas que aún tienen belleza en tu día.', accion: 'Encontrar la luz', color: '#74b9ff' },
      filosofia: { emoji: '🦉', titulo: 'La noche es reflexión', descripcion: 'Hegel decía que el búho de Minerva vuela al anochecer. ¿Qué entiendes hoy que no entendías antes?', accion: 'Reflexionar', color: '#74b9ff' },
      todo: { emoji: '🌠', titulo: 'Termina el día en paz', descripcion: 'Esta noche escribe lo que sientes sin censura. Mañana será diferente.', accion: 'Escribir esta noche', color: '#74b9ff' },
    },
  },
  Enojado: {
    mañana: {
      biblica: { emoji: '🔥', titulo: 'Transforma el enojo', descripcion: '"Airaos, pero no pequéis." (Ef 4:26) Escribe qué te molesta y pídele a Dios sabiduría.', accion: 'Escribir con Dios', color: '#ff6b6b' },
      mindfulness: { emoji: '🌬️', titulo: 'Respira antes de actuar', descripcion: 'El enojo es energía. Esta mañana, escríbelo antes de que controle tus acciones.', accion: 'Canalizar el enojo', color: '#ff6b6b' },
      filosofia: { emoji: '⚡', titulo: '¿Qué valor defiende tu enojo?', descripcion: 'Marco Aurelio: "La mejor venganza es no ser como tu enemigo." ¿Qué valor defiendes?', accion: 'Explorar el enojo', color: '#ff6b6b' },
      todo: { emoji: '😤', titulo: 'Desahógate aquí', descripcion: 'Esta mañana escribe lo que te molesta. Tu diario no te juzga.', accion: 'Desahogarme', color: '#ff6b6b' },
    },
    tarde: {
      biblica: { emoji: '🕊️', titulo: 'Busca la paz', descripcion: '"La blanda respuesta aparta el furor." Escribe qué causó tu enojo y cómo perdonar.', accion: 'Caminar hacia la paz', color: '#ff6b6b' },
      mindfulness: { emoji: '🌊', titulo: 'El enojo pasa como las olas', descripcion: 'Observa tu enojo como una ola. No luches. Solo escríbelo y obsérvalo pasar.', accion: 'Observar y soltar', color: '#ff6b6b' },
      filosofia: { emoji: '🧠', titulo: 'La razón sobre la emoción', descripcion: 'Epicteto: "No son las cosas las que nos perturban, sino nuestra opinión de ellas."', accion: 'Reflexionar ahora', color: '#ff6b6b' },
      todo: { emoji: '💢', titulo: 'Escribe antes de explotar', descripcion: 'Mejor en tu diario que en palabras que puedas lamentar. Escribe lo que sientes.', accion: 'Escribir ahora', color: '#ff6b6b' },
    },
    noche: {
      biblica: { emoji: '🌙', titulo: 'No te duermas enojado', descripcion: '"No se ponga el sol sobre vuestro enojo." Escribe y suéltalo antes de dormir.', accion: 'Soltar antes de dormir', color: '#ff6b6b' },
      mindfulness: { emoji: '🕯️', titulo: 'Cierra el ciclo hoy', descripcion: 'El enojo que no se procesa regresa mañana. Esta noche escríbelo y suéltalo.', accion: 'Cerrar el ciclo', color: '#ff6b6b' },
      filosofia: { emoji: '🌌', titulo: 'El enojo enseña', descripcion: 'Aristóteles decía que enojarse con la persona correcta, en el momento correcto, es sabiduría.', accion: 'Escribir y aprender', color: '#ff6b6b' },
      todo: { emoji: '😮‍💨', titulo: 'Termina el día soltando', descripcion: 'Escribe lo que te molestó hoy. No lo cargues hasta mañana.', accion: 'Soltar esta noche', color: '#ff6b6b' },
    },
  },
  Cansado: {
    mañana: {
      biblica: { emoji: '☕', titulo: 'Fortaleza en Dios', descripcion: '"Los que esperan en el Señor renovarán sus fuerzas." Escribe lo que necesitas hoy.', accion: 'Escribir con fe', color: '#a29bfe' },
      mindfulness: { emoji: '🌅', titulo: 'Un paso a la vez', descripcion: 'No necesitas hacer todo hoy. Esta mañana escribe solo una intención pequeña.', accion: 'Una intención hoy', color: '#a29bfe' },
      filosofia: { emoji: '🐢', titulo: 'El descanso es sabio', descripcion: 'Lao-Tse: "El agua vence a la piedra por su constancia, no por su fuerza." Ve despacio hoy.', accion: 'Reflexionar', color: '#a29bfe' },
      todo: { emoji: '😴', titulo: 'Date permiso de descansar', descripcion: 'Esta mañana escribe qué te agota y qué necesitas soltar.', accion: 'Escribir ahora', color: '#a29bfe' },
    },
    tarde: {
      biblica: { emoji: '🙏', titulo: 'Descansa en Él', descripcion: '"Venid a mí y yo os haré descansar." Entrega tu cansancio a Dios esta tarde.', accion: 'Entregar el cansancio', color: '#a29bfe' },
      mindfulness: { emoji: '🧘', titulo: 'Pausa consciente', descripcion: 'Esta tarde date 5 minutos. Respira. Escribe cómo te sientes en este momento.', accion: 'Pausa y escribe', color: '#a29bfe' },
      filosofia: { emoji: '⚖️', titulo: 'El equilibrio es sabiduría', descripcion: 'Confucio: "No importa cuán lento vayas, siempre y cuando no te detengas."', accion: 'Seguir despacio', color: '#a29bfe' },
      todo: { emoji: '💆', titulo: 'Recarga esta tarde', descripcion: 'Escribe qué te drena energía y qué te la devuelve. Elige más de lo segundo.', accion: 'Escribir y recargar', color: '#a29bfe' },
    },
    noche: {
      biblica: { emoji: '🌙', titulo: 'El descanso es sagrado', descripcion: 'Dios mismo descansó el séptimo día. Esta noche escribe y suelta todo lo del día.', accion: 'Soltar el día', color: '#a29bfe' },
      mindfulness: { emoji: '🌌', titulo: 'Prepara tu descanso', descripcion: 'Escribe 3 cosas que lograste hoy, aunque sean pequeñas. Mereces descansar en paz.', accion: 'Celebrar lo logrado', color: '#a29bfe' },
      filosofia: { emoji: '🦉', titulo: 'El descanso es productivo', descripcion: 'Aristóteles decía que el descanso es la base de toda actividad. Escribe y cierra el día.', accion: 'Cerrar el día', color: '#a29bfe' },
      todo: { emoji: '😪', titulo: 'Ya hiciste suficiente', descripcion: 'Esta noche escribe algo que te enorgullezca de hoy, por pequeño que sea.', accion: 'Celebrar mi día', color: '#a29bfe' },
    },
  },
  Genial: {
    mañana: {
      biblica: { emoji: '🌟', titulo: 'Glorifica a Dios hoy', descripcion: '"Este es el día que hizo el Señor." Escribe cómo vas a honrar a Dios con tu energía.', accion: 'Escribir con gratitud', color: '#f5c518' },
      mindfulness: { emoji: '☀️', titulo: 'Ancla esta energía', descripcion: 'Te sientes genial. Escribe cómo quieres que sea este día y qué quieres crear.', accion: 'Escribir mi intención', color: '#f5c518' },
      filosofia: { emoji: '🚀', titulo: 'La eudaimonía es hoy', descripcion: 'Aristóteles llamaba eudaimonía al florecimiento humano. ¿Cómo florecerás hoy?', accion: 'Diseñar mi día', color: '#f5c518' },
      todo: { emoji: '🎉', titulo: '¡Qué gran mañana!', descripcion: 'Escribe qué hace que esta mañana sea especial y cómo mantener esta energía.', accion: 'Escribir ahora', color: '#f5c518' },
    },
    tarde: {
      biblica: { emoji: '🙌', titulo: 'Da gracias hoy', descripcion: '"Dad gracias en todo." Escribe 5 cosas por las que estás agradecido esta tarde.', accion: 'Escribir gratitud', color: '#f5c518' },
      mindfulness: { emoji: '🌺', titulo: 'Saborea el momento', descripcion: 'Te sientes bien. Escribe qué está pasando en tu vida que lo hace posible.', accion: 'Saborear el momento', color: '#f5c518' },
      filosofia: { emoji: '💡', titulo: 'Aprovecha el flujo', descripcion: 'Csikszentmihalyi llamaba a esto "flujo". ¿En qué actividad podrías entrar en flujo hoy?', accion: 'Entrar en flujo', color: '#f5c518' },
      todo: { emoji: '😄', titulo: 'Comparte tu energía', descripcion: 'Escribe cómo puedes hacer que alguien más se sienta bien hoy con tu energía.', accion: 'Escribir ahora', color: '#f5c518' },
    },
    noche: {
      biblica: { emoji: '🌟', titulo: 'Termina con alabanza', descripcion: 'Fue un día genial. Escribe cómo viste la mano de Dios en él.', accion: 'Escribir con fe', color: '#f5c518' },
      mindfulness: { emoji: '🌙', titulo: 'Cierra con consciencia', descripcion: 'Fue un buen día. Escribe qué lo hizo especial para recordarlo cuando lleguen días difíciles.', accion: 'Guardar este recuerdo', color: '#f5c518' },
      filosofia: { emoji: '📚', titulo: 'Aprende del buen día', descripcion: 'Los días buenos también enseñan. ¿Qué condiciones crearon este bienestar?', accion: 'Reflexionar', color: '#f5c518' },
      todo: { emoji: '✨', titulo: '¡Qué día tan bueno!', descripcion: 'Escribe los mejores momentos de hoy para recordarlos siempre.', accion: 'Guardar el recuerdo', color: '#f5c518' },
    },
  },
  Bien: {
    mañana: {
      biblica: { emoji: '🌅', titulo: 'Un nuevo comienzo', descripcion: '"Las misericordias de Dios son nuevas cada mañana." ¿Qué quieres crear hoy?', accion: 'Escribir mi día', color: '#4ecdc4' },
      mindfulness: { emoji: '🍃', titulo: 'Intención de mañana', descripcion: 'Te sientes bien. Escribe una intención clara para este día que quieres honrar.', accion: 'Escribir mi intención', color: '#4ecdc4' },
      filosofia: { emoji: '🧭', titulo: 'El camino del bien', descripcion: 'Sócrates decía que el autoconocimiento es el inicio de toda sabiduría. ¿Qué te conoces hoy?', accion: 'Explorarme', color: '#4ecdc4' },
      todo: { emoji: '😊', titulo: 'Buen comienzo', descripcion: 'Escribe qué esperas de este día y una cosa que quieres lograr.', accion: 'Escribir ahora', color: '#4ecdc4' },
    },
    tarde: {
      biblica: { emoji: '🌿', titulo: 'Camina con propósito', descripcion: '"Todo lo puedo en Cristo que me fortalece." Escribe cómo estás siendo fiel a tu propósito.', accion: 'Escribir con fe', color: '#4ecdc4' },
      mindfulness: { emoji: '🌊', titulo: 'Chequeo de mitad de día', descripcion: '¿Cómo va tu día? Tómate 5 minutos para escribir cómo te sientes ahora mismo.', accion: 'Hacer un chequeo', color: '#4ecdc4' },
      filosofia: { emoji: '⚖️', titulo: 'El bien como práctica', descripcion: 'Para los estoicos, la virtud es algo que se practica cada día. ¿Cómo la practicaste hoy?', accion: 'Reflexionar', color: '#4ecdc4' },
      todo: { emoji: '🌞', titulo: 'Sigue así', descripcion: 'Escribe qué está funcionando bien en tu vida y cómo mantenerlo.', accion: 'Escribir ahora', color: '#4ecdc4' },
    },
    noche: {
      biblica: { emoji: '🌙', titulo: 'Cierra con gratitud', descripcion: 'Escribe 3 bendiciones de hoy. Termina agradeciendo a Dios por este día.', accion: 'Escribir gratitud', color: '#4ecdc4' },
      mindfulness: { emoji: '🕯️', titulo: 'Revisión del día', descripcion: 'Escribe: ¿Qué salió bien hoy? ¿Qué aprendiste? ¿Qué mejorarías?', accion: 'Revisar mi día', color: '#4ecdc4' },
      filosofia: { emoji: '📖', titulo: 'La vida examinada', descripcion: 'Sócrates decía que la vida no examinada no merece la pena. Examina tu día de hoy.', accion: 'Examinar mi día', color: '#4ecdc4' },
      todo: { emoji: '😌', titulo: 'Buen cierre de día', descripcion: 'Escribe lo mejor de hoy y lo que esperas de mañana.', accion: 'Cerrar el día', color: '#4ecdc4' },
    },
  },
  Neutral: {
    mañana: {
      biblica: { emoji: '🌱', titulo: 'Busca el propósito hoy', descripcion: '"Todo tiene su tiempo bajo el cielo." Escribe qué propósito quieres darle a este día.', accion: 'Escribir mi propósito', color: '#a0a0a0' },
      mindfulness: { emoji: '🍃', titulo: 'Despierta con presencia', descripcion: 'Un día neutral es una pizarra en blanco. Escribe cómo quieres que sea este día.', accion: 'Diseñar mi día', color: '#a0a0a0' },
      filosofia: { emoji: '🤔', titulo: '¿Quién quieres ser hoy?', descripcion: 'Sartre decía que la existencia precede a la esencia. Hoy puedes elegir quién ser.', accion: 'Elegir quién ser', color: '#a0a0a0' },
      todo: { emoji: '😐', titulo: 'Día en blanco', descripcion: 'Un día neutral es una oportunidad. Escribe qué quieres que pase hoy.', accion: 'Escribir ahora', color: '#a0a0a0' },
    },
    tarde: {
      biblica: { emoji: '🔍', titulo: 'Busca señales de Dios', descripcion: 'A veces Dios habla en el silencio. Escribe qué pequeñas señales has visto hoy.', accion: 'Escribir señales', color: '#a0a0a0' },
      mindfulness: { emoji: '🧭', titulo: 'Chequeo de presencia', descripcion: '¿Estás en piloto automático? Escribe qué está pasando realmente en tu interior ahora.', accion: 'Conectar conmigo', color: '#a0a0a0' },
      filosofia: { emoji: '💭', titulo: 'La pregunta socrática', descripcion: '¿Qué es lo que realmente quieres en tu vida? Hoy es buen día para preguntarlo.', accion: 'Preguntarme ahora', color: '#a0a0a0' },
      todo: { emoji: '🌫️', titulo: 'Debajo de la neutralidad', descripcion: 'A veces neutral significa que algo espera ser descubierto. ¿Qué hay debajo?', accion: 'Explorar adentro', color: '#a0a0a0' },
    },
    noche: {
      biblica: { emoji: '🌙', titulo: 'El día tuvo su valor', descripcion: 'Hasta los días "normales" son parte del plan de Dios. Escribe qué valor tuvo hoy.', accion: 'Encontrar el valor', color: '#a0a0a0' },
      mindfulness: { emoji: '⭐', titulo: 'Encuentra la joya del día', descripcion: 'Incluso en días neutrales hay un momento especial. ¿Cuál fue el tuyo hoy?', accion: 'Encontrar la joya', color: '#a0a0a0' },
      filosofia: { emoji: '🦉', titulo: 'La sabiduría de lo ordinario', descripcion: 'Wittgenstein decía que lo ordinario esconde la mayor profundidad. ¿Qué escondió hoy?', accion: 'Reflexionar', color: '#a0a0a0' },
      todo: { emoji: '🌑', titulo: 'Cierra el día con honestidad', descripcion: 'Escribe honestamente cómo fue tu día. Sin adornos ni drama. Solo la verdad.', accion: 'Escribir honesto', color: '#a0a0a0' },
    },
  },
};

const sugerenciaGenerica: Record<Camino, Sugerencia> = {
  biblica: { emoji: '✝️', titulo: 'Empieza tu diario hoy', descripcion: '"Escudriñad las Escrituras." Comienza escribiendo cómo te sientes hoy con Dios.', accion: 'Escribir mi primera entrada', color: '#7c6af7' },
  mindfulness: { emoji: '🌱', titulo: 'Tu primer momento presente', descripcion: 'El viaje de mil millas comienza con un paso. Escribe cómo te sientes en este momento.', accion: 'Escribir mi primera entrada', color: '#7c6af7' },
  filosofia: { emoji: '💭', titulo: 'La vida examinada comienza aquí', descripcion: 'Sócrates decía que la vida no examinada no merece vivirse. Comienza hoy tu examen.', accion: 'Escribir mi primera entrada', color: '#7c6af7' },
  todo: { emoji: '✨', titulo: 'Bienvenido a tu diario', descripcion: 'Este es tu espacio seguro para reflexionar y crecer. ¿Cómo te sientes hoy?', accion: 'Escribir mi primera entrada', color: '#7c6af7' },
};

export const generarSugerencia = (
  emocion: string | null,
  camino: string,
  tieneEntradas: boolean
): Sugerencia => {
  if (!tieneEntradas || !emocion) {
    return sugerenciaGenerica[(camino as Camino)] || sugerenciaGenerica.todo;
  }

  const periodo = getPeriodoDia();
  const caminoKey = (camino as Camino) || 'todo';
  const emocionData = sugerencias[emocion];

  if (!emocionData) return sugerenciaGenerica[caminoKey] || sugerenciaGenerica.todo;

  return emocionData[periodo]?.[caminoKey] || sugerenciaGenerica[caminoKey] || sugerenciaGenerica.todo;
};