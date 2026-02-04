// ============================================
// src/core/application/use-cases/book-genres/index.ts
// Barrel export de use cases de BookGenre
// ============================================

import { BookGenre } from '@/src/core/domain/entities/BookGenre';
import {
  IBookGenreRepository,
  CreateBookGenreDTO,
  UpdateBookGenreDTO,
} from '@/src/core/domain/repositories/IBookGenreRepository';

export class GetAllBookGenresUseCase {
  constructor(private repository: IBookGenreRepository) {}
  async execute(includeDeleted = false): Promise<BookGenre[]> {
    return this.repository.findAll(includeDeleted);
  }
}

export class GetBookGenreByIdUseCase {
  constructor(private repository: IBookGenreRepository) {}
  async execute(id: string): Promise<BookGenre | null> {
    if (!id?.trim()) throw new Error('El ID es requerido');
    return this.repository.findById(id);
  }
}

export class CreateBookGenreUseCase {
  constructor(private repository: IBookGenreRepository) {}
  async execute(dto: CreateBookGenreDTO): Promise<BookGenre> {
    if (!dto.slug?.trim()) throw new Error('El slug es requerido');
    if (!dto.translations?.length) throw new Error('Se requiere al menos una traducción');
    return this.repository.create(dto);
  }
}

export class UpdateBookGenreUseCase {
  constructor(private repository: IBookGenreRepository) {}
  async execute(id: string, dto: UpdateBookGenreDTO): Promise<BookGenre> {
    if (!id?.trim()) throw new Error('El ID es requerido');
    return this.repository.update(id, dto);
  }
}

export class DeleteBookGenreUseCase {
  constructor(private repository: IBookGenreRepository) {}
  async execute(id: string, hard = false): Promise<void> {
    if (!id?.trim()) throw new Error('El ID es requerido');
    if (hard) await this.repository.hardDelete(id);
    else await this.repository.softDelete(id);
  }
}

export class RestoreBookGenreUseCase {
  constructor(private repository: IBookGenreRepository) {}
  async execute(id: string): Promise<void> {
    if (!id?.trim()) throw new Error('El ID es requerido');
    await this.repository.restore(id);
  }
}
