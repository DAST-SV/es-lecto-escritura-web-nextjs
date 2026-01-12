// ============================================
// src/core/domain/repositories/RoutePermissionRepository.ts
// ============================================

import { RoutePermission } from '../entities/RoutePermission';

export interface CreateRoutePermissionDTO {
  routeId: string;
  roleName?: string;
  permissionBoxId?: string;
  languageCode?: string;
}

export interface RoutePermissionRepository {
  findAll(): Promise<RoutePermission[]>;
  findByRoute(routeId: string): Promise<RoutePermission[]>;
  findByRole(roleName: string): Promise<RoutePermission[]>;
  findByBox(boxId: string): Promise<RoutePermission[]>;
  create(dto: CreateRoutePermissionDTO): Promise<RoutePermission>;
  delete(id: string): Promise<void>;
  deleteByRoute(routeId: string): Promise<void>;
}