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

// Organization Members
export { OrganizationMemberRepository } from './organization-members/OrganizationMemberRepository';

// User Profiles (will be added by agent)
// export { UserProfileRepository } from './user-profiles/UserProfileRepository';

// User Relationships (will be added by agent)
// export { UserRelationshipRepository } from './user-relationships/UserRelationshipRepository';

// Role Language Access (will be added by agent)
// export { RoleLanguageAccessRepository } from './role-language-access/RoleLanguageAccessRepository';