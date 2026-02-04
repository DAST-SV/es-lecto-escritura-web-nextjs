// ============================================
// src/presentation/features/book-pages/hooks/useBookPagesManager.ts
// Hook para gestión de páginas de libros
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookPageEntity } from '@/src/core/domain/entities/BookPageEntity';
import {
  getAllBookPages,
  getPagesByBook,
  createBookPage,
  updateBookPage,
  deleteBookPage,
  addPageTranslation,
  updatePageTranslation,
  deletePageTranslation,
  reorderPages,
} from '@/src/core/application/use-cases/book-pages';
import { CreateBookPageDTO, UpdateBookPageDTO, CreatePageTranslationDTO } from '@/src/core/domain/repositories/IBookPageRepository2';

export function useBookPagesManager(bookId?: string) {
  const [pages, setPages] = useState<BookPageEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = bookId ? await getPagesByBook(bookId) : await getAllBookPages();
      setPages(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => { loadPages(); }, [loadPages]);

  const create = async (data: CreateBookPageDTO) => { const r = await createBookPage(data); await loadPages(); return r; };
  const update = async (id: string, data: UpdateBookPageDTO) => { const r = await updateBookPage(id, data); await loadPages(); return r; };
  const remove = async (id: string) => { await deleteBookPage(id); await loadPages(); };
  const addTrans = async (pageId: string, data: CreatePageTranslationDTO) => { await addPageTranslation(pageId, data); await loadPages(); };
  const updateTrans = async (pageId: string, langCode: string, data: Partial<CreatePageTranslationDTO>) => { await updatePageTranslation(pageId, langCode, data); await loadPages(); };
  const removeTrans = async (pageId: string, langCode: string) => { await deletePageTranslation(pageId, langCode); await loadPages(); };
  const reorder = async (bookId: string, pageIds: string[]) => { await reorderPages(bookId, pageIds); await loadPages(); };

  return { pages, loading, error, refresh: loadPages, create, update, remove, addTranslation: addTrans, updateTranslation: updateTrans, removeTranslation: removeTrans, reorder };
}
