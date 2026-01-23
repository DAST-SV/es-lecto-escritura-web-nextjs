// ============================================
// src/core/domain/repositories/IUserRoleRepository.ts
// Repository Interface: UserRole
// ============================================

import { UserRole } from '../entities/UserRole';

export interface AssignRoleDTO {
  userId: string;
  roleId: string;
  assignedBy: string;
  notes?: string;
  isActive?: boolean;
}

export interface RevokeRoleDTO {
  revokedBy: string;
  notes?: string;
}

export interface UpdateUserRoleDTO {
  isActive?: boolean;
  notes?: string;
}

export interface IUserRoleRepository {
  /**
   * Get all user-role assignments
   */
  findAll(includeInactive?: boolean): Promise<UserRole[]>;

  /**
   * Get assignment by ID
   */
  findById(id: string): Promise<UserRole | null>;

  /**
   * Get all roles assigned to a user
   */
  findByUserId(userId: string, includeRevoked?: boolean): Promise<UserRole[]>;

  /**
   * Get all users with a specific role
   */
  findByRoleId(roleId: string, includeRevoked?: boolean): Promise<UserRole[]>;

  /**
   * Get specific user-role assignment
   */
  findByUserAndRole(userId: string, roleId: string): Promise<UserRole | null>;

  /**
   * Get active assignments for a user
   */
  findActiveByUserId(userId: string): Promise<UserRole[]>;

  /**
   * Assign a role to a user
   */
  assign(dto: AssignRoleDTO): Promise<UserRole>;

  /**
   * Revoke a role from a user (soft delete)
   */
  revoke(id: string, dto: RevokeRoleDTO): Promise<void>;

  /**
   * Update user-role assignment
   */
  update(id: string, dto: UpdateUserRoleDTO): Promise<UserRole>;

  /**
   * Delete assignment permanently (use with caution)
   */
  delete(id: string): Promise<void>;

  /**
   * Reactivate a revoked assignment
   */
  reactivate(id: string): Promise<UserRole>;
}
