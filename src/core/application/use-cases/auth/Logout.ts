// ============================================
// src/core/application/use-cases/auth/Logout.ts
// ============================================
import { IAuthRepository } from '@/src/core/domain/repositories/IAuthRepository';
import { DomainAuthError } from '@/src/core/domain/errors/AuthError';

export class Logout {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(): Promise<void> {
    try {
      await this.authRepository.logout();
    } catch (error) {
      throw new DomainAuthError('Error al cerrar sesión', undefined, error);
    }
  }
}