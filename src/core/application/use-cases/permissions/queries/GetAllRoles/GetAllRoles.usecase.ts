// ============================================
// src/core/application/use-cases/permissions/queries/GetAllRoles/GetAllRoles.usecase.ts
// ============================================

import { IPermissionRepository } from '@/src/core/domain/repositories/IPermissionRepository';
import { Role } from '@/src/core/domain/entities/Permission';

export class GetAllRolesUseCase {
  constructor(private repository: IPermissionRepository) {}

  async execute(): Promise<Role[]> {
    return await this.repository.getAllRoles();
  }
}