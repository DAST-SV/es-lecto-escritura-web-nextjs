// ============================================
// src/core/domain/repositories/IReadingListRepository.ts
// Interface del repositorio de listas de lectura
// ============================================

import { ReadingListEntity } from '../entities/ReadingListEntity';

export interface CreateReadingListDTO {
  userId: string;
  name: string;
  description?: string | null;
  isPublic?: boolean;
  isDefault?: boolean;
}

export interface UpdateReadingListDTO {
  name?: string;
  description?: string | null;
  isPublic?: boolean;
  isDefault?: boolean;
}

export interface AddBookToListDTO {
  readingListId: string;
  bookId: string;
  orderIndex?: number;
}

export interface IReadingListRepository {
  findAll(includeDeleted?: boolean): Promise<ReadingListEntity[]>;
  findById(id: string): Promise<ReadingListEntity | null>;
  findByUserId(userId: string): Promise<ReadingListEntity[]>;
  findPublic(): Promise<ReadingListEntity[]>;
  create(data: CreateReadingListDTO): Promise<ReadingListEntity>;
  update(id: string, data: UpdateReadingListDTO): Promise<ReadingListEntity>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
  // Book operations
  addBook(data: AddBookToListDTO): Promise<void>;
  removeBook(readingListId: string, bookId: string): Promise<void>;
  reorderBooks(readingListId: string, bookIds: string[]): Promise<void>;
}
