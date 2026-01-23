// ============================================
// src/core/domain/repositories/IRoleLanguageAccessRepository.ts
// Repository Interface: Role Language Access
// ============================================

import { RoleLanguageAccess, LanguageCode } from '../entities/RoleLanguageAccess';

export interface CreateRoleLanguageAccessDTO {
  roleName: string;
  languageCode: LanguageCode;
  createdBy: string;
}

export interface UpdateRoleLanguageAccessDTO {
  isActive?: boolean;
}

export interface IRoleLanguageAccessRepository {
  /**
   * Get all role language access records
   */
  findAll(includeInactive?: boolean): Promise<RoleLanguageAccess[]>;

  /**
   * Get a role language access by ID
   */
  findById(id: string): Promise<RoleLanguageAccess | null>;

  /**
   * Get all language access for a specific role
   */
  findByRole(roleName: string): Promise<RoleLanguageAccess[]>;

  /**
   * Get all roles that have access to a specific language
   */
  findByLanguage(languageCode: LanguageCode): Promise<RoleLanguageAccess[]>;

  /**
   * Get a specific role-language combination
   */
  findByRoleAndLanguage(roleName: string, languageCode: LanguageCode): Promise<RoleLanguageAccess | null>;

  /**
   * Get all active languages for a role
   */
  getActiveLanguagesForRole(roleName: string): Promise<LanguageCode[]>;

  /**
   * Check if a role has access to a language
   */
  hasAccess(roleName: string, languageCode: LanguageCode): Promise<boolean>;

  /**
   * Create a new role language access
   */
  create(dto: CreateRoleLanguageAccessDTO): Promise<RoleLanguageAccess>;

  /**
   * Update a role language access
   */
  update(id: string, dto: UpdateRoleLanguageAccessDTO): Promise<RoleLanguageAccess>;

  /**
   * Delete a role language access
   */
  delete(id: string): Promise<void>;

  /**
   * Activate a role language access
   */
  activate(id: string): Promise<void>;

  /**
   * Deactivate a role language access
   */
  deactivate(id: string): Promise<void>;

  /**
   * Grant multiple languages to a role at once
   */
  grantLanguages(roleName: string, languageCodes: LanguageCode[], createdBy: string): Promise<RoleLanguageAccess[]>;

  /**
   * Revoke all languages from a role
   */
  revokeAllLanguages(roleName: string): Promise<void>;
}
