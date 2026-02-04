// ============================================
// src/presentation/features/favorites/hooks/useFavoritesManager.ts
// Hook para gestión de favoritos
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { FavoriteEntity } from '@/src/core/domain/entities/FavoriteEntity';
import {
  getAllFavorites,
  addToFavorites,
  toggleFavorite,
  removeFavorite,
  checkIsFavorite,
} from '@/src/core/application/use-cases/favorites';
import { CreateFavoriteDTO } from '@/src/core/domain/repositories/IFavoriteRepository';

export function useFavoritesManager() {
  const [favorites, setFavorites] = useState<FavoriteEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllFavorites();
      setFavorites(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFavorites(); }, [loadFavorites]);

  const add = async (data: CreateFavoriteDTO) => { const r = await addToFavorites(data); await loadFavorites(); return r; };
  const toggle = async (bookId: string, userId: string) => { const r = await toggleFavorite(bookId, userId); await loadFavorites(); return r; };
  const remove = async (id: string) => { await removeFavorite(id); await loadFavorites(); };
  const isFavorite = async (bookId: string, userId: string) => checkIsFavorite(bookId, userId);

  return { favorites, loading, error, refresh: loadFavorites, add, toggle, remove, isFavorite };
}
