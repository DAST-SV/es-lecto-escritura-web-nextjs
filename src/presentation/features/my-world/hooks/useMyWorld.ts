// src/presentation/features/my-world/hooks/useMyWorld.ts
/**
 * ============================================
 * HOOK: useMyWorld
 * Orquesta carga de datos para Mi Mundo
 * Auth check, datos lector/escritor en paralelo
 * ============================================
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';
import {
  MyWorldRepository,
  MyWorldBook,
  AuthoredBook,
  MyWorldStats,
} from '@/src/infrastructure/repositories/my-world/MyWorldRepository';
import { LibraryBook } from '@/src/infrastructure/repositories/books/BookLibraryRepository';
import { MyWorldTab } from '../types/my-world.types';

const DEFAULT_STATS: MyWorldStats = {
  booksInProgress: 0,
  booksCompleted: 0,
  totalFavorites: 0,
  totalReadingTime: 0,
  totalAuthored: 0,
  totalPublished: 0,
  totalViews: 0,
};

export function useMyWorld() {
  const locale = useLocale();
  const router = useRouter();
  const { t, loading: translationsLoading } = useSupabaseTranslations('my_world');
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<MyWorldTab>('reader');
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Reader data
  const [booksInProgress, setBooksInProgress] = useState<MyWorldBook[]>([]);
  const [completedBooks, setCompletedBooks] = useState<MyWorldBook[]>([]);
  const [favoriteBooks, setFavoriteBooks] = useState<LibraryBook[]>([]);

  // Writer data
  const [authoredBooks, setAuthoredBooks] = useState<AuthoredBook[]>([]);
  const [trashCount, setTrashCount] = useState(0);

  // Stats
  const [stats, setStats] = useState<MyWorldStats>(DEFAULT_STATS);

  // 1. Obtener usuario autenticado
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        router.push(`/${locale}/auth/login`);
      }
    };
    getUser();
  }, [supabase, router, locale]);

  // 2. Cargar todos los datos en paralelo
  useEffect(() => {
    if (!userId) return;

    const loadAllData = async () => {
      setIsLoading(true);
      try {
        const [progress, completed, favorites, authored, userStats, trashRes] = await Promise.all([
          MyWorldRepository.getBooksInProgress(userId, locale),
          MyWorldRepository.getCompletedBooks(userId, locale),
          MyWorldRepository.getFavoriteBooks(userId, locale),
          MyWorldRepository.getAuthoredBooks(userId, locale),
          MyWorldRepository.getUserStats(userId),
          // Contar libros en papelera
          createClient()
            .schema('books')
            .from('books')
            .select('*', { count: 'exact', head: true })
            .eq('created_by', userId)
            .not('deleted_at', 'is', null),
        ]);

        setBooksInProgress(progress);
        setCompletedBooks(completed);
        setFavoriteBooks(favorites);
        setAuthoredBooks(authored);
        setStats(userStats);
        setTrashCount(trashRes.count || 0);
      } catch (err) {
        console.error('Error cargando Mi Mundo:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [userId, locale]);

  // Computed
  const publishedBooks = authoredBooks.filter(b => b.status === 'published');
  const draftBooks = authoredBooks.filter(b => b.status === 'draft' || b.status === 'pending');

  // Refresh authored books (after publish/unpublish)
  const refreshAuthoredBooks = useCallback(async () => {
    if (!userId) return;
    const authored = await MyWorldRepository.getAuthoredBooks(userId, locale);
    setAuthoredBooks(authored);
    const userStats = await MyWorldRepository.getUserStats(userId);
    setStats(userStats);
  }, [userId, locale]);

  return {
    locale,
    activeTab,
    setActiveTab,
    isLoading,
    translationsLoading,
    t,
    userId,
    // Reader
    booksInProgress,
    completedBooks,
    favoriteBooks,
    // Writer
    authoredBooks,
    publishedBooks,
    draftBooks,
    trashCount,
    refreshAuthoredBooks,
    // Stats
    stats,
  };
}
