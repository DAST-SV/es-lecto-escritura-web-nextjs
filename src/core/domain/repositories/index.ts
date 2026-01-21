// ============================================
// Ruta: src/core/domain/repositories/index.ts
// Descripción: Barrel export de todas las interfaces de repositorios
// ============================================

// Languages
export type { 
  ILanguageRepository, 
  CreateLanguageDTO, 
  UpdateLanguageDTO 
} from './ILanguageRepository';

// Translation Namespaces
export type { 
  ITranslationNamespaceRepository, 
  CreateTranslationNamespaceDTO, 
  UpdateTranslationNamespaceDTO 
} from './ITranslationNamespaceRepository';

// Translation Categories
export type { 
  ITranslationCategoryRepository, 
  CreateTranslationCategoryDTO, 
  UpdateTranslationCategoryDTO 
} from './ITranslationCategoryRepository';

// Translation Keys
export type { 
  ITranslationKeyRepository, 
  CreateTranslationKeyDTO, 
  UpdateTranslationKeyDTO 
} from './ITranslationKeyRepository';

// Translations
export type { 
  ITranslationRepository, 
  CreateTranslationDTO, 
  BulkCreateTranslationDTO, 
  UpdateTranslationDTO 
} from './ITranslationRepository';