// ============================================
// src/core/application/use-cases/auth/Signup.ts
// ============================================
import { IAuthRepository, SignupCredentials, AuthResult } from '@/src/core/domain/repositories/IAuthRepository';
import { DomainAuthError } from '@/src/core/domain/errors/AuthError';

export class Signup {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(credentials: SignupCredentials): Promise<AuthResult> {
    try {
      const result = await this.authRepository.signup(credentials);
      
      if (result.error) {
        throw DomainAuthError.fromSupabaseError(result.error);
      }

      return result;
    } catch (error) {
      if (error instanceof DomainAuthError) {
        throw error;
      }
      throw new DomainAuthError('Error inesperado al registrarse', undefined, error);
    }
  }
}