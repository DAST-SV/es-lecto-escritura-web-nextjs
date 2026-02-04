// ============================================
// src/core/application/use-cases/reading-lists/index.ts
// Casos de uso para listas de lectura
// ============================================

import { ReadingListRepository } from '@/src/infrastructure/repositories/reading-lists/ReadingListRepository';
import { ReadingListEntity } from '@/src/core/domain/entities/ReadingListEntity';
import { CreateReadingListDTO, UpdateReadingListDTO, AddBookToListDTO } from '@/src/core/domain/repositories/IReadingListRepository';

const repository = new ReadingListRepository();

export async function getAllReadingLists(includeDeleted = false): Promise<ReadingListEntity[]> {
  return repository.findAll(includeDeleted);
}

export async function getReadingListById(id: string): Promise<ReadingListEntity | null> {
  return repository.findById(id);
}

export async function getReadingListsByUser(userId: string): Promise<ReadingListEntity[]> {
  return repository.findByUserId(userId);
}

export async function getPublicReadingLists(): Promise<ReadingListEntity[]> {
  return repository.findPublic();
}

export async function createReadingList(data: CreateReadingListDTO): Promise<ReadingListEntity> {
  if (!data.name?.trim()) throw new Error('El nombre de la lista es requerido');
  return repository.create(data);
}

export async function updateReadingList(id: string, data: UpdateReadingListDTO): Promise<ReadingListEntity> {
  return repository.update(id, data);
}

export async function softDeleteReadingList(id: string): Promise<void> {
  return repository.softDelete(id);
}

export async function restoreReadingList(id: string): Promise<void> {
  return repository.restore(id);
}

export async function hardDeleteReadingList(id: string): Promise<void> {
  return repository.hardDelete(id);
}

export async function addBookToList(data: AddBookToListDTO): Promise<void> {
  return repository.addBook(data);
}

export async function removeBookFromList(readingListId: string, bookId: string): Promise<void> {
  return repository.removeBook(readingListId, bookId);
}

export async function reorderBooksInList(readingListId: string, bookIds: string[]): Promise<void> {
  return repository.reorderBooks(readingListId, bookIds);
}
