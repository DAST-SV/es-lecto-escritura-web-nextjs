// ============================================
// GrantPermission Use Case
// ============================================

import { IPermissionRepository } from '@/src/core/domain/repositories/IPermissionRepository';

export interface GrantPermissionDTO {
  userId: string;
  routeId: string;
  grantedBy: string;
  reason?: string;
  expiresAt?: Date;
}

export class GrantPermissionUseCase {
  constructor(private repository: IPermissionRepository) {}

  async execute(dto: GrantPermissionDTO): Promise<void> {
    if (!dto.userId || !dto.routeId) {
      throw new Error('userId y routeId son requeridos');
    }

    await this.repository.grantPermission(dto);
  }
}