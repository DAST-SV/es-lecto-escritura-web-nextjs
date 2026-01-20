// ============================================
// src/core/domain/entities/index.ts
// ✅ ÚNICO BARREL EXPORT DEL DOMINIO
// ============================================

// Permisos y RBAC
export * from './Permission';
export * from './Role';
export * from './UserRole';

// Traducciones
export * from './Translation';
export * from './TranslationKey';

// Dominio principal (si existe)
export * from './Book';

export * from './NavigationItem';

// Organizaciones y miembros
export * from './OrganizationMember';

// Relaciones entre usuarios
export * from './UserRelationship';