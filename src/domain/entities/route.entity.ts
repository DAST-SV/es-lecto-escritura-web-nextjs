// ============================================
// CAPA: DOMAIN
// Ubicación: src/domain/entities/route.entity.ts
// Propósito: Entidad de dominio que representa una ruta
// Dependencias: Ninguna (capa más interna)
// ============================================

export interface Route {
  id: string;
  pathname: string;
  displayName: string;
  description?: string;
  icon?: string;
  showInMenu: boolean;
  menuOrder: number;
  parentRouteId?: string;
  isActive: boolean;
  isPublic: boolean;
  requiresVerification: boolean;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface RouteTranslation {
  id: string;
  routeId: string;
  languageCode: LanguageCode;
  translatedPath: string;
  translatedName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export type LanguageCode = 'es' | 'en' | 'fr' | 'it';

export interface RoutePermission {
  id: string;
  roleName: string;
  routeId: string;
  isActive: boolean;
  createdAt: Date;
}

export interface UserRoutePermission {
  id: string;
  userId: string;
  routeId: string;
  permissionType: 'grant' | 'deny';
  reason?: string;
  isActive: boolean;
  expiresAt?: Date;
  grantedBy?: string;
  createdAt: Date;
}