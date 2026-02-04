// ============================================
// src/core/application/use-cases/book-levels/index.ts
// Barrel export de use cases de BookLevel
// ============================================

import { BookLevel } from '@/src/core/domain/entities/BookLevel';
import {
  IBookLevelRepository,
  CreateBookLevelDTO,
  UpdateBookLevelDTO,
} from '@/src/core/domain/repositories/IBookLevelRepository';

// ==================== GET ALL ====================
export class GetAllBookLevelsUseCase {
  constructor(private repository: IBookLevelRepository) {}

  async execute(includeDeleted = false): Promise<BookLevel[]> {
    return this.repository.findAll(includeDeleted);
  }
}

// ==================== GET BY ID ====================
export class GetBookLevelByIdUseCase {
  constructor(private repository: IBookLevelRepository) {}

  async execute(id: string): Promise<BookLevel | null> {
    if (!id?.trim()) {
      throw new Error('El ID es requerido');
    }
    return this.repository.findById(id);
  }
}

// ==================== CREATE ====================
export class CreateBookLevelUseCase {
  constructor(private repository: IBookLevelRepository) {}

  async execute(dto: CreateBookLevelDTO): Promise<BookLevel> {
    if (!dto.slug?.trim()) {
      throw new Error('El slug es requerido');
    }
    if (!dto.translations || dto.translations.length === 0) {
      throw new Error('Se requiere al menos una traducción');
    }
    for (const t of dto.translations) {
      if (!t.name?.trim()) {
        throw new Error(`El nombre es requerido para el idioma ${t.languageCode}`);
      }
    }

    const normalizedDto: CreateBookLevelDTO = {
      ...dto,
      slug: dto.slug
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim(),
    };

    return this.repository.create(normalizedDto);
  }
}

// ==================== UPDATE ====================
export class UpdateBookLevelUseCase {
  constructor(private repository: IBookLevelRepository) {}

  async execute(id: string, dto: UpdateBookLevelDTO): Promise<BookLevel> {
    if (!id?.trim()) {
      throw new Error('El ID es requerido');
    }
    if (dto.slug) {
      dto.slug = dto.slug
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
    }
    if (dto.translations) {
      for (const t of dto.translations) {
        if (!t.name?.trim()) {
          throw new Error(`El nombre es requerido para el idioma ${t.languageCode}`);
        }
      }
    }
    return this.repository.update(id, dto);
  }
}

// ==================== DELETE ====================
export class DeleteBookLevelUseCase {
  constructor(private repository: IBookLevelRepository) {}

  async execute(id: string, hard = false): Promise<void> {
    if (!id?.trim()) {
      throw new Error('El ID es requerido');
    }
    if (hard) {
      await this.repository.hardDelete(id);
    } else {
      await this.repository.softDelete(id);
    }
  }
}

// ==================== RESTORE ====================
export class RestoreBookLevelUseCase {
  constructor(private repository: IBookLevelRepository) {}

  async execute(id: string): Promise<void> {
    if (!id?.trim()) {
      throw new Error('El ID es requerido');
    }
    await this.repository.restore(id);
  }
}
