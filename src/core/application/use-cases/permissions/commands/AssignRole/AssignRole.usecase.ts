// ============================================
// AssignRole Use Case
// ============================================

import { IPermissionRepository } from '@/src/core/domain/repositories/IPermissionRepository';

export interface AssignRoleDTO {
  userId: string;
  roleId: string;
  assignedBy: string;
  notes?: string;
}

export class AssignRoleUseCase {
  constructor(private repository: IPermissionRepository) {}

  async execute(dto: AssignRoleDTO): Promise<void> {
    if (!dto.userId || !dto.roleId) {
      throw new Error('userId y roleId son requeridos');
    }

    await this.repository.assignRole(dto);
  }
}