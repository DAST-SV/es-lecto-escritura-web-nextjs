////////////////////////////////////////////////////////////
/// src/core/domain/entities/Translation.ts
////////////////////////////////////////////////////////////
// Entidad de dominio: Translation
export interface Translation {
  id: string;
  namespaceSlug: string;
  translationKey: string;
  languageCode: string;
  value: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flagEmoji: string;
  isDefault: boolean;
  isActive: boolean;
  orderIndex: number;
}

export interface TranslationNamespace {
  id: string;
  slug: string;
  name: string;
  description?: string;
  isActive: boolean;
}