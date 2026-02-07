/**
 * ============================================
 * TIPOS: Library Feature
 * Tipos para la pagina de Biblioteca
 * ============================================
 */

import { BookExtended } from '@/src/core/domain/entities/BookExtended';

export interface CarouselRowData {
  id: string;
  title: string;
  icon?: React.ReactNode;
  books: BookExtended[];
  isLoading: boolean;
  showRanking?: boolean;
  viewAllHref?: string;
}

export interface CategoryPillData {
  id: string;
  slug: string;
  name: string;
  bookCount: number;
}
