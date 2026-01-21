// ============================================
// src/infrastructure/repositories/index.ts
// ✅ ÚNICO BARREL EXPORT DE IMPLEMENTACIONES
// ============================================

// Auth
export { SupabaseAuthRepository } from './auth/SupabaseAuthRepository';

// Permisos y Roles
export { SupabasePermissionRepository } from './permissions/SupabasePermissionRepository';
export { RoleRepository } from './roles/RoleRepository';
export { UserRoleRepository } from './user-roles/UserRoleRepository';
export { RoutePermissionRepository } from './route-permissions/RoutePermissionRepository';
export { UserRoutePermissionRepository } from './user-route-permissions/UserRoutePermissionRepository';
export { RoleLanguageAccessRepository } from './role-language-access/RoleLanguageAccessRepository';

// Traducciones
export { SupabaseTranslationRepository } from './translations/SupabaseTranslationRepository';
export { SupabaseTranslationKeyRepository } from './translations/SupabaseTranslationKeyRepository';

// Languages
export { LanguageRepository } from './languages/LanguageRepository';

// Translation Namespaces
export { TranslationNamespaceRepository } from './translation-namespaces/TranslationNamespaceRepository';

// Translation Categories
export { TranslationCategoryRepository } from './translation-categories/TranslationCategoryRepository';

// Rutas
export { RoutesRepository } from './routes/RoutesRepository';

// Organization Members
export { OrganizationMemberRepository } from './organization-members/OrganizationMemberRepository';

// User Profiles
export { UserProfileRepository } from './user-profiles/UserProfileRepository';

// User Relationships
export { UserRelationshipRepository } from './user-relationships/UserRelationshipRepository';

// Books
export { BookRepository } from './books/BookRepository';

// Organizations
export { SupabaseOrganizationRepository } from './organizations/OrganizationRepository';

// User Types
export { SupabaseUserTypeRepository } from './user-types/UserTypeRepository';