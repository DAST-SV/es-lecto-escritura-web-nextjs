// ============================================
// src/core/domain/repositories/IReadingProgressRepository.ts
// Interface del repositorio de progreso de lectura
// ============================================

import { ReadingProgressEntity } from '../entities/ReadingProgressEntity';

export interface CreateReadingProgressDTO {
  bookId: string;
  userId: string;
  currentPage?: number;
}

export interface UpdateReadingProgressDTO {
  currentPage?: number;
  totalPagesRead?: number;
  completionPercentage?: number;
  isCompleted?: boolean;
  readingTimeSeconds?: number;
}

export interface IReadingProgressRepository {
  findAll(): Promise<ReadingProgressEntity[]>;
  findById(id: string): Promise<ReadingProgressEntity | null>;
  findByBookId(bookId: string): Promise<ReadingProgressEntity[]>;
  findByUserId(userId: string): Promise<ReadingProgressEntity[]>;
  findByBookAndUser(bookId: string, userId: string): Promise<ReadingProgressEntity | null>;
  create(data: CreateReadingProgressDTO): Promise<ReadingProgressEntity>;
  update(id: string, data: UpdateReadingProgressDTO): Promise<ReadingProgressEntity>;
  upsert(data: CreateReadingProgressDTO & UpdateReadingProgressDTO): Promise<ReadingProgressEntity>;
  markAsCompleted(id: string): Promise<void>;
  addReadingTime(id: string, seconds: number): Promise<void>;
  delete(id: string): Promise<void>;
}
