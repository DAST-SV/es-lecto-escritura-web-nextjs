// ============================================
// src/core/application/use-cases/reading-progress/index.ts
// Casos de uso para progreso de lectura
// ============================================

import { ReadingProgressRepository } from '@/src/infrastructure/repositories/reading-progress/ReadingProgressRepository';
import { ReadingProgressEntity } from '@/src/core/domain/entities/ReadingProgressEntity';
import { CreateReadingProgressDTO, UpdateReadingProgressDTO } from '@/src/core/domain/repositories/IReadingProgressRepository';

const repository = new ReadingProgressRepository();

export async function getAllReadingProgress(): Promise<ReadingProgressEntity[]> {
  return repository.findAll();
}

export async function getReadingProgressById(id: string): Promise<ReadingProgressEntity | null> {
  return repository.findById(id);
}

export async function getProgressByBook(bookId: string): Promise<ReadingProgressEntity[]> {
  return repository.findByBookId(bookId);
}

export async function getProgressByUser(userId: string): Promise<ReadingProgressEntity[]> {
  return repository.findByUserId(userId);
}

export async function getUserProgressForBook(bookId: string, userId: string): Promise<ReadingProgressEntity | null> {
  return repository.findByBookAndUser(bookId, userId);
}

export async function createReadingProgress(data: CreateReadingProgressDTO): Promise<ReadingProgressEntity> {
  return repository.create(data);
}

export async function updateReadingProgress(id: string, data: UpdateReadingProgressDTO): Promise<ReadingProgressEntity> {
  return repository.update(id, data);
}

export async function upsertReadingProgress(data: CreateReadingProgressDTO & UpdateReadingProgressDTO): Promise<ReadingProgressEntity> {
  return repository.upsert(data);
}

export async function markBookAsCompleted(id: string): Promise<void> {
  return repository.markAsCompleted(id);
}

export async function addReadingTime(id: string, seconds: number): Promise<void> {
  if (seconds < 0) throw new Error('El tiempo debe ser positivo');
  return repository.addReadingTime(id, seconds);
}

export async function deleteReadingProgress(id: string): Promise<void> {
  return repository.delete(id);
}
