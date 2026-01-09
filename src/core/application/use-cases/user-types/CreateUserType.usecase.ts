// ============================================
// 5. src/core/application/use-cases/user-types/CreateUserType.usecase.ts
// ============================================

import { IUserTypeRepository } from '@/src/core/domain/repositories/IUserTypeRepository';
import { UserType } from '@/src/core/domain/entities/UserType';

export class CreateUserTypeUseCase {
  constructor(private repository: IUserTypeRepository) {}

  async execute(data: { nombre: string; descripcion: string | null }): Promise<UserType> {
    const userType = UserType.create(data.nombre, data.descripcion);

    const exists = await this.repository.existsByName(data.nombre);
    if (exists) {
      throw new Error(`Ya existe un tipo de usuario con el nombre "${data.nombre}"`);
    }

    return await this.repository.create({
      nombre: userType.nombre,
      descripcion: userType.descripcion
    });
  }
}