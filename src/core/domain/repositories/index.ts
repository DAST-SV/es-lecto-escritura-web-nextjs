// ============================================
// src/core/domain/repositories/index.ts
// ✅ ÚNICO BARREL EXPORT DE REPOSITORIOS
// ============================================

// Auth
export * from './IAuthRepository';

// Permisos y Roles
export * from './IPermissionRepository';
export * from './IRoleRepository';
export * from './IUserRoleRepository';
export * from './IRoutePermissionRepository';
export * from './IUserRoutePermissionRepository';
export * from './IRoleLanguageAccessRepository';

// Traducciones
export * from './ITranslationRepository';
export * from './ITranslationKeyRepository';

// Dominio principal (si existe)
export * from './IBookRepository';
// Tipos de usuario
export * from './IUserTypeRepository';

// Organizaciones y miembros
export * from './IOrganizationRepository';
export * from './IOrganizationMemberRepository';

// Perfiles y relaciones entre usuarios
export * from './IUserProfileRepository';
export * from './IUserRelationshipRepository';