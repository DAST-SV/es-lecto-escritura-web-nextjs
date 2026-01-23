// ============================================
// 4. src/core/application/use-cases/user-types/GetUserTypeById.usecase.ts
// ============================================

import { IUserTypeRepository } from '@/src/core/domain/repositories/IUserTypeRepository';
import { UserType } from '@/src/core/domain/entities/UserType';

export class GetUserTypeByIdUseCase {
  constructor(private repository: IUserTypeRepository) {}

  async execute(id: number): Promise<UserType> {
    if (!id || id <= 0) {
      throw new Error('ID inválido');
    }

    const userType = await this.repository.findById(id);

    if (!userType) {
      throw new Error(`Tipo de usuario con ID ${id} no encontrado`);
    }

    return userType;
  }
}