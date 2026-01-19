// ============================================
// RevokeRole Use Case
// ============================================

import { IPermissionRepository } from '@/src/core/domain/repositories/IPermissionRepository';

export interface RevokeRoleDTO {
  userId: string;
  roleId: string;
  revokedBy: string;
  reason?: string;
}

export class RevokeRoleUseCase {
  constructor(private repository: IPermissionRepository) {}

  async execute(dto: RevokeRoleDTO): Promise<void> {
    if (!dto.userId || !dto.roleId) {
      throw new Error('userId y roleId son requeridos');
    }

    await this.repository.revokeRole(dto);
  }
}