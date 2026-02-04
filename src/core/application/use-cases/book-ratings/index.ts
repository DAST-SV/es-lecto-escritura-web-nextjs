// ============================================
// src/core/application/use-cases/book-ratings/index.ts
// Casos de uso para calificaciones de libros
// ============================================

import { BookRatingRepository } from '@/src/infrastructure/repositories/book-ratings/BookRatingRepository';
import { BookRatingEntity } from '@/src/core/domain/entities/BookRatingEntity';
import { CreateBookRatingDTO, UpdateBookRatingDTO, BookRatingStats } from '@/src/core/domain/repositories/IBookRatingRepository2';

const repository = new BookRatingRepository();

export async function getAllBookRatings(): Promise<BookRatingEntity[]> {
  return repository.findAll();
}

export async function getBookRatingById(id: string): Promise<BookRatingEntity | null> {
  return repository.findById(id);
}

export async function getRatingsByBook(bookId: string): Promise<BookRatingEntity[]> {
  return repository.findByBookId(bookId);
}

export async function getRatingsByUser(userId: string): Promise<BookRatingEntity[]> {
  return repository.findByUserId(userId);
}

export async function getUserRatingForBook(bookId: string, userId: string): Promise<BookRatingEntity | null> {
  return repository.findByBookAndUser(bookId, userId);
}

export async function getBookRatingStats(bookId: string): Promise<BookRatingStats> {
  return repository.getBookStats(bookId);
}

export async function createBookRating(data: CreateBookRatingDTO): Promise<BookRatingEntity> {
  if (data.rating < 1 || data.rating > 5) throw new Error('La calificación debe ser entre 1 y 5');
  return repository.create(data);
}

export async function updateBookRating(id: string, data: UpdateBookRatingDTO): Promise<BookRatingEntity> {
  if (data.rating < 1 || data.rating > 5) throw new Error('La calificación debe ser entre 1 y 5');
  return repository.update(id, data);
}

export async function rateBook(data: CreateBookRatingDTO): Promise<BookRatingEntity> {
  if (data.rating < 1 || data.rating > 5) throw new Error('La calificación debe ser entre 1 y 5');
  return repository.upsert(data);
}

export async function deleteBookRating(id: string): Promise<void> {
  return repository.delete(id);
}
