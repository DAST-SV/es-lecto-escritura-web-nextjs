// ============================================
// src/core/application/use-cases/auth/GetCurrentUser.ts
// ============================================
import type { User } from '@supabase/supabase-js';
import { IAuthRepository } from '@/src/core/domain/repositories/IAuthRepository';

export class GetCurrentUser {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(): Promise<User | null> {
    return await this.authRepository.getCurrentUser();
  }
}