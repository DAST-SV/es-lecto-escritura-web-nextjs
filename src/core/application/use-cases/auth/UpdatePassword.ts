// ============================================
// src/core/application/use-cases/auth/UpdatePassword.ts
// ============================================
import { IAuthRepository, AuthResult } from '@/src/core/domain/repositories/IAuthRepository';

export class UpdatePassword {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(newPassword: string): Promise<AuthResult> {
    return this.authRepository.updatePassword(newPassword);
  }
}
