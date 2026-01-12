// ============================================
// src/core/domain/repositories/RouteAccessRepository.ts
// ============================================

export interface AccessibleRoute {
  routeId: string;
  pathname: string;
  translatedPath: string;
  displayName: string;
}

export interface RouteAccessRepository {
  canAccessRoute(userId: string | null, pathname: string): Promise<boolean>;
  getAccessibleRoutes(userId: string | null, languageCode: string): Promise<AccessibleRoute[]>;
}