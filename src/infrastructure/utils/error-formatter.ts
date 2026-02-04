/**
 * UBICACIÓN: src/infrastructure/utils/error-formatter.ts
 * Utilidad para formatear errores de Supabase y otros errores de manera legible
 */

export interface SupabaseError {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
}

/**
 * Formatea un error de Supabase de manera legible
 */
export function formatSupabaseError(error: unknown): string {
  if (!error) return 'Error desconocido';

  if (typeof error === 'string') return error;

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as SupabaseError;
    const parts: string[] = [];

    if (err.message) parts.push(`Mensaje: ${err.message}`);
    if (err.code) parts.push(`Código: ${err.code}`);
    if (err.details) parts.push(`Detalles: ${err.details}`);
    if (err.hint) parts.push(`Sugerencia: ${err.hint}`);
    if (err.status) parts.push(`Status: ${err.status}`);

    if (parts.length > 0) return parts.join(' | ');

    try {
      const jsonStr = JSON.stringify(error, null, 2);
      if (jsonStr !== '{}') return jsonStr;
      return 'Error sin detalles disponibles';
    } catch {
      return String(error);
    }
  }

  return String(error);
}

/**
 * Formatea un error para mostrar en consola con contexto
 */
export function logDetailedError(context: string, error: unknown): void {
  const formattedError = formatSupabaseError(error);
  console.error(`❌ [${context}]`, formattedError);

  if (typeof error === 'object' && error !== null) {
    console.error(`   Objeto completo:`, error);
  }
}

/**
 * Crea un mensaje de error amigable para mostrar al usuario
 */
export function getUserFriendlyError(error: unknown, defaultMessage: string = 'Ha ocurrido un error'): string {
  if (!error) return defaultMessage;

  if (typeof error === 'object' && error !== null) {
    const err = error as SupabaseError;

    // Errores comunes de Supabase traducidos
    if (err.code === 'PGRST301') {
      return 'No tienes permisos para acceder a este recurso';
    }
    if (err.code === '42P01') {
      return 'La tabla solicitada no existe en la base de datos';
    }
    if (err.code === '42501') {
      return 'Permisos insuficientes para esta operación';
    }
    if (err.code === '23505') {
      return 'Este registro ya existe (duplicado)';
    }
    if (err.code === '23503') {
      return 'No se puede realizar la operación porque hay dependencias';
    }
    if (err.code === 'PGRST116') {
      return 'No se encontró el registro solicitado';
    }

    if (err.message) {
      // Traducir mensajes comunes
      if (err.message.includes('permission denied')) {
        return 'No tienes permisos para esta acción';
      }
      if (err.message.includes('not found')) {
        return 'Recurso no encontrado';
      }
      if (err.message.includes('relation') && err.message.includes('does not exist')) {
        return `La tabla "${err.message.match(/relation "([^"]+)"/)?.[1] || 'desconocida'}" no existe`;
      }

      return err.message;
    }
  }

  return defaultMessage;
}
