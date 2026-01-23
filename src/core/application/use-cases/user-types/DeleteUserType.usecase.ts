// ============================================
// 7. src/core/application/use-cases/user-types/DeleteUserType.usecase.ts
// ============================================

import { IUserTypeRepository } from '@/src/core/domain/repositories/IUserTypeRepository';

export class DeleteUserTypeUseCase {
  constructor(private repository: IUserTypeRepository) {}

  async execute(id: number): Promise<void> {
    if (!id || id <= 0) {
      throw new Error('ID inválido');
    }

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error(`Tipo de usuario con ID ${id} no encontrado`);
    }

    await this.repository.delete(id);
  }
}