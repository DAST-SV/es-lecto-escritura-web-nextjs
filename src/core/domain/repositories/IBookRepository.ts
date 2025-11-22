/**
 * UBICACIÓN: src/core/domain/repositories/IBookRepository.ts
 */

import { Book } from '../entities/Book.entity';

export interface IBookRepository {
  save(book: Book): Promise<string>;
  findById(id: string): Promise<Book | null>;
  findByUserId(userId: string): Promise<Book[]>;
  delete(id: string): Promise<void>;
  update(book: Book): Promise<void>;
}