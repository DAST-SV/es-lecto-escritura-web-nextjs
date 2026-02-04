// ============================================
// src/core/application/use-cases/book-authors/index.ts
// Barrel export de use cases de BookAuthor
// ============================================

import { BookAuthor } from '@/src/core/domain/entities/BookAuthor';
import { IBookAuthorRepository, CreateBookAuthorDTO, UpdateBookAuthorDTO } from '@/src/core/domain/repositories/IBookAuthorRepository';

export class GetAllBookAuthorsUseCase {
  constructor(private repository: IBookAuthorRepository) {}
  async execute(includeDeleted = false): Promise<BookAuthor[]> {
    return this.repository.findAll(includeDeleted);
  }
}

export class GetBookAuthorByIdUseCase {
  constructor(private repository: IBookAuthorRepository) {}
  async execute(id: string): Promise<BookAuthor | null> {
    if (!id?.trim()) throw new Error('El ID es requerido');
    return this.repository.findById(id);
  }
}

export class CreateBookAuthorUseCase {
  constructor(private repository: IBookAuthorRepository) {}
  async execute(dto: CreateBookAuthorDTO): Promise<BookAuthor> {
    if (!dto.slug?.trim()) throw new Error('El slug es requerido');
    if (!dto.translations?.length) throw new Error('Se requiere al menos una traducción');
    return this.repository.create(dto);
  }
}

export class UpdateBookAuthorUseCase {
  constructor(private repository: IBookAuthorRepository) {}
  async execute(id: string, dto: UpdateBookAuthorDTO): Promise<BookAuthor> {
    if (!id?.trim()) throw new Error('El ID es requerido');
    return this.repository.update(id, dto);
  }
}

export class DeleteBookAuthorUseCase {
  constructor(private repository: IBookAuthorRepository) {}
  async execute(id: string, hard = false): Promise<void> {
    if (!id?.trim()) throw new Error('El ID es requerido');
    if (hard) await this.repository.hardDelete(id);
    else await this.repository.softDelete(id);
  }
}

export class RestoreBookAuthorUseCase {
  constructor(private repository: IBookAuthorRepository) {}
  async execute(id: string): Promise<void> {
    if (!id?.trim()) throw new Error('El ID es requerido');
    await this.repository.restore(id);
  }
}
