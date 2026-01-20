// ============================================
// src/core/domain/repositories/IRoutePermissionRepository.ts
// Repository Interface: RoutePermission
// ============================================

import { RoutePermission } from '../entities/RoutePermission';

export interface CreateRoutePermissionDTO {
  roleName: string;
  routeId: string;
  languageCode?: string | null;
  isActive?: boolean;
  createdBy: string;
}

export interface UpdateRoutePermissionDTO {
  isActive?: boolean;
  languageCode?: string | null;
}

export interface IRoutePermissionRepository {
  findAll(includeInactive?: boolean): Promise<RoutePermission[]>;
  findById(id: string): Promise<RoutePermission | null>;
  findByRoleName(roleName: string): Promise<RoutePermission[]>;
  findByRouteId(routeId: string): Promise<RoutePermission[]>;
  findByRoleAndRoute(roleName: string, routeId: string, languageCode?: string | null): Promise<RoutePermission | null>;
  create(dto: CreateRoutePermissionDTO): Promise<RoutePermission>;
  update(id: string, dto: UpdateRoutePermissionDTO): Promise<RoutePermission>;
  delete(id: string): Promise<void>;
  activate(id: string): Promise<void>;
  deactivate(id: string): Promise<void>;
}
