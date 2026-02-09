/**
 * UBICACION: app/[locale]/my-progress/page.tsx
 * Mi Progreso - Dashboard de lectura del usuario
 * Stats, completados, pausados, timeline de actividad
 * Estilo consistente con HomePage y Mi Mundo
 */

'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  CheckCircle,
  Pause,
  BookOpen,
  Rocket,
} from 'lucide-react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { HomeBackground } from '@/src/presentation/features/home';
import { useMyProgress } from '@/src/presentation/features/my-progress/hooks/useMyProgress';
import { MyProgressHero, MyProgressHeroSkeleton } from '@/src/presentation/features/my-progress/components/MyProgressHero';
import { ReadingStatsGrid, ReadingStatsGridSkeleton } from '@/src/presentation/features/my-progress/components/ReadingStatsGrid';
import { CompletedBookCard } from '@/src/presentation/features/my-progress/components/CompletedBookCard';
import { AbandonedBookCard } from '@/src/presentation/features/my-progress/components/AbandonedBookCard';
import { ReadingActivityTimeline, ReadingActivityTimelineSkeleton } from '@/src/presentation/features/my-progress/components/ReadingActivityTimeline';
import { MyWorldCarouselRow, MyWorldCarouselRowSkeleton } from '@/src/presentation/features/my-world/components/MyWorldCarouselRow';

// ============================================
// PAGE SKELETON
// ============================================

function MyProgressPageSkeleton() {
  return (
    <UnifiedLayout
      className="bg-gradient-to-b from-blue-400 via-blue-300 to-cyan-200"
      mainClassName="pt-0"
      backgroundComponent={<HomeBackground />}
    >
      <MyProgressHeroSkeleton />
      <ReadingStatsGridSkeleton />
      <MyWorldCarouselRowSkeleton />
      <MyWorldCarouselRowSkeleton />
      <ReadingActivityTimelineSkeleton />
    </UnifiedLayout>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function MyProgressPage() {
  const router = useRouter();
  const locale = useLocale();

  const {
    isLoading,
    translationsLoading,
    t,
    completedBooks,
    abandonedBooks,
    recentSessions,
    stats,
    goToBook,
  } = useMyProgress();

  const txt = useCallback((key: string, fallback: string) =>
    translationsLoading ? fallback : t(key), [translationsLoading, t]);

  // Labels para CompletedBookCard
  const completedCardLabels = {
    readAgain: txt('card.read_again', 'Releer'),
    completedOn: txt('card.completed_on', 'Completado'),
    timeSpent: txt('card.time_spent', 'Tiempo'),
    noRating: txt('card.no_rating', 'Sin calificar'),
  };

  // Labels para AbandonedBookCard
  const abandonedCardLabels = {
    resume: txt('card.resume', 'Retomar'),
    daysAgo: txt('card.days_ago', 'dias sin leer'),
    progress: txt('card.progress', 'progreso'),
  };

  // ============================================
  // LOADING
  // ============================================

  if (isLoading) {
    return <MyProgressPageSkeleton />;
  }

  // ============================================
  // EMPTY STATE (sin ningun dato)
  // ============================================

  const hasAnyData = completedBooks.length > 0 || abandonedBooks.length > 0 || recentSessions.length > 0 ||
    stats.totalBooksCompleted > 0 || stats.totalPagesRead > 0;

  if (!hasAnyData) {
    return (
      <UnifiedLayout
        className="bg-gradient-to-b from-blue-400 via-blue-300 to-cyan-200"
        mainClassName="pt-0"
        backgroundComponent={<HomeBackground />}
      >
        <MyProgressHero t={t} translationsLoading={translationsLoading} />

        <div className="text-center py-16 px-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 border-4 border-yellow-300 shadow-xl max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Rocket size={48} className="text-emerald-500" />
            </div>
            <h3
              className="text-2xl font-black text-blue-700 mb-2"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              {txt('empty.main_title', 'Comienza tu viaje')}
            </h3>
            <p
              className="text-blue-600 mb-6 font-medium"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              {txt('empty.main_subtitle', 'Lee tu primer libro y vuelve aqui para ver tu progreso')}
            </p>
            <button
              onClick={() => router.push(`/${locale}/library`)}
              className="px-8 py-3.5 bg-yellow-300 text-blue-700 font-black rounded-full shadow-xl hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-105 border-2 border-white"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              {txt('empty.explore_library', 'Explorar biblioteca')}
            </button>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <UnifiedLayout
      className="bg-gradient-to-b from-blue-400 via-blue-300 to-cyan-200"
      mainClassName="pt-0"
      backgroundComponent={<HomeBackground />}
    >
      {/* Hero */}
      <MyProgressHero t={t} translationsLoading={translationsLoading} />

      {/* Stats Dashboard */}
      <ReadingStatsGrid stats={stats} t={t} translationsLoading={translationsLoading} />

      {/* Libros Completados */}
      <MyWorldCarouselRow
        title={txt('sections.completed', 'Libros Completados')}
        icon={<CheckCircle className="w-4 h-4 text-white" />}
        isEmpty={completedBooks.length === 0}
        emptyMessage={txt('empty.completed_subtitle', 'Cuando termines un libro aparecera aqui')}
        emptyIcon={<CheckCircle className="w-10 h-10 text-white/50" />}
        previousLabel={txt('carousel.previous', 'Anterior')}
        nextLabel={txt('carousel.next', 'Siguiente')}
      >
        {completedBooks.map((book, i) => (
          <CompletedBookCard
            key={book.id}
            book={book}
            onSelect={goToBook}
            locale={locale}
            labels={completedCardLabels}
            priority={i < 4}
          />
        ))}
      </MyWorldCarouselRow>

      {/* Libros Pausados */}
      <MyWorldCarouselRow
        title={txt('sections.abandoned', 'Libros Pausados')}
        icon={<Pause className="w-4 h-4 text-white" />}
        isEmpty={abandonedBooks.length === 0}
        emptyMessage={txt('empty.abandoned_subtitle', 'Los libros sin actividad reciente apareceran aqui')}
        emptyIcon={<BookOpen className="w-10 h-10 text-white/50" />}
        previousLabel={txt('carousel.previous', 'Anterior')}
        nextLabel={txt('carousel.next', 'Siguiente')}
      >
        {abandonedBooks.map((book, i) => (
          <AbandonedBookCard
            key={book.id}
            book={book}
            onSelect={goToBook}
            labels={abandonedCardLabels}
            priority={i < 4}
          />
        ))}
      </MyWorldCarouselRow>

      {/* Timeline de Actividad */}
      <ReadingActivityTimeline
        sessions={recentSessions}
        onBookSelect={goToBook}
        t={t}
        translationsLoading={translationsLoading}
      />

      {/* Bottom spacing */}
      <div className="pb-12" />
    </UnifiedLayout>
  );
}
