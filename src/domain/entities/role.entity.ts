// ============================================
// CAPA: DOMAIN
// Ubicación: src/domain/entities/role.entity.ts
// Propósito: Entidad de dominio que representa un rol
// Dependencias: Ninguna (capa más interna)
// ============================================

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  hierarchyLevel: number;
  isActive: boolean;
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface RoleLanguageAccess {
  id: string;
  roleName: string;
  languageCode: LanguageCode;
  isActive: boolean;
  createdAt: Date;
}

export type LanguageCode = 'es' | 'en' | 'fr' | 'it';