// ============================================
// src/core/application/use-cases/route-permissions/index.ts
// Use Cases: RoutePermission Management
// ============================================

import { IRoutePermissionRepository, CreateRoutePermissionDTO, UpdateRoutePermissionDTO } from '@/src/core/domain/repositories/IRoutePermissionRepository';
import { RoutePermission } from '@/src/core/domain/entities/RoutePermission';

export class GetAllRoutePermissionsUseCase {
  constructor(private repository: IRoutePermissionRepository) {}
  async execute(includeInactive: boolean = false): Promise<RoutePermission[]> {
    return this.repository.findAll(includeInactive);
  }
}

export class GetRoutePermissionByIdUseCase {
  constructor(private repository: IRoutePermissionRepository) {}
  async execute(id: string): Promise<RoutePermission | null> {
    return this.repository.findById(id);
  }
}

export class GetRoutePermissionsByRoleUseCase {
  constructor(private repository: IRoutePermissionRepository) {}
  async execute(roleName: string): Promise<RoutePermission[]> {
    return this.repository.findByRoleName(roleName);
  }
}

export class CreateRoutePermissionUseCase {
  constructor(private repository: IRoutePermissionRepository) {}
  async execute(dto: CreateRoutePermissionDTO): Promise<RoutePermission> {
    const existing = await this.repository.findByRoleAndRoute(dto.roleName, dto.routeId, dto.languageCode);
    if (existing && existing.isActive) {
      throw new Error('This permission already exists');
    }
    return this.repository.create(dto);
  }
}

export class UpdateRoutePermissionUseCase {
  constructor(private repository: IRoutePermissionRepository) {}
  async execute(id: string, dto: UpdateRoutePermissionDTO): Promise<RoutePermission> {
    return this.repository.update(id, dto);
  }
}

export class DeleteRoutePermissionUseCase {
  constructor(private repository: IRoutePermissionRepository) {}
  async execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
