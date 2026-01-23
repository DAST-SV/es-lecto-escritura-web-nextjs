// src/core/application/use-cases/GetUserPermissionsUseCase.ts

/**
 * Application Use Case: Get User Permissions
 * Obtiene todos los permisos de un usuario
 */

import { IPermissionRepository } from '@/src/core/domain/repositories/IPermissionRepository';
import { UserPermissions } from '@/src/core/domain/entities/Permission';

export class GetUserPermissionsUseCase {
  constructor(private permissionRepository: IPermissionRepository) {}

  async execute(userId: string): Promise<UserPermissions> {
    return this.permissionRepository.getUserPermissions(userId);
  }
}