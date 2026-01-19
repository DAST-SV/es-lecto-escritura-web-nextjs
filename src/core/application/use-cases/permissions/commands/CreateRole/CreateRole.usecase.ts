// ============================================
// src/core/application/use-cases/permissions/commands/CreateRole/CreateRole.usecase.ts
// ============================================

import { IPermissionRepository } from '@/src/core/domain/repositories/IPermissionRepository';
import { Role } from '@/src/core/domain/entities/Permission';

export interface CreateRoleDTO {
  name: string;
  displayName: string;
  description?: string;
  hierarchyLevel: number;
  isSystemRole?: boolean;
}

export class CreateRoleUseCase {
  constructor(private repository: IPermissionRepository) {}

  async execute(dto: CreateRoleDTO): Promise<Role> {
    // Validación básica
    if (!dto.name || dto.name.trim().length === 0) {
      throw new Error('El nombre del rol es requerido');
    }

    if (dto.hierarchyLevel < 0 || dto.hierarchyLevel > 100) {
      throw new Error('El nivel de jerarquía debe estar entre 0 y 100');
    }

    // Crear rol a través del repositorio
    return await this.repository.createRole({
      name: dto.name,
      display_name: dto.displayName,
      description: dto.description || null,
      hierarchy_level: dto.hierarchyLevel,
      is_active: true,
      is_system_role: dto.isSystemRole || false,
    });
  }
}