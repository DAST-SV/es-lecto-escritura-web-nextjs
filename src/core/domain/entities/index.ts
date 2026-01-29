// ============================================
// src/core/domain/entities/index.ts
// ✅ ÚNICO BARREL EXPORT DEL DOMINIO
// ============================================

// Permisos y RBAC
// Export only non-conflicting items from Permission
export { UserPermissions, isValidLanguageCode, getLanguageName, getLanguageFlag } from './Permission';
export type { PermissionType, LanguageCode } from './Permission';
export * from './Role';
export * from './UserRole';
export * from './RoutePermission';
export * from './UserRoutePermission';
// Export RoleLanguageAccess class but not LanguageCode type (already exported from Permission)
export { RoleLanguageAccess } from './RoleLanguageAccess';

// Traducciones
export * from './Translation';
export * from './TranslationKey';
export * from './Language';
export * from './TranslationNamespace';

// Dominio principal (si existe)
export * from './Book';

export * from './NavigationItem';

// Organizaciones y miembros
export * from './OrganizationMember';

// Relaciones entre usuarios
export * from './UserRelationship';

// Sistema de libros extendido
export * from './BookTranslation';
export * from './BookCollaborator';
export * from './AuthorProfile';
export * from './Community';
export * from './BookReview';