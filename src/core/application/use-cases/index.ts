// ============================================
// src/core/application/use-cases/index.ts
// ✅ ÚNICO BARREL EXPORT DE CASOS DE USO
// ============================================

// Auth
export * from './auth';

// Permisos
export { CheckRouteAccessUseCase } from './CheckRouteAccessUseCase';
export { GetUserPermissionsUseCase } from './GetUserPermissionsUseCase';
export { TranslateRoute } from './navigation/TranslateRoute';

// Traducciones
export * from './translations';