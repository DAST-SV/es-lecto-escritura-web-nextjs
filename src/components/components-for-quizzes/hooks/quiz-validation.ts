// src/lib/quiz/quiz-validation.ts
import { CreateQuizData, CreatePreguntaData } from '@/src/typings/types-quiz';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Valida que el quiz tenga información básica completa
 */
export function validateQuizBasicInfo(formData: CreateQuizData): ValidationResult {
  const errors: string[] = [];

  if (!formData.titulo.trim()) {
    errors.push('El título del quiz es obligatorio');
  }

  if ((formData.puntos_maximos ?? 0) <= 0) {
    errors.push('Los puntos máximos deben ser mayores a 0');
  }

  if (formData.preguntas.length === 0) {
    errors.push('Debes agregar al menos una pregunta');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valida que cada pregunta tenga al menos una respuesta correcta
 */
export function validateCorrectAnswers(preguntas: CreatePreguntaData[]): ValidationResult {
  const errors: string[] = [];

  preguntas.forEach((pregunta, index) => {
    // Preguntas abiertas no requieren opciones
    if (pregunta.tipo_pregunta === 'abierta') return;

    const tieneCorrecta = pregunta.opciones.some((opcion) => opcion.es_correcta);

    if (!tieneCorrecta) {
      const numeroPregunta = index + 1;
      const textoPregunta = pregunta.texto_pregunta.trim() || '(sin título)';
      errors.push(
        `⚠️ Pregunta ${numeroPregunta} "${textoPregunta}": Debe tener al menos una respuesta correcta`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valida que cada pregunta tenga texto y opciones suficientes
 */
export function validateQuestionContent(preguntas: CreatePreguntaData[]): ValidationResult {
  const errors: string[] = [];

  preguntas.forEach((pregunta, index) => {
    const numeroPregunta = index + 1;

    // Validar texto de pregunta
    if (!pregunta.texto_pregunta.trim()) {
      errors.push(`⚠️ Pregunta ${numeroPregunta}: El texto de la pregunta es obligatorio`);
    }

    // Validar opciones (excepto preguntas abiertas)
    if (pregunta.tipo_pregunta !== 'abierta') {
      if (pregunta.opciones.length < 2) {
        errors.push(
          `⚠️ Pregunta ${numeroPregunta}: Debe tener al menos 2 opciones de respuesta`
        );
      }

      // Validar que las opciones tengan texto
      pregunta.opciones.forEach((opcion, opcionIndex) => {
        if (!opcion.texto_opcion.trim()) {
          errors.push(
            `⚠️ Pregunta ${numeroPregunta}, Opción ${opcionIndex + 1}: El texto es obligatorio`
          );
        }
      });
    }

    // Validar puntos
    if ((pregunta.puntos ?? 0) <= 0) {
      errors.push(`⚠️ Pregunta ${numeroPregunta}: Los puntos deben ser mayores a 0`);
    }

  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validación completa del quiz antes de enviarlo
 */
export function validateQuizComplete(formData: CreateQuizData): ValidationResult {
  const allErrors: string[] = [];

  // Validar información básica
  const basicValidation = validateQuizBasicInfo(formData);
  allErrors.push(...basicValidation.errors);

  // Validar contenido de preguntas
  const contentValidation = validateQuestionContent(formData.preguntas);
  allErrors.push(...contentValidation.errors);

  // Validar respuestas correctas
  const answersValidation = validateCorrectAnswers(formData.preguntas);
  allErrors.push(...answersValidation.errors);

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Calcula el total de puntos del quiz sumando los puntos de cada pregunta
 */
export function calculateTotalPoints(preguntas: CreatePreguntaData[]): number {
  return preguntas.reduce((total, pregunta) => total + (pregunta.puntos || 0), 0);
}

/**
 * Muestra las alertas de validación al usuario
 */
export function showValidationErrors(errors: string[]): void {
  if (errors.length === 1) {
    alert(errors[0]);
  } else {
    const errorMessage = '❌ Se encontraron los siguientes errores:\n\n' + errors.join('\n');
    alert(errorMessage);
  }
}