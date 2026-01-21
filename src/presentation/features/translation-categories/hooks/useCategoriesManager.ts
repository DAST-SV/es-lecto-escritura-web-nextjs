// ============================================
// src/presentation/features/translation-categories/hooks/useCategoriesManager.ts
// Hook: Gestión completa de categorías
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { TranslationCategory } from '@/src/core/domain/entities/TranslationCategory';
import { TranslationCategoryRepository } from '@/src/infrastructure/repositories/translation-categories/TranslationCategoryRepository';
import { CreateTranslationCategoryDTO, UpdateTranslationCategoryDTO } from '@/src/core/domain/repositories/ITranslationCategoryRepository';

const categoryRepository = new TranslationCategoryRepository();

export function useCategoriesManager() {
  const [categories, setCategories] = useState<TranslationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryRepository.findAll(true); // incluir inactivos
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar categorías');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (dto: CreateTranslationCategoryDTO) => {
    try {
      const newCategory = await categoryRepository.create(dto);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err: any) {
      throw new Error(err.message || 'Error al crear categoría');
    }
  }, []);

  const updateCategory = useCallback(async (id: string, dto: UpdateTranslationCategoryDTO) => {
    try {
      const updated = await categoryRepository.update(id, dto);
      setCategories(prev => prev.map(cat => cat.id === id ? updated : cat));
      return updated;
    } catch (err: any) {
      throw new Error(err.message || 'Error al actualizar categoría');
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      await categoryRepository.delete(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err: any) {
      throw new Error(err.message || 'Error al eliminar categoría');
    }
  }, []);

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
    deleteCategory,
    refresh,
  };
}