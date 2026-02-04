// ============================================
// src/core/domain/repositories/IBookRatingRepository2.ts
// Interface del repositorio de calificaciones
// ============================================

import { BookRatingEntity } from '../entities/BookRatingEntity';

export interface CreateBookRatingDTO {
  bookId: string;
  userId: string;
  rating: number;
}

export interface UpdateBookRatingDTO {
  rating: number;
}

export interface BookRatingStats {
  bookId: string;
  averageRating: number;
  totalRatings: number;
  distribution: { [key: number]: number };
}

export interface IBookRatingRepository2 {
  findAll(): Promise<BookRatingEntity[]>;
  findById(id: string): Promise<BookRatingEntity | null>;
  findByBookId(bookId: string): Promise<BookRatingEntity[]>;
  findByUserId(userId: string): Promise<BookRatingEntity[]>;
  findByBookAndUser(bookId: string, userId: string): Promise<BookRatingEntity | null>;
  getBookStats(bookId: string): Promise<BookRatingStats>;
  create(data: CreateBookRatingDTO): Promise<BookRatingEntity>;
  update(id: string, data: UpdateBookRatingDTO): Promise<BookRatingEntity>;
  upsert(data: CreateBookRatingDTO): Promise<BookRatingEntity>;
  delete(id: string): Promise<void>;
}
