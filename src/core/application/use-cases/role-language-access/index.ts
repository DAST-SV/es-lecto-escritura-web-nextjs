// ============================================
// src/core/application/use-cases/role-language-access/index.ts
// Use Cases: Role Language Access
// ============================================

import {
  IRoleLanguageAccessRepository,
  CreateRoleLanguageAccessDTO,
  UpdateRoleLanguageAccessDTO,
} from '@/src/core/domain/repositories/IRoleLanguageAccessRepository';
import { RoleLanguageAccess, LanguageCode } from '@/src/core/domain/entities/RoleLanguageAccess';

/**
 * Get all role language access records
 */
export class GetAllRoleLanguageAccess {
  constructor(private repository: IRoleLanguageAccessRepository) {}

  async execute(includeInactive = false): Promise<RoleLanguageAccess[]> {
    return this.repository.findAll(includeInactive);
  }
}

/**
 * Get a role language access by ID
 */
export class GetRoleLanguageAccessById {
  constructor(private repository: IRoleLanguageAccessRepository) {}

  async execute(id: string): Promise<RoleLanguageAccess | null> {
    if (!id?.trim()) {
      throw new Error('ID is required');
    }
    return this.repository.findById(id);
  }
}

/**
 * Get all language access for a specific role
 */
export class GetRoleLanguageAccessByRole {
  constructor(private repository: IRoleLanguageAccessRepository) {}

  async execute(roleName: string): Promise<RoleLanguageAccess[]> {
    if (!roleName?.trim()) {
      throw new Error('Role name is required');
    }
    return this.repository.findByRole(roleName);
  }
}

/**
 * Get all roles that have access to a specific language
 */
export class GetRoleLanguageAccessByLanguage {
  constructor(private repository: IRoleLanguageAccessRepository) {}

  async execute(languageCode: LanguageCode): Promise<RoleLanguageAccess[]> {
    if (!languageCode) {
      throw new Error('Language code is required');
    }
    return this.repository.findByLanguage(languageCode);
  }
}

/**
 * Get active languages for a role
 */
export class GetActiveLanguagesForRole {
  constructor(private repository: IRoleLanguageAccessRepository) {}

  async execute(roleName: string): Promise<LanguageCode[]> {
    if (!roleName?.trim()) {
      throw new Error('Role name is required');
    }
    return this.repository.getActiveLanguagesForRole(roleName);
  }
}

/**
 * Check if a role has access to a language
 */
export class CheckRoleLanguageAccess {
  constructor(private repository: IRoleLanguageAccessRepository) {}

  async execute(roleName: string, languageCode: LanguageCode): Promise<boolean> {
    if (!roleName?.trim()) {
      throw new Error('Role name is required');
    }
    if (!languageCode) {
      throw new Error('Language code is required');
    }
    return this.repository.hasAccess(roleName, languageCode);
  }
}

/**
 * Create a new role language access
 */
export class CreateRoleLanguageAccess {
  constructor(private repository: IRoleLanguageAccessRepository) {}

  async execute(dto: CreateRoleLanguageAccessDTO): Promise<RoleLanguageAccess> {
    // Validation
    if (!dto.roleName?.trim()) {
      throw new Error('Role name is required');
    }
    if (!dto.languageCode) {
      throw new Error('Language code is required');
    }
    if (!dto.createdBy?.trim()) {
      throw new Error('Created by user ID is required');
    }

    // Check if already exists
    const existing = await this.repository.findByRoleAndLanguage(dto.roleName, dto.languageCode);
    if (existing) {
      throw new Error(`Role ${dto.roleName} already has access to ${dto.languageCode}`);
    }

    return this.repository.create(dto);
  }
}

/**
 * Update a role language access
 */
export class UpdateRoleLanguageAccess {
  constructor(private repository: IRoleLanguageAccessRepository) {}

  async execute(id: string, dto: UpdateRoleLanguageAccessDTO): Promise<RoleLanguageAccess> {
    if (!id?.trim()) {
      throw new Error('ID is required');
    }

    // Check if exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Role language access not found');
    }

    return this.repository.update(id, dto);
  }
}

/**
 * Delete a role language access
 */
export class DeleteRoleLanguageAccess {
  constructor(private repository: IRoleLanguageAccessRepository) {}

  async execute(id: string): Promise<void> {
    if (!id?.trim()) {
      throw new Error('ID is required');
    }

    // Check if exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Role language access not found');
    }

    // Check if can be deleted
    if (!existing.canBeDeleted()) {
      throw new Error('Cannot delete language access for super_admin role');
    }

    return this.repository.delete(id);
  }
}

/**
 * Grant multiple languages to a role at once
 */
export class GrantLanguagesToRole {
  constructor(private repository: IRoleLanguageAccessRepository) {}

  async execute(roleName: string, languageCodes: LanguageCode[], createdBy: string): Promise<RoleLanguageAccess[]> {
    if (!roleName?.trim()) {
      throw new Error('Role name is required');
    }
    if (!languageCodes?.length) {
      throw new Error('At least one language code is required');
    }
    if (!createdBy?.trim()) {
      throw new Error('Created by user ID is required');
    }

    // Filter out already granted languages
    const existingAccess = await this.repository.findByRole(roleName);
    const existingCodes = existingAccess.map((a) => a.languageCode);
    const newCodes = languageCodes.filter((code) => !existingCodes.includes(code));

    if (newCodes.length === 0) {
      throw new Error('All specified languages are already granted to this role');
    }

    return this.repository.grantLanguages(roleName, newCodes, createdBy);
  }
}

/**
 * Revoke all languages from a role
 */
export class RevokeAllLanguagesFromRole {
  constructor(private repository: IRoleLanguageAccessRepository) {}

  async execute(roleName: string): Promise<void> {
    if (!roleName?.trim()) {
      throw new Error('Role name is required');
    }

    // Don't allow revoking all languages from super_admin
    if (roleName === 'super_admin') {
      throw new Error('Cannot revoke all languages from super_admin role');
    }

    return this.repository.revokeAllLanguages(roleName);
  }
}

/**
 * Activate a role language access
 */
export class ActivateRoleLanguageAccess {
  constructor(private repository: IRoleLanguageAccessRepository) {}

  async execute(id: string): Promise<void> {
    if (!id?.trim()) {
      throw new Error('ID is required');
    }

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Role language access not found');
    }

    return this.repository.activate(id);
  }
}

/**
 * Deactivate a role language access
 */
export class DeactivateRoleLanguageAccess {
  constructor(private repository: IRoleLanguageAccessRepository) {}

  async execute(id: string): Promise<void> {
    if (!id?.trim()) {
      throw new Error('ID is required');
    }

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Role language access not found');
    }

    // Don't allow deactivating super_admin language access
    if (existing.roleName === 'super_admin') {
      throw new Error('Cannot deactivate language access for super_admin role');
    }

    return this.repository.deactivate(id);
  }
}
