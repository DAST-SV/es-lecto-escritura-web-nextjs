// ============================================
// src/core/application/use-cases/auth/Login.ts
// ============================================
import { IAuthRepository, LoginCredentials, AuthResult } from '@/src/core/domain/repositories/IAuthRepository';
import { DomainAuthError } from '@/src/core/domain/errors/AuthError';

export class Login {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const result = await this.authRepository.login(credentials);
      
      if (result.error) {
        throw DomainAuthError.fromSupabaseError(result.error);
      }

      return result;
    } catch (error) {
      if (error instanceof DomainAuthError) {
        throw error;
      }
      throw new DomainAuthError('Error inesperado al iniciar sesión', undefined, error);
    }
  }
}