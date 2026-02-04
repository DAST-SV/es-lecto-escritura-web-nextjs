// ============================================
// src/core/application/use-cases/reading-sessions/index.ts
// Casos de uso para sesiones de lectura
// ============================================

import { ReadingSessionRepository } from '@/src/infrastructure/repositories/reading-sessions/ReadingSessionRepository';
import { ReadingSessionEntity } from '@/src/core/domain/entities/ReadingSessionEntity';
import { CreateReadingSessionDTO, EndReadingSessionDTO } from '@/src/core/domain/repositories/IReadingSessionRepository';

const repository = new ReadingSessionRepository();

export async function getAllReadingSessions(): Promise<ReadingSessionEntity[]> {
  return repository.findAll();
}

export async function getReadingSessionById(id: string): Promise<ReadingSessionEntity | null> {
  return repository.findById(id);
}

export async function getSessionsByBook(bookId: string): Promise<ReadingSessionEntity[]> {
  return repository.findByBookId(bookId);
}

export async function getSessionsByUser(userId: string): Promise<ReadingSessionEntity[]> {
  return repository.findByUserId(userId);
}

export async function getActiveSessionForUser(userId: string): Promise<ReadingSessionEntity | null> {
  return repository.findActiveByUser(userId);
}

export async function startReadingSession(data: CreateReadingSessionDTO): Promise<ReadingSessionEntity> {
  if (data.startPage < 1) throw new Error('La página inicial debe ser mayor a 0');
  return repository.create(data);
}

export async function endReadingSession(id: string, data: EndReadingSessionDTO): Promise<ReadingSessionEntity> {
  return repository.endSession(id, data);
}

export async function deleteReadingSession(id: string): Promise<void> {
  return repository.delete(id);
}
