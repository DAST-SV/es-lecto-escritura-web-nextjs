// ============================================
// src/core/domain/entities/index.ts
// ✅ ÚNICO BARREL EXPORT DEL DOMINIO
// ============================================

// Permisos y RBAC (TODO EN Permission.ts)
export * from './Permission';

// Traducciones
export * from './Translation';
export * from './TranslationKey';

// Dominio principal (si existe)
export * from './Book';

export * from './NavigationItem';