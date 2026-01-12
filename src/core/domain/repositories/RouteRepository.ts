// ============================================
// src/core/domain/repositories/RouteRepository.ts
// ============================================

import { Route, RouteTranslation } from '../entities/Route';

export interface CreateRouteDTO {
  pathname: string;
  displayName: string;
  description?: string;
  translations?: {
    languageCode: string;
    translatedPath: string;
    translatedName: string;
  }[];
}

export interface UpdateRouteDTO {
  pathname?: string;
  displayName?: string;
  description?: string;
  isActive?: boolean;
  translations?: {
    languageCode: string;
    translatedPath: string;
    translatedName: string;
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