// ============================================
// src/core/application/use-cases/roles/index.ts
// Use Cases: Role Management
// ============================================

import { IRoleRepository, CreateRoleDTO, UpdateRoleDTO } from '@/src/core/domain/repositories/IRoleRepository';
import { Role } from '@/src/core/domain/entities/Role';

/**
 * Get all roles
 */
export class GetAllRolesUseCase {
  constructor(private repository: IRoleRepository) {}

  async execute(includeInactive: boolean = false): Promise<Role[]> {
    return this.repository.findAll(includeInactive);
  }
}

/**
 * Get role by ID
 */
export class GetRoleByIdUseCase {
  constructor(private repository: IRoleRepository) {}

  async execute(id: string): Promise<Role | null> {
    return this.repository.findById(id);
  }
}

/**
 * Get role by name
 */
export class GetRoleByNameUseCase {
  constructor(private repository: IRoleRepository) {}

  async execute(name: string): Promise<Role | null> {
    return this.repository.findByName(name);
  }
}

/**
 * Get system roles
 */
export class GetSystemRolesUseCase {
  constructor(private repository: IRoleRepository) {}

  async execute(): Promise<Role[]> {
    return this.repository.findSystemRoles();
  }
}

/**
 * Create new role
 */
export class CreateRoleUseCase {
  constructor(private repository: IRoleRepository) {}

  async execute(dto: CreateRoleDTO): Promise<Role> {
    // Validate name is lowercase
    if (dto.name !== dto.name.toLowerCase()) {
      throw new Error('Role name must be lowercase');
    }

    // Check if role with same name already exists
    const existing = await this.repository.findByName(dto.name);
    if (existing) {
      throw new Error(`Role with name "${dto.name}" already exists`);
    }

    return this.repository.create(dto);
  }
}

/**
 * Update existing role
 */
export class UpdateRoleUseCase {
  constructor(private repository: IRoleRepository) {}

  async execute(id: string, dto: UpdateRoleDTO, updatedBy: string): Promise<Role> {
    const role = await this.repository.findById(id);
    if (!role) {
      throw new Error('Role not found');
    }

    // Prevent updating system roles in certain ways
    if (role.isSystemRole && dto.isActive === false) {
      throw new Error('Cannot deactivate system role');
    }

    return this.repository.update(id, dto, updatedBy);
  }
}

/**
 * Delete role (only non-system roles)
 */
export class DeleteRoleUseCase {
  constructor(private repository: IRoleRepository) {}

  async execute(id: string): Promise<void> {
    const role = await this.repository.findById(id);
    if (!role) {
      throw new Error('Role not found');
    }

    if (role.isSystemRole) {
      throw new Error('Cannot delete system role');
    }

    return this.repository.delete(id);
  }
}

/**
 * Deactivate role
 */
export class DeactivateRoleUseCase {
  constructor(private repository: IRoleRepository) {}

  async execute(id: string): Promise<void> {
    const role = await this.repository.findById(id);
    if (!role) {
      throw new Error('Role not found');
    }

    if (role.isSystemRole) {
      throw new Error('Cannot deactivate system role');
    }

    return this.repository.deactivate(id);
  }
}

/**
 * Activate role
 */
export class ActivateRoleUseCase {
  constructor(private repository: IRoleRepository) {}

  async execute(id: string): Promise<void> {
    return this.repository.activate(id);
  }
}
