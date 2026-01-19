// ============================================
// src/core/domain/repositories/index.ts
// ✅ ÚNICO BARREL EXPORT DE REPOSITORIOS
// ============================================

// Auth
export * from './IAuthRepository';

// Permisos
export * from './IPermissionRepository';

// Traducciones
export * from './ITranslationRepository';
export * from './TranslationKeyRepository';

// Dominio principal (si existe)
export * from './IBookRepository';
// Tipos de usuario
export * from './IUserTypeRepository';