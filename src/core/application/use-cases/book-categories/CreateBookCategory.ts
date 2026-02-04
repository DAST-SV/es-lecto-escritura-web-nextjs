// ============================================
// src/core/application/use-cases/book-categories/CreateBookCategory.ts
// Use Case: Crear una nueva categoría de libros
// ============================================

import { BookCategory } from '@/src/core/domain/entities/BookCategory';
import {
  IBookCategoryRepository,
  CreateBookCategoryDTO,
} from '@/src/core/domain/repositories/IBookCategoryRepository';

export class CreateBookCategoryUseCase {
  constructor(private repository: IBookCategoryRepository) {}

  async execute(dto: CreateBookCategoryDTO): Promise<BookCategory> {
    // Validaciones de negocio
    if (!dto.slug?.trim()) {
      throw new Error('El slug es requerido');
    }

    if (!dto.translations || dto.translations.length === 0) {
      throw new Error('Se requiere al menos una traducción');
    }

    // Validar que cada traducción tenga nombre
    for (const t of dto.translations) {
      if (!t.name?.trim()) {
        throw new Error(`El nombre es requerido para el idioma ${t.languageCode}`);
      }
    }

    // Normalizar slug
    const normalizedDto: CreateBookCategoryDTO = {
      ...dto,
      slug: dto.slug
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim(),
    };

    return this.repository.create(normalizedDto);
  }
}
