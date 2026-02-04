// ============================================
// src/presentation/features/book-authors/hooks/useBookAuthorsManager.ts
// Hook: Gestión completa de autores
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BookAuthor } from '@/src/core/domain/entities/BookAuthor';
import { BookAuthorRepository } from '@/src/infrastructure/repositories/book-authors/BookAuthorRepository';
import { CreateBookAuthorDTO, UpdateBookAuthorDTO } from '@/src/core/domain/repositories/IBookAuthorRepository';

export function useBookAuthorsManager() {
  const [authors, setAuthors] = useState<BookAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const repository = useMemo(() => new BookAuthorRepository(), []);

  const loadAuthors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await repository.findAll(true);
      setAuthors(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar autores');
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const createAuthor = useCallback(async (dto: CreateBookAuthorDTO): Promise<BookAuthor> => {
    const newAuthor = await repository.create(dto);
    setAuthors(prev => [...prev, newAuthor]);
    return newAuthor;
  }, [repository]);

  const updateAuthor = useCallback(async (id: string, dto: UpdateBookAuthorDTO): Promise<BookAuthor> => {
    const updated = await repository.update(id, dto);
    setAuthors(prev => prev.map(a => a.id === id ? updated : a));
    return updated;
  }, [repository]);

  const softDelete = useCallback(async (id: string): Promise<void> => {
    await repository.softDelete(id);
    await loadAuthors();
  }, [repository, loadAuthors]);

  const restore = useCallback(async (id: string): Promise<void> => {
    await repository.restore(id);
    await loadAuthors();
  }, [repository, loadAuthors]);

  const hardDelete = useCallback(async (id: string): Promise<void> => {
    await repository.hardDelete(id);
    setAuthors(prev => prev.filter(a => a.id !== id));
  }, [repository]);

  useEffect(() => { loadAuthors(); }, [loadAuthors]);

  return { authors, loading, error, createAuthor, updateAuthor, softDelete, restore, hardDelete, refresh: loadAuthors };
}
