// ============================================
// src/infrastructure/repositories/index.ts
// ✅ ÚNICO BARREL EXPORT DE IMPLEMENTACIONES
// ✅ ORGANIZADO: Todos los repositorios en carpetas por dominio
// ============================================

// Auth
export { SupabaseAuthRepository } from './auth/SupabaseAuthRepository';

// Permisos y Roles
export { SupabasePermissionRepository } from './permissions/SupabasePermissionRepository';
export { RoleRepository } from './roles/RoleRepository';

// Traducciones
export { SupabaseTranslationRepository } from './translations/SupabaseTranslationRepository';
export { SupabaseTranslationKeyRepository } from './translations/SupabaseTranslationKeyRepository';

// Rutas
export { RoutesRepository } from './routes/RoutesRepository';

// Organization Members
export { OrganizationMemberRepository } from './organization-members/OrganizationMemberRepository';

// User Profiles
export { UserProfileRepository } from './user-profiles/UserProfileRepository';

// User Relationships
export { UserRelationshipRepository } from './user-relationships/UserRelationshipRepository';