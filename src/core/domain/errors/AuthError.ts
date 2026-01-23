// ============================================
// src/core/domain/errors/AuthError.ts
// ============================================

import { AuthError } from "@supabase/supabase-js";

/**
 * Errores de dominio para autenticación
 * Envuelve los errores de Supabase en errores de dominio
 */
export class DomainAuthError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'DomainAuthError';
  }

  static fromSupabaseError(error: AuthError): DomainAuthError {
    return new DomainAuthError(
      error.message,
      error.code,
      error
    );
  }
}