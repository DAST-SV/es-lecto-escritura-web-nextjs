// ============================================
// src/core/application/use-cases/user-types/RestoreUserType.usecase.ts
// ✅ NUEVO USE CASE
// ============================================

import { IUserTypeRepository } from '@/src/core/domain/repositories/IUserTypeRepository';
import { UserType } from '@/src/core/domain/entities/UserType';

export class RestoreUserTypeUseCase {
  constructor(private repository: IUserTypeRepository) {}

  async execute(id: number): Promise<UserType> {
    if (!id || id <= 0) {
      throw new Error('ID inválido');
    }

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error(`Tipo de usuario con ID ${id} no encontrado`);
    }

    if (!existing.deletedAt) {
      throw new Error('El tipo de usuario no está eliminado');
    }

    return await this.repository.restore(id);
  }
}