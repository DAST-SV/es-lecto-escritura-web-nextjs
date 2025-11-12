// src/typings/types-quiz.ts

/**
 * Tipo de pregunta disponible en el quiz
 */
export type TipoPregunta = 'multiple' | 'verdadero_falso' | 'abierta';

/**
 * Opción de respuesta para una pregunta
 */
export interface CreateOpcionData {
  texto_opcion: string;
  es_correcta: boolean;
  orden: number;
}

/**
 * Opción de respuesta con ID (cuando ya existe en BD)
 */
export interface OpcionData extends CreateOpcionData {
  id_opcion: string;
  id_pregunta: string;
}


/**
 * Pregunta para crear/editar
 */
export interface CreatePreguntaData {
  texto_pregunta: string;
  tipo_pregunta: string;
  puntos: number;
  explicacion: string;
  opciones: CreateOpcionData[];
  orden? : number;
}

/**
 * Pregunta con ID (cuando ya existe en BD)
 */
export interface PreguntaData extends Omit<CreatePreguntaData, 'opciones'> {
  id_pregunta: string;
  id_actividad: string;
  orden: number;
  opciones: OpcionData[];
}

/**
 * Quiz para crear/editar
 */
export interface CreateQuizData {
  id_libro: string;
  titulo: string;
  descripcion: string;
  puntos_maximos: number;
  tiempo_limite?: number;
  intentos_permitidos?: number;
  preguntas: CreatePreguntaData[];
  orden? : number;
}

/**
 * Quiz completo (cuando ya existe en BD)
 */
export interface QuizData extends CreateQuizData {
  id_actividad: string;
  id_tipo_actividad: number;
  orden?: number;
  fecha_creacion: string;
  activo: boolean;
  preguntas: PreguntaData[];
}

/**
 * Respuesta del usuario a una pregunta
 */
export interface RespuestaUsuarioData {
  id_respuesta: string;
  id_intento: string;
  id_pregunta: string;
  id_opcion?: string;
  texto_respuesta?: string;
  puntos_obtenidos: number;
  tiempo_respuesta?: number;
  fecha_respuesta: string;
}

/**
 * Intento de un usuario en un quiz
 */
export interface IntentoActividadData {
  id_intento: string;
  id_actividad: string;
  id_usuario: string;
  puntuacion: number;
  fecha_inicio: string;
  fecha_fin?: string;
  tiempo_empleado?: number;
  completado: boolean;
}

/**
 * Estadísticas de un quiz
 */
export interface QuizEstadisticas {
  total_intentos: number;
  promedio_puntuacion: number;
  mejor_puntuacion: number;
  peor_puntuacion: number;
  tasa_completado: number;
  tiempo_promedio?: number;
}

/**
 * Resultado de un intento con detalles
 */
export interface ResultadoQuiz {
  intento: IntentoActividadData;
  respuestas: RespuestaUsuarioData[];
  quiz: QuizData;
  porcentaje: number;
}