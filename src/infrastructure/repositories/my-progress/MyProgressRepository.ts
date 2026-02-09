// src/infrastructure/repositories/my-progress/MyProgressRepository.ts
/**
 * ============================================
 * REPOSITORIO: MyProgressRepository
 * Queries para Mi Progreso
 * Completados, abandonados, sesiones, stats
 * ============================================
 */

import { createClient } from '@/src/infrastructure/config/supabase.config';
import { LibraryBook, mapBookFromView } from '@/src/infrastructure/repositories/books/BookLibraryRepository';
import { MyWorldBook } from '@/src/infrastructure/repositories/my-world/MyWorldRepository';

// ============================================
// TIPOS
// ============================================

export interface CompletedBook extends LibraryBook {
  completedAt: string | null;
  readingTimeSeconds: number;
  rating: number | null;
}

export interface AbandonedBook extends LibraryBook {
  completionPercentage: number;
  currentPage: number;
  lastReadAt: string | null;
  readingTimeSeconds: number;
  daysSinceLastRead: number;
}

export interface ReadingSession {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCoverUrl: string | null;
  startPage: number;
  endPage: number;
  pagesRead: number;
  durationSeconds: number | null;
  startedAt: string;
  endedAt: string | null;
}

export interface ProgressStats {
  totalBooksCompleted: number;
  totalBooksInProgress: number;
  totalBooksAbandoned: number;
  totalPagesRead: number;
  totalReadingTimeSeconds: number;
  averageSessionSeconds: number;
  currentStreak: number;
  longestStreak: number;
  booksThisMonth: number;
  favoriteCategory: string | null;
}

// ============================================
// REPOSITORIO
// ============================================

export class MyProgressRepository {

  // ============================================
  // LIBROS COMPLETADOS
  // ============================================

  static async getCompletedBooks(userId: string, locale: string = 'es', limit: number = 20): Promise<CompletedBook[]> {
    const supabase = createClient();

    // 1. Progreso completado
    const { data: progressData, error: progressError } = await supabase
      .schema('books')
      .from('reading_progress')
      .select('book_id, completion_percentage, completed_at, reading_time_seconds, last_read_at')
      .eq('user_id', userId)
      .eq('is_completed', true)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (progressError || !progressData?.length) return [];

    const bookIds = progressData.map(p => p.book_id);

    // 2. Datos de libros
    const { data: booksData, error: booksError } = await supabase
      .schema('books')
      .from('v_books_with_translations')
      .select('*')
      .in('id', bookIds);

    if (booksError || !booksData?.length) return [];

    // 3. Ratings del usuario
    const { data: ratingsData } = await supabase
      .schema('books')
      .from('book_ratings')
      .select('book_id, rating')
      .eq('user_id', userId)
      .in('book_id', bookIds);

    const ratingsMap = new Map((ratingsData || []).map((r: any) => [r.book_id, r.rating]));
    const progressMap = new Map(progressData.map(p => [p.book_id, p]));

    return booksData
      .map((book: any) => {
        const mapped = mapBookFromView(book, locale);
        const progress = progressMap.get(book.id);
        return {
          ...mapped,
          completedAt: progress?.completed_at || progress?.last_read_at || null,
          readingTimeSeconds: progress?.reading_time_seconds || 0,
          rating: ratingsMap.get(book.id) || null,
        } as CompletedBook;
      })
      .sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  // ============================================
  // LIBROS ABANDONADOS (>7 dias sin leer, <100%)
  // ============================================

  static async getAbandonedBooks(userId: string, locale: string = 'es', limit: number = 15): Promise<AbandonedBook[]> {
    const supabase = createClient();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: progressData, error: progressError } = await supabase
      .schema('books')
      .from('reading_progress')
      .select('book_id, current_page, completion_percentage, is_completed, last_read_at, reading_time_seconds')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .lt('last_read_at', sevenDaysAgo)
      .order('last_read_at', { ascending: false })
      .limit(limit);

    if (progressError || !progressData?.length) return [];

    const bookIds = progressData.map(p => p.book_id);

    const { data: booksData, error: booksError } = await supabase
      .schema('books')
      .from('v_books_with_translations')
      .select('*')
      .in('id', bookIds);

    if (booksError || !booksData?.length) return [];

    const progressMap = new Map(progressData.map(p => [p.book_id, p]));
    const now = Date.now();

    return booksData
      .map((book: any) => {
        const mapped = mapBookFromView(book, locale);
        const progress = progressMap.get(book.id);
        const lastRead = progress?.last_read_at ? new Date(progress.last_read_at).getTime() : 0;
        const daysSince = lastRead ? Math.floor((now - lastRead) / (1000 * 60 * 60 * 24)) : 999;

        return {
          ...mapped,
          completionPercentage: Number(progress?.completion_percentage) || 0,
          currentPage: progress?.current_page || 1,
          lastReadAt: progress?.last_read_at || null,
          readingTimeSeconds: progress?.reading_time_seconds || 0,
          daysSinceLastRead: daysSince,
        } as AbandonedBook;
      })
      .sort((a, b) => a.daysSinceLastRead - b.daysSinceLastRead);
  }

  // ============================================
  // SESIONES DE LECTURA RECIENTES
  // ============================================

  static async getRecentSessions(userId: string, locale: string = 'es', limit: number = 20): Promise<ReadingSession[]> {
    const supabase = createClient();

    const { data: sessionsData, error: sessionsError } = await supabase
      .schema('books')
      .from('reading_sessions')
      .select('id, book_id, start_page, end_page, pages_read, duration_seconds, started_at, ended_at')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (sessionsError || !sessionsData?.length) return [];

    // Obtener info de los libros
    const bookIds = [...new Set(sessionsData.map(s => s.book_id))];

    const { data: booksData } = await supabase
      .schema('books')
      .from('v_books_with_translations')
      .select('*')
      .in('id', bookIds);

    const booksMap = new Map(
      (booksData || []).map((b: any) => {
        const mapped = mapBookFromView(b, locale);
        return [b.id, { title: mapped.title, coverUrl: mapped.coverUrl }];
      })
    );

    return sessionsData.map((s: any) => {
      const bookInfo = booksMap.get(s.book_id);
      return {
        id: s.id,
        bookId: s.book_id,
        bookTitle: bookInfo?.title || 'Libro',
        bookCoverUrl: bookInfo?.coverUrl || null,
        startPage: s.start_page,
        endPage: s.end_page,
        pagesRead: s.pages_read || (s.end_page - s.start_page + 1),
        durationSeconds: s.duration_seconds,
        startedAt: s.started_at,
        endedAt: s.ended_at,
      };
    });
  }

  // ============================================
  // ESTADISTICAS COMPLETAS
  // ============================================

  static async getProgressStats(userId: string): Promise<ProgressStats> {
    const supabase = createClient();

    const [progressRes, sessionsRes, favRes] = await Promise.all([
      // Progreso de lectura
      supabase
        .schema('books')
        .from('reading_progress')
        .select('book_id, is_completed, reading_time_seconds, total_pages_read, completed_at, last_read_at')
        .eq('user_id', userId),
      // Sesiones del ultimo mes
      supabase
        .schema('books')
        .from('reading_sessions')
        .select('id, duration_seconds, started_at, pages_read')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(100),
      // Favoritos (para categoria favorita)
      supabase
        .schema('books')
        .from('favorites')
        .select('book_id')
        .eq('user_id', userId),
    ]);

    const progressData = progressRes.data || [];
    const sessionsData = sessionsRes.data || [];

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const totalBooksCompleted = progressData.filter((p: any) => p.is_completed).length;
    const activeBooks = progressData.filter((p: any) => !p.is_completed);
    const totalBooksInProgress = activeBooks.filter((p: any) =>
      p.last_read_at && p.last_read_at >= sevenDaysAgo
    ).length;
    const totalBooksAbandoned = activeBooks.filter((p: any) =>
      !p.last_read_at || p.last_read_at < sevenDaysAgo
    ).length;

    const totalPagesRead = progressData.reduce((sum: number, p: any) => sum + (p.total_pages_read || 0), 0);
    const totalReadingTimeSeconds = progressData.reduce((sum: number, p: any) => sum + (p.reading_time_seconds || 0), 0);

    // Promedio por sesion
    const sessionsWithDuration = sessionsData.filter((s: any) => s.duration_seconds > 0);
    const averageSessionSeconds = sessionsWithDuration.length > 0
      ? Math.round(sessionsWithDuration.reduce((sum: number, s: any) => sum + s.duration_seconds, 0) / sessionsWithDuration.length)
      : 0;

    // Racha de lectura (dias consecutivos)
    const { currentStreak, longestStreak } = calculateStreaks(sessionsData);

    // Libros completados este mes
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const booksThisMonth = progressData.filter((p: any) =>
      p.is_completed && p.completed_at && new Date(p.completed_at) >= startOfMonth
    ).length;

    return {
      totalBooksCompleted,
      totalBooksInProgress,
      totalBooksAbandoned,
      totalPagesRead,
      totalReadingTimeSeconds,
      averageSessionSeconds,
      currentStreak,
      longestStreak,
      booksThisMonth,
      favoriteCategory: null, // se podria calcular con join extra
    };
  }
}

// ============================================
// HELPER: Calcular rachas de lectura
// ============================================

function calculateStreaks(sessions: any[]): { currentStreak: number; longestStreak: number } {
  if (!sessions.length) return { currentStreak: 0, longestStreak: 0 };

  // Obtener dias unicos con actividad
  const uniqueDays = new Set(
    sessions
      .filter((s: any) => s.started_at)
      .map((s: any) => new Date(s.started_at).toISOString().split('T')[0])
  );

  if (uniqueDays.size === 0) return { currentStreak: 0, longestStreak: 0 };

  const sortedDays = Array.from(uniqueDays).sort().reverse(); // mas reciente primero
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  // Verificar racha actual (debe incluir hoy o ayer)
  const startsFromRecent = sortedDays[0] === today || sortedDays[0] === yesterday;

  const chronological = [...sortedDays].reverse(); // orden cronologico

  for (let i = 1; i < chronological.length; i++) {
    const prevDate = new Date(chronological[i - 1]);
    const currDate = new Date(chronological[i]);
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / 86400000);

    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Racha actual: contar hacia atras desde hoy/ayer
  if (startsFromRecent) {
    currentStreak = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const prevDate = new Date(sortedDays[i - 1]);
      const currDate = new Date(sortedDays[i]);
      const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / 86400000);

      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
}
