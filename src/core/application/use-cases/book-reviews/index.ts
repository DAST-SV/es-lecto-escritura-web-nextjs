// ============================================
// src/core/application/use-cases/book-reviews/index.ts
// Casos de uso para reseñas de libros
// ============================================

import { BookReviewRepository } from '@/src/infrastructure/repositories/book-reviews/BookReviewRepository';
import { BookReviewEntity } from '@/src/core/domain/entities/BookReviewEntity';
import { CreateBookReviewDTO, UpdateBookReviewDTO } from '@/src/core/domain/repositories/IBookReviewRepository';

const repository = new BookReviewRepository();

export async function getAllBookReviews(includeDeleted = false): Promise<BookReviewEntity[]> {
  return repository.findAll(includeDeleted);
}

export async function getBookReviewById(id: string): Promise<BookReviewEntity | null> {
  return repository.findById(id);
}

export async function getReviewsByBook(bookId: string): Promise<BookReviewEntity[]> {
  return repository.findByBookId(bookId);
}

export async function getReviewsByUser(userId: string): Promise<BookReviewEntity[]> {
  return repository.findByUserId(userId);
}

export async function createBookReview(data: CreateBookReviewDTO): Promise<BookReviewEntity> {
  if (!data.content?.trim()) throw new Error('El contenido de la reseña es requerido');
  return repository.create(data);
}

export async function updateBookReview(id: string, data: UpdateBookReviewDTO): Promise<BookReviewEntity> {
  return repository.update(id, data);
}

export async function approveReview(id: string): Promise<void> {
  return repository.approve(id);
}

export async function rejectReview(id: string): Promise<void> {
  return repository.reject(id);
}

export async function featureReview(id: string): Promise<void> {
  return repository.feature(id);
}

export async function unfeatureReview(id: string): Promise<void> {
  return repository.unfeature(id);
}

export async function markReviewHelpful(id: string): Promise<void> {
  return repository.incrementHelpful(id);
}

export async function softDeleteReview(id: string): Promise<void> {
  return repository.softDelete(id);
}

export async function restoreReview(id: string): Promise<void> {
  return repository.restore(id);
}

export async function hardDeleteReview(id: string): Promise<void> {
  return repository.hardDelete(id);
}
