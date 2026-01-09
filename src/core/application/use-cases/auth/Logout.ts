// ============================================
// src/core/application/use-cases/auth/Logout.ts
// ============================================

import { IAuthRepository } from '@/src/core/domain/repositories/IAuthRepository';

export class Logout {
  constructor(private authRepository: IAuthRepository) {}

  async execute(): Promise<void> {
    await this.authRepository.logout();
  }
}