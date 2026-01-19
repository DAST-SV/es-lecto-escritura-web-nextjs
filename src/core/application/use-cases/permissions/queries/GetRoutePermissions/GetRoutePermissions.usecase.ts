// ============================================
// GetRoutePermissions Use Case
// ============================================

import { IPermissionRepository } from '@/src/core/domain/repositories/IPermissionRepository';

export interface RoutePermission {
  routeId: string;
  routeName: string;
  allowedRoles: string[];
}

export class GetRoutePermissionsUseCase {
  constructor(private repository: IPermissionRepository) {}

  async execute(routeId?: string): Promise<RoutePermission[]> {
    return await this.repository.getRoutePermissions(routeId);
  }
}