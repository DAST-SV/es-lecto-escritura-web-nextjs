// ============================================
// src/core/application/use-cases/auth/CheckAuthentication.ts
// ============================================
import { IAuthRepository } from '@/src/core/domain/repositories/IAuthRepository';

export class CheckAuthentication {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(): Promise<boolean> {
    return await this.authRepository.isAuthenticated();
  }
}