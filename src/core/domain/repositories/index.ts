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

// Traducciones
export * from './ITranslationRepository';
export * from './TranslationKeyRepository';

// Dominio principal (si existe)
export * from './IBookRepository';
// Tipos de usuario
export * from './IUserTypeRepository';

// Organizaciones y miembros
export * from './IOrganizationMemberRepository';

// Relaciones entre usuarios
export * from './IUserRelationshipRepository';