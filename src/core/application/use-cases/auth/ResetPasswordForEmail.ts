// ============================================
// src/core/application/use-cases/auth/ResetPasswordForEmail.ts
// ============================================
import type { AuthError } from '@supabase/supabase-js';
import { IAuthRepository } from '@/src/core/domain/repositories/IAuthRepository';

export class ResetPasswordForEmail {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(email: string, redirectTo: string): Promise<{ error: AuthError | null }> {
    return this.authRepository.resetPasswordForEmail(email, redirectTo);
  }
}
