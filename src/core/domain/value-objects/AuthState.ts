// ============================================
// src/core/domain/value-objects/AuthState.ts
// ============================================
import type { User } from '@supabase/supabase-js';

/**
 * Value Object que representa el estado de autenticación
 */
export class AuthState {
  constructor(
    public readonly user: User | null,
    public readonly isLoading: boolean = false,
    public readonly error: string | null = null
  ) {}

  static initial(): AuthState {
    return new AuthState(null, true, null);
  }

  static authenticated(user: User): AuthState {
    return new AuthState(user, false, null);
  }

  static unauthenticated(): AuthState {
    return new AuthState(null, false, null);
  }

  static withError(error: string): AuthState {
    return new AuthState(null, false, error);
  }

  get isAuthenticated(): boolean {
    return this.user !== null;
  }
}