// ============================================
// src/presentation/features/book-tags/hooks/useBookTagsManager.ts
// Hook: Gestión completa de etiquetas
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BookTag } from '@/src/core/domain/entities/BookTag';
import { BookTagRepository } from '@/src/infrastructure/repositories/book-tags/BookTagRepository';
import { CreateBookTagDTO, UpdateBookTagDTO } from '@/src/core/domain/repositories/IBookTagRepository';

export function useBookTagsManager() {
  const [tags, setTags] = useState<BookTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const repository = useMemo(() => new BookTagRepository(), []);

  const loadTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await repository.findAll(true);
      setTags(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar etiquetas');
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const createTag = useCallback(async (dto: CreateBookTagDTO): Promise<BookTag> => {
    const newTag = await repository.create(dto);
    setTags(prev => [...prev, newTag]);
    return newTag;
  }, [repository]);

  const updateTag = useCallback(async (id: string, dto: UpdateBookTagDTO): Promise<BookTag> => {
    const updated = await repository.update(id, dto);
    setTags(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  }, [repository]);

  const softDelete = useCallback(async (id: string): Promise<void> => {
    await repository.softDelete(id);
    await loadTags();
  }, [repository, loadTags]);

  const restore = useCallback(async (id: string): Promise<void> => {
    await repository.restore(id);
    await loadTags();
  }, [repository, loadTags]);

  const hardDelete = useCallback(async (id: string): Promise<void> => {
    await repository.hardDelete(id);
    setTags(prev => prev.filter(t => t.id !== id));
  }, [repository]);

  useEffect(() => { loadTags(); }, [loadTags]);

  return { tags, loading, error, createTag, updateTag, softDelete, restore, hardDelete, refresh: loadTags };
}
