// ============================================
// src/presentation/features/book-ratings/hooks/useBookRatingsManager.ts
// Hook para gestión de calificaciones de libros
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookRatingEntity } from '@/src/core/domain/entities/BookRatingEntity';
import {
  getAllBookRatings,
  createBookRating,
  updateBookRating,
  rateBook,
  deleteBookRating,
  getBookRatingStats,
} from '@/src/core/application/use-cases/book-ratings';
import { CreateBookRatingDTO, UpdateBookRatingDTO, BookRatingStats } from '@/src/core/domain/repositories/IBookRatingRepository2';

export function useBookRatingsManager() {
  const [ratings, setRatings] = useState<BookRatingEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRatings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllBookRatings();
      setRatings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRatings(); }, [loadRatings]);

  const create = async (data: CreateBookRatingDTO) => { const r = await createBookRating(data); await loadRatings(); return r; };
  const update = async (id: string, data: UpdateBookRatingDTO) => { const r = await updateBookRating(id, data); await loadRatings(); return r; };
  const rate = async (data: CreateBookRatingDTO) => { const r = await rateBook(data); await loadRatings(); return r; };
  const remove = async (id: string) => { await deleteBookRating(id); await loadRatings(); };
  const getStats = async (bookId: string): Promise<BookRatingStats> => getBookRatingStats(bookId);

  return { ratings, loading, error, refresh: loadRatings, create, update, rate, remove, getStats };
}
