// ============================================
// src/core/domain/repositories/RouteUserExclusionRepository.ts
// ============================================

import { RouteUserExclusion } from '../entities/RouteUserExclusion';

export interface CreateRouteUserExclusionDTO {
  userId: string;
  routeId: string;
  reason?: string;
  expiresAt?: Date;
  createdBy?: string;
}

export interface RouteUserExclusionRepository {
  findAll(): Promise<RouteUserExclusion[]>;
  findByUser(userId: string): Promise<RouteUserExclusion[]>;
  findByRoute(routeId: string): Promise<RouteUserExclusion[]>;
  findActive(userId: string, routeId: string): Promise<RouteUserExclusion | null>;
  create(dto: CreateRouteUserExclusionDTO): Promise<RouteUserExclusion>;
  delete(userId: string, routeId: string): Promise<void>;
}