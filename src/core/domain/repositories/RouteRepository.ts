// ============================================
// src/core/domain/repositories/RouteRepository.ts
// Repositorio: Rutas
// ============================================

import { Route, RouteTranslation } from '../entities/Route';

export interface CreateRouteDTO {
  pathname: string;
  displayName: string;
  description: string | null;
  icon: string | null;
  isPublic: boolean;
  requiresPermissions: string[];
  requiresAllPermissions: boolean;
  showInMenu: boolean;
  menuOrder: number;
  parentRouteId: string | null;
  translations: RouteTranslation[];
}

export interface UpdateRouteDTO {
  pathname?: string;
  displayName?: string;
  description?: string | null;
  icon?: string | null;
  isPublic?: boolean;
  requiresPermissions?: string[];
  requiresAllPermissions?: boolean;
  showInMenu?: boolean;
  menuOrder?: number;
  parentRouteId?: string | null;
  translations?: RouteTranslation[];
}

export interface RouteRepository {
  findAll(): Promise<Route[]>;
  findById(id: string): Promise<Route | null>;
  findByPathname(pathname: string): Promise<Route | null>;
  create(dto: CreateRouteDTO): Promise<Route>;
  update(id: string, dto: UpdateRouteDTO): Promise<Route>;
  delete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
}