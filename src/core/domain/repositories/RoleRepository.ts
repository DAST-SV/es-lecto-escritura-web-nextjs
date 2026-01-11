// ============================================
// src/core/domain/repositories/RoleRepository.ts
// Repositorio: Roles
// ============================================

import { Role } from '../entities/Role';

export interface CreateRoleDTO {
  name: string;
  displayName: string;
  description: string | null;
  hierarchyLevel: number;
}

export interface UpdateRoleDTO {
  displayName?: string;
  description?: string | null;
  hierarchyLevel?: number;
}

export interface RoleRepository {
  findAll(): Promise<Role[]>;
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  create(dto: CreateRoleDTO): Promise<Role>;
  update(id: string, dto: UpdateRoleDTO): Promise<Role>;
  delete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
  
  // Obtener permisos del rol
  getPermissions(roleId: string): Promise<string[]>;
}