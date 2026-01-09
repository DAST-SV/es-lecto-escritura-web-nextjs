// ============================================
// 6. src/core/application/use-cases/user-types/UpdateUserType.usecase.ts
// ============================================

import { IUserTypeRepository } from '@/src/core/domain/repositories/IUserTypeRepository';
import { UserType } from '@/src/core/domain/entities/UserType';

export class UpdateUserTypeUseCase {
  constructor(private repository: IUserTypeRepository) {}

  async execute(
    id: number,
    data: { nombre: string; descripcion: string | null }
  ): Promise<UserType> {
    if (!id || id <= 0) {
      throw new Error('ID inválido');
    }

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error(`Tipo de usuario con ID ${id} no encontrado`);
    }

    const updated = existing.update(data);

    const nameExists = await this.repository.existsByName(data.nombre, id);
    if (nameExists) {
      throw new Error(`Ya existe otro tipo de usuario con el nombre "${data.nombre}"`);
    }

    return await this.repository.update(id, {
      nombre: updated.nombre,
      descripcion: updated.descripcion
    });
  }
}