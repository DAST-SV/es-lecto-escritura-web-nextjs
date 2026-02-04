// ============================================
// src/presentation/features/reading-lists/hooks/useReadingListsManager.ts
// Hook para gestión de listas de lectura
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ReadingListEntity } from '@/src/core/domain/entities/ReadingListEntity';
import {
  getAllReadingLists,
  createReadingList,
  updateReadingList,
  softDeleteReadingList,
  restoreReadingList,
  hardDeleteReadingList,
  addBookToList,
  removeBookFromList,
  reorderBooksInList,
} from '@/src/core/application/use-cases/reading-lists';
import { CreateReadingListDTO, UpdateReadingListDTO, AddBookToListDTO } from '@/src/core/domain/repositories/IReadingListRepository';

export function useReadingListsManager() {
  const [lists, setLists] = useState<ReadingListEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllReadingLists(true);
      setLists(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadLists(); }, [loadLists]);

  const create = async (data: CreateReadingListDTO) => { const r = await createReadingList(data); await loadLists(); return r; };
  const update = async (id: string, data: UpdateReadingListDTO) => { const r = await updateReadingList(id, data); await loadLists(); return r; };
  const softDelete = async (id: string) => { await softDeleteReadingList(id); await loadLists(); };
  const restore = async (id: string) => { await restoreReadingList(id); await loadLists(); };
  const hardDelete = async (id: string) => { await hardDeleteReadingList(id); await loadLists(); };
  const addBook = async (data: AddBookToListDTO) => { await addBookToList(data); await loadLists(); };
  const removeBook = async (listId: string, bookId: string) => { await removeBookFromList(listId, bookId); await loadLists(); };
  const reorderBooks = async (listId: string, bookIds: string[]) => { await reorderBooksInList(listId, bookIds); await loadLists(); };

  return { lists, loading, error, refresh: loadLists, create, update, softDelete, restore, hardDelete, addBook, removeBook, reorderBooks };
}
