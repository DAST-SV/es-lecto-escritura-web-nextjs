// src/core/domain/entities/BookCategory.ts

export interface CategoryTranslation {
  name: string;
  description: string | null;
}

export interface BookCategory {
  id: string;
  slug: string;
  icon: string | null;
  color: string | null;
  orderIndex: number;
  isActive: boolean;
  translations: Record<string, CategoryTranslation>;
  publishedBookCount: number;
  totalBookCount: number;
}

export interface CategoryByLanguage {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  orderIndex: number;
  bookCount: number;
}
