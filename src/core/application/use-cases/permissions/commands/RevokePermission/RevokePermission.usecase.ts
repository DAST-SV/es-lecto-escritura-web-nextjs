// ============================================
// RevokePermission Use Case
// ============================================

import { IPermissionRepository } from '@/src/core/domain/repositories/IPermissionRepository';

export interface RevokePermissionDTO {
  userId: string;
  routeId: string;
  revokedBy: string;
  reason?: string;
}

export class RevokePermissionUseCase {
  constructor(private repository: IPermissionRepository) {}

  async execute(dto: RevokePermissionDTO): Promise<void> {
    if (!dto.userId || !dto.routeId) {
      throw new Error('userId y routeId son requeridos');
    }

    await this.repository.revokePermission(dto);
  }
}