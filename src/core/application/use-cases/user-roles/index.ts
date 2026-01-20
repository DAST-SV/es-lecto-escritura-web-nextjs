// ============================================
// src/core/application/use-cases/user-roles/index.ts
// Use Cases: UserRole Management
// ============================================

import { IUserRoleRepository, AssignRoleDTO, RevokeRoleDTO, UpdateUserRoleDTO } from '@/src/core/domain/repositories/IUserRoleRepository';
import { UserRole } from '@/src/core/domain/entities/UserRole';

/**
 * Get all user-role assignments
 */
export class GetAllUserRolesUseCase {
  constructor(private repository: IUserRoleRepository) {}

  async execute(includeInactive: boolean = false): Promise<UserRole[]> {
    return this.repository.findAll(includeInactive);
  }
}

/**
 * Get user-role assignment by ID
 */
export class GetUserRoleByIdUseCase {
  constructor(private repository: IUserRoleRepository) {}

  async execute(id: string): Promise<UserRole | null> {
    return this.repository.findById(id);
  }
}

/**
 * Get all roles for a specific user
 */
export class GetUserRolesByUserIdUseCase {
  constructor(private repository: IUserRoleRepository) {}

  async execute(userId: string, includeRevoked: boolean = false): Promise<UserRole[]> {
    return this.repository.findByUserId(userId, includeRevoked);
  }
}

/**
 * Get all users with a specific role
 */
export class GetUsersByRoleIdUseCase {
  constructor(private repository: IUserRoleRepository) {}

  async execute(roleId: string, includeRevoked: boolean = false): Promise<UserRole[]> {
    return this.repository.findByRoleId(roleId, includeRevoked);
  }
}

/**
 * Get active roles for a user
 */
export class GetActiveUserRolesUseCase {
  constructor(private repository: IUserRoleRepository) {}

  async execute(userId: string): Promise<UserRole[]> {
    return this.repository.findActiveByUserId(userId);
  }
}

/**
 * Assign a role to a user
 */
export class AssignRoleToUserUseCase {
  constructor(private repository: IUserRoleRepository) {}

  async execute(dto: AssignRoleDTO): Promise<UserRole> {
    // Validate required fields
    if (!dto.userId || !dto.roleId || !dto.assignedBy) {
      throw new Error('User ID, Role ID, and Assigned By are required');
    }

    // Check if already assigned and active
    const existing = await this.repository.findByUserAndRole(dto.userId, dto.roleId);
    if (existing && existing.isActive && !existing.isRevoked()) {
      throw new Error('This role is already assigned to the user');
    }

    return this.repository.assign(dto);
  }
}

/**
 * Revoke a role from a user
 */
export class RevokeRoleFromUserUseCase {
  constructor(private repository: IUserRoleRepository) {}

  async execute(id: string, dto: RevokeRoleDTO): Promise<void> {
    const userRole = await this.repository.findById(id);
    if (!userRole) {
      throw new Error('User role assignment not found');
    }

    if (userRole.isRevoked()) {
      throw new Error('This role assignment is already revoked');
    }

    return this.repository.revoke(id, dto);
  }
}

/**
 * Update user-role assignment
 */
export class UpdateUserRoleUseCase {
  constructor(private repository: IUserRoleRepository) {}

  async execute(id: string, dto: UpdateUserRoleDTO): Promise<UserRole> {
    const userRole = await this.repository.findById(id);
    if (!userRole) {
      throw new Error('User role assignment not found');
    }

    return this.repository.update(id, dto);
  }
}

/**
 * Delete user-role assignment permanently
 */
export class DeleteUserRoleUseCase {
  constructor(private repository: IUserRoleRepository) {}

  async execute(id: string): Promise<void> {
    const userRole = await this.repository.findById(id);
    if (!userRole) {
      throw new Error('User role assignment not found');
    }

    return this.repository.delete(id);
  }
}

/**
 * Reactivate a revoked assignment
 */
export class ReactivateUserRoleUseCase {
  constructor(private repository: IUserRoleRepository) {}

  async execute(id: string): Promise<UserRole> {
    const userRole = await this.repository.findById(id);
    if (!userRole) {
      throw new Error('User role assignment not found');
    }

    if (!userRole.isRevoked()) {
      throw new Error('This assignment is not revoked');
    }

    return this.repository.reactivate(id);
  }
}
