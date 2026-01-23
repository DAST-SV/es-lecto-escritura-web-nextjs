// ============================================
// GetUserRoles Use Case
// ============================================

import { IPermissionRepository } from '@/src/core/domain/repositories/IPermissionRepository';
import { Role } from '@/src/core/domain/entities/Permission';

export class GetUserRolesUseCase {
  constructor(private repository: IPermissionRepository) {}

  async execute(userId: string): Promise<Role[]> {
    if (!userId) {
      throw new Error('userId es requerido');
    }

    return await this.repository.getUserRoles(userId);
  }
}