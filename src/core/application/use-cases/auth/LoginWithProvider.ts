// ============================================
// src/core/application/use-cases/auth/LoginWithProvider.ts
// ============================================
import { IAuthRepository, OAuthProvider } from '@/src/core/domain/repositories/IAuthRepository';
import { DomainAuthError } from '@/src/core/domain/errors/AuthError';

export class LoginWithProvider {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(provider: OAuthProvider, redirectTo?: string): Promise<{ url: string }> {
    try {
      return await this.authRepository.loginWithProvider(provider, redirectTo);
    } catch (error) {
      throw new DomainAuthError(
        `Error al iniciar sesión con ${provider}`,
        undefined,
        error
      );
    }
  }
}