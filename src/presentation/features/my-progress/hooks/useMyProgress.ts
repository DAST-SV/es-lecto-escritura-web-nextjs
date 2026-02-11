// src/presentation/features/my-progress/hooks/useMyProgress.ts
/**
 * ============================================
 * HOOK: useMyProgress
 * Orquesta carga de datos para Mi Progreso
 * Auth check, completados, abandonados, sesiones, stats
 * ============================================
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';
import {
  MyProgressRepository,
  CompletedBook,
  AbandonedBook,
  ReadingSession,
  ProgressStats,
} from '@/src/infrastructure/repositories/my-progress/MyProgressRepository';

const DEFAULT_STATS: ProgressStats = {
  totalBooksCompleted: 0,
  totalBooksInProgress: 0,
  totalBooksAbandoned: 0,
  totalPagesRead: 0,
  totalReadingTimeSeconds: 0,
  averageSessionSeconds: 0,
  currentStreak: 0,
  longestStreak: 0,
  booksThisMonth: 0,
  favoriteCategory: null,
};

export function useMyProgress() {
  const locale = useLocale();
  const router = useRouter();
  const { t, loading: translationsLoading } = useSupabaseTranslations('my_progress');
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Data
  const [completedBooks, setCompletedBooks] = useState<CompletedBook[]>([]);
  const [abandonedBooks, setAbandonedBooks] = useState<AbandonedBook[]>([]);
  const [recentSessions, setRecentSessions] = useState<ReadingSession[]>([]);
  const [stats, setStats] = useState<ProgressStats>(DEFAULT_STATS);

  // 1. Auth check
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('❌ Error auth:', error);
          router.push(`/${locale}/auth/login`);
          return;
        }
        if (user) {
          setUserId(user.id);
        } else {
          router.push(`/${locale}/auth/login`);
        }
      } catch (err) {
        console.error('❌ Error obteniendo usuario:', err);
        router.push(`/${locale}/auth/login`);
      }
    };
    getUser();
  }, [supabase, router, locale]);

  // 2. Load all data in parallel
  useEffect(() => {
    if (!userId) return;

    const loadAllData = async () => {
      setIsLoading(true);
      try {
        const [completed, abandoned, sessions, progressStats] = await Promise.all([
          MyProgressRepository.getCompletedBooks(userId, locale),
          MyProgressRepository.getAbandonedBooks(userId, locale),
          MyProgressRepository.getRecentSessions(userId, locale),
          MyProgressRepository.getProgressStats(userId),
        ]);

        setCompletedBooks(completed);
        setAbandonedBooks(abandoned);
        setRecentSessions(sessions);
        setStats(progressStats);
      } catch (err) {
        console.error('Error cargando Mi Progreso:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [userId, locale]);

  // Navigate to book
  const goToBook = useCallback((bookId: string) => {
    router.push(`/${locale}/library/read/${bookId}`);
  }, [router, locale]);

  return {
    locale,
    isLoading,
    translationsLoading,
    t,
    userId,
    completedBooks,
    abandonedBooks,
    recentSessions,
    stats,
    goToBook,
  };
}
