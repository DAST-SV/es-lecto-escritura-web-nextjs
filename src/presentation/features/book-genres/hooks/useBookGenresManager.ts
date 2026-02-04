// ============================================
// src/presentation/features/book-genres/hooks/useBookGenresManager.ts
// Hook: Gestión completa de géneros literarios
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BookGenre } from '@/src/core/domain/entities/BookGenre';
import { BookGenreRepository } from '@/src/infrastructure/repositories/book-genres/BookGenreRepository';
import {
  CreateBookGenreDTO,
  UpdateBookGenreDTO,
} from '@/src/core/domain/repositories/IBookGenreRepository';

export function useBookGenresManager() {
  const [genres, setGenres] = useState<BookGenre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const repository = useMemo(() => new BookGenreRepository(), []);

  const loadGenres = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await repository.findAll(true);
      setGenres(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar géneros');
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const createGenre = useCallback(async (dto: CreateBookGenreDTO): Promise<BookGenre> => {
    const newGenre = await repository.create(dto);
    setGenres(prev => [...prev, newGenre]);
    return newGenre;
  }, [repository]);

  const updateGenre = useCallback(async (id: string, dto: UpdateBookGenreDTO): Promise<BookGenre> => {
    const updated = await repository.update(id, dto);
    setGenres(prev => prev.map(g => g.id === id ? updated : g));
    return updated;
  }, [repository]);

  const softDelete = useCallback(async (id: string): Promise<void> => {
    await repository.softDelete(id);
    await loadGenres();
  }, [repository, loadGenres]);

  const restore = useCallback(async (id: string): Promise<void> => {
    await repository.restore(id);
    await loadGenres();
  }, [repository, loadGenres]);

  const hardDelete = useCallback(async (id: string): Promise<void> => {
    await repository.hardDelete(id);
    setGenres(prev => prev.filter(g => g.id !== id));
  }, [repository]);

  useEffect(() => { loadGenres(); }, [loadGenres]);

  return { genres, loading, error, createGenre, updateGenre, softDelete, restore, hardDelete, refresh: loadGenres };
}
