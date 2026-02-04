// ============================================
// src/presentation/features/book-reviews/hooks/useBookReviewsManager.ts
// Hook para gestión de reseñas de libros
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookReviewEntity } from '@/src/core/domain/entities/BookReviewEntity';
import {
  getAllBookReviews,
  createBookReview,
  updateBookReview,
  approveReview,
  rejectReview,
  featureReview,
  unfeatureReview,
  softDeleteReview,
  restoreReview,
  hardDeleteReview,
} from '@/src/core/application/use-cases/book-reviews';
import { CreateBookReviewDTO, UpdateBookReviewDTO } from '@/src/core/domain/repositories/IBookReviewRepository';

export function useBookReviewsManager() {
  const [reviews, setReviews] = useState<BookReviewEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllBookReviews(true);
      setReviews(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const create = async (data: CreateBookReviewDTO) => { const r = await createBookReview(data); await loadReviews(); return r; };
  const update = async (id: string, data: UpdateBookReviewDTO) => { const r = await updateBookReview(id, data); await loadReviews(); return r; };
  const approve = async (id: string) => { await approveReview(id); await loadReviews(); };
  const reject = async (id: string) => { await rejectReview(id); await loadReviews(); };
  const feature = async (id: string) => { await featureReview(id); await loadReviews(); };
  const unfeature = async (id: string) => { await unfeatureReview(id); await loadReviews(); };
  const softDelete = async (id: string) => { await softDeleteReview(id); await loadReviews(); };
  const restore = async (id: string) => { await restoreReview(id); await loadReviews(); };
  const hardDelete = async (id: string) => { await hardDeleteReview(id); await loadReviews(); };

  return { reviews, loading, error, refresh: loadReviews, create, update, approve, reject, feature, unfeature, softDelete, restore, hardDelete };
}
