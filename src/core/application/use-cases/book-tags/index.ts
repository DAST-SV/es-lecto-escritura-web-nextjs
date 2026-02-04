// ============================================
// src/core/application/use-cases/book-tags/index.ts
// Barrel export de use cases de BookTag
// ============================================

import { BookTag } from '@/src/core/domain/entities/BookTag';
import { IBookTagRepository, CreateBookTagDTO, UpdateBookTagDTO } from '@/src/core/domain/repositories/IBookTagRepository';

export class GetAllBookTagsUseCase {
  constructor(private repository: IBookTagRepository) {}
  async execute(includeDeleted = false): Promise<BookTag[]> {
    return this.repository.findAll(includeDeleted);
  }
}

export class GetBookTagByIdUseCase {
  constructor(private repository: IBookTagRepository) {}
  async execute(id: string): Promise<BookTag | null> {
    if (!id?.trim()) throw new Error('El ID es requerido');
    return this.repository.findById(id);
  }
}

export class CreateBookTagUseCase {
  constructor(private repository: IBookTagRepository) {}
  async execute(dto: CreateBookTagDTO): Promise<BookTag> {
    if (!dto.slug?.trim()) throw new Error('El slug es requerido');
    if (!dto.translations?.length) throw new Error('Se requiere al menos una traducción');
    return this.repository.create(dto);
  }
}

export class UpdateBookTagUseCase {
  constructor(private repository: IBookTagRepository) {}
  async execute(id: string, dto: UpdateBookTagDTO): Promise<BookTag> {
    if (!id?.trim()) throw new Error('El ID es requerido');
    return this.repository.update(id, dto);
  }
}

export class DeleteBookTagUseCase {
  constructor(private repository: IBookTagRepository) {}
  async execute(id: string, hard = false): Promise<void> {
    if (!id?.trim()) throw new Error('El ID es requerido');
    if (hard) await this.repository.hardDelete(id);
    else await this.repository.softDelete(id);
  }
}

export class RestoreBookTagUseCase {
  constructor(private repository: IBookTagRepository) {}
  async execute(id: string): Promise<void> {
    if (!id?.trim()) throw new Error('El ID es requerido');
    await this.repository.restore(id);
  }
}
