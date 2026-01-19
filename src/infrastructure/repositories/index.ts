// ============================================
// src/infrastructure/repositories/index.ts
// ✅ ÚNICO BARREL EXPORT DE IMPLEMENTACIONES
// ✅ ORGANIZADO: Todos los repositorios en carpetas por dominio
// ============================================

// Auth
export { SupabaseAuthRepository } from './auth/SupabaseAuthRepository';

// Permisos
export { SupabasePermissionRepository } from './permissions/SupabasePermissionRepository';

// Traducciones
export { SupabaseTranslationRepository } from './translations/SupabaseTranslationRepository';
export { SupabaseTranslationKeyRepository } from './translations/SupabaseTranslationKeyRepository';

// Rutas
export { RoutesRepository } from './routes/RoutesRepository';