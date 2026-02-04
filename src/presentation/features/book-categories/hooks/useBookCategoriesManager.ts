// ============================================
// src/presentation/features/book-categories/hooks/useBookCategoriesManager.ts
// Hook: Gestión completa de categorías de libros
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BookCategory } from '@/src/core/domain/entities/BookCategory';
import { BookCategoryRepository } from '@/src/infrastructure/repositories/book-categories/BookCategoryRepository';
import {
  CreateBookCategoryDTO,
  UpdateBookCategoryDTO,
} from '@/src/core/domain/repositories/IBookCategoryRepository';

export function useBookCategoriesManager() {
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const repository = useMemo(() => new BookCategoryRepository(), []);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await repository.findAll(true); // incluir eliminados
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar categorías');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const createCategory = useCallback(async (dto: CreateBookCategoryDTO): Promise<BookCategory> => {
    try {
      const newCategory = await repository.create(dto);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err: any) {
      throw new Error(err.message || 'Error al crear categoría');
    }
  }, [repository]);

  const updateCategory = useCallback(async (id: string, dto: UpdateBookCategoryDTO): Promise<BookCategory> => {
    try {
      const updated = await repository.update(id, dto);
      setCategories(prev => prev.map(cat => cat.id === id ? updated : cat));
      return updated;
    } catch (err: any) {
      throw new Error(err.message || 'Error al actualizar categoría');
    }
  }, [repository]);

  const softDelete = useCallback(async (id: string): Promise<void> => {
    try {
      await repository.softDelete(id);
      // Actualizar estado local para reflejar el soft delete
      setCategories(prev => prev.map(cat => {
        if (cat.id === id) {
          return BookCategory.fromDatabase({
            ...cat,
            order_index: cat.orderIndex,
            is_active: cat.isActive,
            created_at: cat.createdAt.toISOString(),
            updated_at: cat.updatedAt.toISOString(),
            deleted_at: new Date().toISOString(),
            category_translations: cat.translations.map(t => ({
              id: t.id,
              language_code: t.languageCode,
              name: t.name,
              description: t.description,
              is_active: t.isActive,
            })),
          });
        }
        return cat;
      }));
    } catch (err: any) {
      throw new Error(err.message || 'Error al eliminar categoría');
    }
  }, [repository]);

  const restore = useCallback(async (id: string): Promise<void> => {
    try {
      await repository.restore(id);
      // Actualizar estado local para reflejar la restauración
      setCategories(prev => prev.map(cat => {
        if (cat.id === id) {
          return BookCategory.fromDatabase({
            ...cat,
            order_index: cat.orderIndex,
            is_active: cat.isActive,
            created_at: cat.createdAt.toISOString(),
            updated_at: cat.updatedAt.toISOString(),
            deleted_at: null,
            category_translations: cat.translations.map(t => ({
              id: t.id,
              language_code: t.languageCode,
              name: t.name,
              description: t.description,
              is_active: t.isActive,
            })),
          });
        }
        return cat;
      }));
    } catch (err: any) {
      throw new Error(err.message || 'Error al restaurar categoría');
    }
  }, [repository]);

  const hardDelete = useCallback(async (id: string): Promise<void> => {
    try {
      await repository.hardDelete(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err: any) {
      throw new Error(err.message || 'Error al eliminar categoría permanentemente');
    }
  }, [repository]);

  const refresh = useCallback(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    softDelete,
    restore,
    hardDelete,
    refresh,
  };
}
