// ============================================
// src/core/domain/repositories/IBookRepository.ts
// Repository Interface: Books
// ============================================

import { Book } from '../entities';
import { BookMetadata, Page } from '../types';

export interface CreateBookDTO {
  metadata: BookMetadata;
  userId: string;
  pdfUrl: string;
  pages: Page[];
}

export interface UpdateBookDTO {
  metadata?: Partial<BookMetadata>;
  pdfUrl?: string;
  pages?: Page[];
  deletedAt?: Date | null;
}

export interface BookFilterDTO {
  userId?: string;
  categories?: number[];
  genres?: number[];
  searchTerm?: string;
  includeDeleted?: boolean;
}

export interface IBookRepository {
  /**
   * Save a new book
   * @returns The ID of the created book
   */
  save(book: Book): Promise<string>;

  /**
   * Find a book by ID
   */
  findById(id: string): Promise<Book | null>;

  /**
   * Find all books for a specific user
   */
  findByUserId(userId: string): Promise<Book[]>;

  /**
   * Find books with filters
   */
  findWithFilters(filters: BookFilterDTO): Promise<Book[]>;

  /**
   * Find deleted books (trash)
   */
  findDeleted(userId: string): Promise<Book[]>;

  /**
   * Update an existing book
   */
  update(book: Book): Promise<void>;

  /**
   * Update book with DTO
   */
  updateWithDTO(id: string, dto: UpdateBookDTO): Promise<Book>;

  /**
   * Soft delete a book (move to trash)
   */
  delete(id: string): Promise<void>;

  /**
   * Permanently delete a book
   */
  permanentDelete(id: string): Promise<void>;

  /**
   * Restore a deleted book
   */
  restore(id: string): Promise<void>;

  /**
   * Get total count of books for a user
   */
  countByUserId(userId: string): Promise<number>;
}
