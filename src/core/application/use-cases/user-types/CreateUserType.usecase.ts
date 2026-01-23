// ============================================
// src/core/application/use-cases/user-types/CreateUserType.usecase.ts
// ✅ CORREGIDO
// ============================================

import { IUserTypeRepository } from '@/src/core/domain/repositories/IUserTypeRepository';
import { UserType } from '@/src/core/domain/entities/UserType';

export class CreateUserTypeUseCase {
  constructor(private repository: IUserTypeRepository) {}

  async execute(data: { name: string; description: string | null }): Promise<UserType> {
    const userType = UserType.create(data.name, data.description);

    const exists = await this.repository.existsByName(data.name);
    if (exists) {
      throw new Error(`Ya existe un tipo de usuario con el nombre "${data.name}"`);
    }

    return await this.repository.create({
      name: userType.name,
      description: userType.description
    });
  }
}