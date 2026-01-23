// ============================================
// src/core/domain/repositories/IUserRoutePermissionRepository.ts
// Repository Interface: UserRoutePermission
// ============================================

import { UserRoutePermission, PermissionType } from '../entities/UserRoutePermission';

export interface CreateUserRoutePermissionDTO {
  userId: string;
  routeId: string;
  permissionType: PermissionType;
  reason?: string;
  languageCode?: string | null;
  grantedBy: string;
  expiresAt?: Date | null;
  isActive?: boolean;
}

export interface UpdateUserRoutePermissionDTO {
  permissionType?: PermissionType;
  reason?: string;
  isActive?: boolean;
  expiresAt?: Date | null;
}

export interface IUserRoutePermissionRepository {
  findAll(includeInactive?: boolean): Promise<UserRoutePermission[]>;
  findById(id: string): Promise<UserRoutePermission | null>;
  findByUserId(userId: string): Promise<UserRoutePermission[]>;
  findByRouteId(routeId: string): Promise<UserRoutePermission[]>;
  findByUserAndRoute(userId: string, routeId: string, languageCode?: string | null): Promise<UserRoutePermission | null>;
  create(dto: CreateUserRoutePermissionDTO): Promise<UserRoutePermission>;
  update(id: string, dto: UpdateUserRoutePermissionDTO): Promise<UserRoutePermission>;
  delete(id: string): Promise<void>;
}
