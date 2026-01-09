// ============================================
// src/core/application/use-cases/auth/GetCurrentUser.ts
// ============================================

import { IAuthRepository } from '@/src/core/domain/repositories/IAuthRepository';
import { User } from '@/src/core/domain/entities/User';

export class GetCurrentUser {
  constructor(private authRepository: IAuthRepository) {}

  async execute(): Promise<User | null> {
    return await this.authRepository.getCurrentUser();
  }
}