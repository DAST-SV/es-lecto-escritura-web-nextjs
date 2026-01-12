// ============================================
// src/core/domain/repositories/RouteRepository.ts
// ✅ Interface del repositorio de rutas con isActive
// ============================================

import { Route, RouteTranslation } from '@/src/core/domain/entities/Route';

export interface CreateRouteDTO {
  pathname: string;
  displayName: string;
  description?: string;
  icon?: string;
  isPublic?: boolean;
  requiresPermissions?: string[];
  requiresAllPermissions?: boolean;
  showInMenu?: boolean;
  menuOrder?: number;
  parentRouteId?: string;
  translations?: {
    languageCode: string;
    translatedPath: string;
    translatedName: string;
    translatedDescription?: string;
  }[];
}

export interface UpdateRouteDTO {
  pathname?: string;
  displayName?: string;
  description?: string;
  icon?: string;
  isPublic?: boolean;
  requiresPermissions?: string[];
  requiresAllPermissions?: boolean;
  showInMenu?: boolean;
  menuOrder?: number;
  parentRouteId?: string;
  isActive?: boolean; // ✅ AGREGADO
  translations?: {
    languageCode: string;
    translatedPath: string;
    translatedName: string;
    translatedDescription?: string;
  }[];
}

export interface RouteRepository {
  findAll(): Promise<Route[]>;
  findById(id: string): Promise<Route | null>;
  findByPathname(pathname: string): Promise<Route | null>;
  findActive(): Promise<Route[]>;
  create(dto: CreateRouteDTO): Promise<Route>;
  update(id: string, dto: UpdateRouteDTO): Promise<Route>;
  delete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
}