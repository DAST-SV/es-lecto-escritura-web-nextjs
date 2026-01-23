// ============================================
// src/core/domain/repositories/IRoleRepository.ts
// Repository Interface: Role
// ============================================

import { Role } from '../entities/Role';

export interface CreateRoleDTO {
  name: string;
  displayName: string;
  description?: string;
  hierarchyLevel?: number;
  isActive?: boolean;
  isSystemRole?: boolean;
  createdBy: string;
}

export interface UpdateRoleDTO {
  displayName?: string;
  description?: string;
  hierarchyLevel?: number;
  isActive?: boolean;
}

export interface IRoleRepository {
  /**
   * Get all roles (excluding system roles if needed)
   */
  findAll(includeInactive?: boolean): Promise<Role[]>;

  /**
   * Get role by ID
   */
  findById(id: string): Promise<Role | null>;

  /**
   * Get role by name
   */
  findByName(name: string): Promise<Role | null>;

  /**
   * Get all system roles
   */
  findSystemRoles(): Promise<Role[]>;

  /**
   * Get roles by hierarchy level
   */
  findByHierarchyLevel(level: number): Promise<Role[]>;

  /**
   * Create a new role
   */
  create(dto: CreateRoleDTO): Promise<Role>;

  /**
   * Update an existing role
   */
  update(id: string, dto: UpdateRoleDTO, updatedBy: string): Promise<Role>;

  /**
   * Delete a role (only if not system role)
   */
  delete(id: string): Promise<void>;

  /**
   * Deactivate a role (soft delete alternative)
   */
  deactivate(id: string): Promise<void>;

  /**
   * Activate a role
   */
  activate(id: string): Promise<void>;
}
