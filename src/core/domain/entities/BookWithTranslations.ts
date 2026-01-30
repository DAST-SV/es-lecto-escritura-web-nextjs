// src/core/domain/entities/BookWithTranslations.ts

export type BookStatus = 'draft' | 'pending' | 'published' | 'archived';
export type DifficultyLevel = 'beginner' | 'elementary' | 'intermediate' | 'advanced';

export interface BookTranslation {
  title: string;
  subtitle: string | null;
  description: string | null;
  summary: string | null;
  isPrimary: boolean;
}

export interface AuthorTranslation {
  name: string;
  bio: string | null;
}

export interface BookAuthor {
  id: string;
  slug: string;
  avatarUrl: string | null;
  role: string;
  translations: Record<string, AuthorTranslation>;
}

export interface CategoryTranslationSimple {
  name: string;
  description: string | null;
}

export interface BookWithTranslations {
  id: string;
  slug: string;
  coverUrl: string | null;
  difficulty: DifficultyLevel;
  status: BookStatus;
  estimatedReadTime: number;
  pageCount: number;
  isFeatured: boolean;
  isPremium: boolean;
  publishedAt: string | null;
  createdAt: string;
  createdBy: string | null;
  categoryId: string;
  categorySlug: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  translations: Record<string, BookTranslation>;
  categoryTranslations: Record<string, CategoryTranslationSimple>;
  authors: BookAuthor[];
}

export interface BookByLanguage {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  summary: string | null;
  coverUrl: string | null;
  difficulty: DifficultyLevel;
  status: BookStatus;
  estimatedReadTime: number;
  pageCount: number;
  isFeatured: boolean;
  isPremium: boolean;
  categoryId: string;
  categoryName: string;
  publishedAt: string | null;
}

export interface BookListItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  coverUrl: string | null;
  difficulty: DifficultyLevel;
  estimatedReadTime: number;
  pageCount: number;
  isFeatured: boolean;
  isPremium: boolean;
  publishedAt: string | null;
}

export interface BookSearchResult extends BookListItem {
  categorySlug: string;
  categoryName: string;
  relevance: number;
}
