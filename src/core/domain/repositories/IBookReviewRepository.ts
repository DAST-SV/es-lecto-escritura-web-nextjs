// ============================================
// src/core/domain/repositories/IBookReviewRepository.ts
// Interface del repositorio de reseñas
// ============================================

import { BookReviewEntity } from '../entities/BookReviewEntity';

export interface CreateBookReviewDTO {
  bookId: string;
  userId: string;
  title?: string | null;
  content: string;
}

export interface UpdateBookReviewDTO {
  title?: string | null;
  content?: string;
  isApproved?: boolean;
  isFeatured?: boolean;
}

export interface IBookReviewRepository {
  findAll(includeDeleted?: boolean): Promise<BookReviewEntity[]>;
  findById(id: string): Promise<BookReviewEntity | null>;
  findByBookId(bookId: string): Promise<BookReviewEntity[]>;
  findByUserId(userId: string): Promise<BookReviewEntity[]>;
  create(data: CreateBookReviewDTO): Promise<BookReviewEntity>;
  update(id: string, data: UpdateBookReviewDTO): Promise<BookReviewEntity>;
  approve(id: string): Promise<void>;
  reject(id: string): Promise<void>;
  feature(id: string): Promise<void>;
  unfeature(id: string): Promise<void>;
  incrementHelpful(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
}
