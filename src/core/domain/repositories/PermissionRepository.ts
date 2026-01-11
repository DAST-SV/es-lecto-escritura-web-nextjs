// ============================================
// src/core/domain/repositories/PermissionRepository.ts
// Repositorio: Permisos
// ============================================

import { Permission } from '../entities/Permission';

export interface CreatePermissionDTO {
  resource: string;
  action: string;
  displayName: string;
  description: string | null;
}

export interface UpdatePermissionDTO {
  displayName?: string;
  description?: string | null;
}

export interface AssignPermissionToRoleDTO {
  roleId: string;
  permissionId: string;
}

export interface AssignPermissionToUserDTO {
  userId: string;
  permissionId: string;
  permissionType: 'grant' | 'deny';
  organizationId?: string | null;
  resourceId?: string | null;
}

export interface PermissionRepository {
  // CRUD básico
  findAll(): Promise<Permission[]>;
  findById(id: string): Promise<Permission | null>;
  findByResource(resource: string): Promise<Permission[]>;
  create(dto: CreatePermissionDTO): Promise<Permission>;
  update(id: string, dto: UpdatePermissionDTO): Promise<Permission>;
  delete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;

  // Asignación a roles
  assignToRole(dto: AssignPermissionToRoleDTO): Promise<void>;
  revokeFromRole(dto: AssignPermissionToRoleDTO): Promise<void>;
  getRolePermissions(roleId: string): Promise<Permission[]>;

  // Asignación a usuarios (permisos directos)
  assignToUser(dto: AssignPermissionToUserDTO): Promise<void>;
  revokeFromUser(userId: string, permissionId: string): Promise<void>;
  getUserPermissions(userId: string): Promise<Permission[]>;

  // Asignación a rutas
  getRoutePermissions(routeId: string): Promise<Permission[]>;
}