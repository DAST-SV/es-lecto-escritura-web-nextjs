// ============================================
// src/core/domain/repositories/IReadingSessionRepository.ts
// Interface del repositorio de sesiones de lectura
// ============================================

import { ReadingSessionEntity } from '../entities/ReadingSessionEntity';

export interface CreateReadingSessionDTO {
  bookId: string;
  userId: string;
  startPage: number;
  endPage: number;
  deviceType?: string | null;
  languageCode?: string | null;
}

export interface EndReadingSessionDTO {
  endPage: number;
  durationSeconds: number;
}

export interface IReadingSessionRepository {
  findAll(): Promise<ReadingSessionEntity[]>;
  findById(id: string): Promise<ReadingSessionEntity | null>;
  findByBookId(bookId: string): Promise<ReadingSessionEntity[]>;
  findByUserId(userId: string): Promise<ReadingSessionEntity[]>;
  findActiveByUser(userId: string): Promise<ReadingSessionEntity | null>;
  create(data: CreateReadingSessionDTO): Promise<ReadingSessionEntity>;
  endSession(id: string, data: EndReadingSessionDTO): Promise<ReadingSessionEntity>;
  delete(id: string): Promise<void>;
}
