/**
 * ============================================
 * INTERFAZ: IBookPageRepository
 * Repositorio para páginas de libros
 * ============================================
 */

import { BookPage } from '../entities/BookPage';
import { Page, AccessType } from '../types';

export interface CreateBookPageDTO {
  bookId: string;
  pageNumber: number;
  layout: string;
  animation?: string;
  title?: string;
  content?: string;
  imageUrl?: string;
  audioUrl?: string;
  interactiveGame?: string;
  items?: Record<string, unknown>[];
  backgroundUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  font?: string;
  borderStyle?: string;
  accessLevel?: AccessType;
}

export interface UpdateBookPageDTO {
  layout?: string;
  animation?: string;
  title?: string;
  content?: string;
  imageUrl?: string;
  audioUrl?: string;
  interactiveGame?: string;
  items?: Record<string, unknown>[];
  backgroundUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  font?: string;
  borderStyle?: string;
  accessLevel?: AccessType;
}

export interface IBookPageRepository {
  // CRUD
  findById(id: string): Promise<BookPage | null>;
  findByBookId(bookId: string): Promise<BookPage[]>;
  findByBookIdAndPageNumber(bookId: string, pageNumber: number): Promise<BookPage | null>;
  create(dto: CreateBookPageDTO): Promise<BookPage>;
  update(id: string, dto: UpdateBookPageDTO): Promise<BookPage>;
  delete(id: string): Promise<void>;

  // Operaciones en lote
  createMany(bookId: string, pages: Page[]): Promise<BookPage[]>;
  updateMany(bookId: string, pages: Page[]): Promise<BookPage[]>;
  deleteByBookId(bookId: string): Promise<void>;
  replaceAllPages(bookId: string, pages: Page[]): Promise<BookPage[]>;

  // Consultas
  getPageCount(bookId: string): Promise<number>;
  getPagesInRange(bookId: string, fromPage: number, toPage: number): Promise<BookPage[]>;
  getFirstPage(bookId: string): Promise<BookPage | null>;
  getLastPage(bookId: string): Promise<BookPage | null>;

  // Reordenamiento
  reorderPages(bookId: string, pageOrders: { pageId: string; newOrder: number }[]): Promise<void>;
  movePage(bookId: string, pageId: string, newPosition: number): Promise<void>;

  // Acceso
  getAccessiblePages(bookId: string, userAccessLevel: AccessType | null): Promise<BookPage[]>;
  getFreePages(bookId: string): Promise<BookPage[]>;
}
