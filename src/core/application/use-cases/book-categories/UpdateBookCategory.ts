// ============================================
// src/core/application/use-cases/book-categories/UpdateBookCategory.ts
// Use Case: Actualizar una categoría de libros
// ============================================

import { BookCategory } from '@/src/core/domain/entities/BookCategory';
import {
  IBookCategoryRepository,
  UpdateBookCategoryDTO,
} from '@/src/core/domain/repositories/IBookCategoryRepository';

export class UpdateBookCategoryUseCase {
  constructor(private repository: IBookCategoryRepository) {}

  async execute(id: string, dto: UpdateBookCategoryDTO): Promise<BookCategory> {
    if (!id?.trim()) {
      throw new Error('El ID es requerido');
    }

    // Normalizar slug si se proporciona
    if (dto.slug) {
      dto.slug = dto.slug
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    // Validar traducciones si se proporcionan
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
