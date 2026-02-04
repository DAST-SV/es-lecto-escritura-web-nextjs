// ============================================
// src/presentation/features/book-levels/hooks/useBookLevelsManager.ts
// Hook: Gestión completa de niveles de lectura
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BookLevel } from '@/src/core/domain/entities/BookLevel';
import { BookLevelRepository } from '@/src/infrastructure/repositories/book-levels/BookLevelRepository';
import {
  CreateBookLevelDTO,
  UpdateBookLevelDTO,
} from '@/src/core/domain/repositories/IBookLevelRepository';

export function useBookLevelsManager() {
  const [levels, setLevels] = useState<BookLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const repository = useMemo(() => new BookLevelRepository(), []);

  const loadLevels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await repository.findAll(true);
      setLevels(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar niveles');
      console.error('Error loading levels:', err);
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const createLevel = useCallback(async (dto: CreateBookLevelDTO): Promise<BookLevel> => {
    try {
      const newLevel = await repository.create(dto);
      setLevels(prev => [...prev, newLevel]);
      return newLevel;
    } catch (err: any) {
      throw new Error(err.message || 'Error al crear nivel');
    }
  }, [repository]);

  const updateLevel = useCallback(async (id: string, dto: UpdateBookLevelDTO): Promise<BookLevel> => {
    try {
      const updated = await repository.update(id, dto);
      setLevels(prev => prev.map(lvl => lvl.id === id ? updated : lvl));
      return updated;
    } catch (err: any) {
      throw new Error(err.message || 'Error al actualizar nivel');
    }
  }, [repository]);

  const softDelete = useCallback(async (id: string): Promise<void> => {
    try {
      await repository.softDelete(id);
      setLevels(prev => prev.map(lvl => {
        if (lvl.id === id) {
          return BookLevel.fromDatabase({
            ...lvl,
            min_age: lvl.minAge,
            max_age: lvl.maxAge,
            grade_min: lvl.gradeMin,
            grade_max: lvl.gradeMax,
            order_index: lvl.orderIndex,
            is_active: lvl.isActive,
            created_at: lvl.createdAt.toISOString(),
            updated_at: lvl.updatedAt.toISOString(),
            deleted_at: new Date().toISOString(),
            level_translations: lvl.translations.map(t => ({
              id: t.id,
              language_code: t.languageCode,
              name: t.name,
              description: t.description,
              age_label: t.ageLabel,
              is_active: t.isActive,
            })),
          });
        }
        return lvl;
      }));
    } catch (err: any) {
      throw new Error(err.message || 'Error al eliminar nivel');
    }
  }, [repository]);

  const restore = useCallback(async (id: string): Promise<void> => {
    try {
      await repository.restore(id);
      setLevels(prev => prev.map(lvl => {
        if (lvl.id === id) {
          return BookLevel.fromDatabase({
            ...lvl,
            min_age: lvl.minAge,
            max_age: lvl.maxAge,
            grade_min: lvl.gradeMin,
            grade_max: lvl.gradeMax,
            order_index: lvl.orderIndex,
            is_active: lvl.isActive,
            created_at: lvl.createdAt.toISOString(),
            updated_at: lvl.updatedAt.toISOString(),
            deleted_at: null,
            level_translations: lvl.translations.map(t => ({
              id: t.id,
              language_code: t.languageCode,
              name: t.name,
              description: t.description,
              age_label: t.ageLabel,
              is_active: t.isActive,
            })),
          });
        }
        return lvl;
      }));
    } catch (err: any) {
      throw new Error(err.message || 'Error al restaurar nivel');
    }
  }, [repository]);

  const hardDelete = useCallback(async (id: string): Promise<void> => {
    try {
      await repository.hardDelete(id);
      setLevels(prev => prev.filter(lvl => lvl.id !== id));
    } catch (err: any) {
      throw new Error(err.message || 'Error al eliminar nivel permanentemente');
    }
  }, [repository]);

  const refresh = useCallback(() => {
    loadLevels();
  }, [loadLevels]);

  useEffect(() => {
    loadLevels();
  }, [loadLevels]);

  return {
    levels,
    loading,
    error,
    createLevel,
    updateLevel,
    softDelete,
    restore,
    hardDelete,
    refresh,
  };
}
