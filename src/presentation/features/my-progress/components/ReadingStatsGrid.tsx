// src/presentation/features/my-progress/components/ReadingStatsGrid.tsx
/**
 * ============================================
 * COMPONENTE: ReadingStatsGrid
 * Dashboard de estadisticas de lectura
 * Cards con iconos y metricas coloridas
 * ============================================
 */

'use client';

import React, { memo } from 'react';
import {
  CheckCircle,
  BookOpen,
  Pause,
  FileText,
  Clock,
  Timer,
  Flame,
  Trophy,
  CalendarCheck,
} from 'lucide-react';
import { ProgressStats } from '@/src/infrastructure/repositories/my-progress/MyProgressRepository';

// ============================================
// SKELETON
// ============================================

export const ReadingStatsGridSkeleton: React.FC = memo(() => (
  <section className="px-4 py-4">
    <div className="container mx-auto max-w-5xl">
      <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-9 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
          <div key={i} className="bg-white/30 rounded-2xl p-4 animate-pulse h-24" />
        ))}
      </div>
    </div>
  </section>
));

ReadingStatsGridSkeleton.displayName = 'ReadingStatsGridSkeleton';

// ============================================
// HELPERS
// ============================================

function formatReadingTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

// ============================================
// STAT CARD
// ============================================

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  colorBg: string;
  colorText: string;
  colorIcon: string;
  colorBorder: string;
}

const StatCard: React.FC<StatCardProps> = memo(
  ({ icon, value, label, colorBg, colorText, colorIcon, colorBorder }) => (
    <div className={`${colorBg} backdrop-blur-sm rounded-2xl p-3 border-2 ${colorBorder} shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
      <div className={`${colorIcon} mb-1.5`}>{icon}</div>
      <p
        className={`text-xl md:text-2xl font-black ${colorText} leading-none`}
        style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
      >
        {value}
      </p>
      <p
        className={`text-xs font-bold ${colorText} opacity-70 mt-0.5 leading-tight`}
        style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
      >
        {label}
      </p>
    </div>
  )
);

StatCard.displayName = 'StatCard';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface ReadingStatsGridProps {
  stats: ProgressStats;
  t: (key: string) => string;
  translationsLoading: boolean;
}

export const ReadingStatsGrid: React.FC<ReadingStatsGridProps> = memo(({ stats, t, translationsLoading }) => {
  const txt = (key: string, fallback: string) => translationsLoading ? fallback : t(key);

  const items: StatCardProps[] = [
    {
      icon: <CheckCircle className="w-5 h-5" />,
      value: stats.totalBooksCompleted,
      label: txt('stats.completed', 'Completados'),
      colorBg: 'bg-emerald-50/95',
      colorText: 'text-emerald-700',
      colorIcon: 'text-emerald-500',
      colorBorder: 'border-emerald-200',
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      value: stats.totalBooksInProgress,
      label: txt('stats.in_progress', 'En progreso'),
      colorBg: 'bg-blue-50/95',
      colorText: 'text-blue-700',
      colorIcon: 'text-blue-500',
      colorBorder: 'border-blue-200',
    },
    {
      icon: <Pause className="w-5 h-5" />,
      value: stats.totalBooksAbandoned,
      label: txt('stats.abandoned', 'Pausados'),
      colorBg: 'bg-amber-50/95',
      colorText: 'text-amber-700',
      colorIcon: 'text-amber-500',
      colorBorder: 'border-amber-200',
    },
    {
      icon: <FileText className="w-5 h-5" />,
      value: stats.totalPagesRead,
      label: txt('stats.pages_read', 'Paginas leidas'),
      colorBg: 'bg-purple-50/95',
      colorText: 'text-purple-700',
      colorIcon: 'text-purple-500',
      colorBorder: 'border-purple-200',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      value: formatReadingTime(stats.totalReadingTimeSeconds),
      label: txt('stats.reading_time', 'Tiempo leyendo'),
      colorBg: 'bg-cyan-50/95',
      colorText: 'text-cyan-700',
      colorIcon: 'text-cyan-500',
      colorBorder: 'border-cyan-200',
    },
    {
      icon: <Timer className="w-5 h-5" />,
      value: formatReadingTime(stats.averageSessionSeconds),
      label: txt('stats.avg_session', 'Promedio/sesion'),
      colorBg: 'bg-indigo-50/95',
      colorText: 'text-indigo-700',
      colorIcon: 'text-indigo-500',
      colorBorder: 'border-indigo-200',
    },
    {
      icon: <Flame className="w-5 h-5" />,
      value: `${stats.currentStreak} ${txt('stats.days', 'dias')}`,
      label: txt('stats.streak', 'Racha actual'),
      colorBg: stats.currentStreak > 0 ? 'bg-orange-50/95' : 'bg-gray-50/95',
      colorText: stats.currentStreak > 0 ? 'text-orange-700' : 'text-gray-500',
      colorIcon: stats.currentStreak > 0 ? 'text-orange-500' : 'text-gray-400',
      colorBorder: stats.currentStreak > 0 ? 'border-orange-200' : 'border-gray-200',
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      value: `${stats.longestStreak} ${txt('stats.days', 'dias')}`,
      label: txt('stats.best_streak', 'Mejor racha'),
      colorBg: 'bg-yellow-50/95',
      colorText: 'text-yellow-700',
      colorIcon: 'text-yellow-500',
      colorBorder: 'border-yellow-200',
    },
    {
      icon: <CalendarCheck className="w-5 h-5" />,
      value: `${stats.booksThisMonth} ${txt('stats.books', 'libros')}`,
      label: txt('stats.this_month', 'Este mes'),
      colorBg: 'bg-pink-50/95',
      colorText: 'text-pink-700',
      colorIcon: 'text-pink-500',
      colorBorder: 'border-pink-200',
    },
  ];

  return (
    <section className="px-4 py-4">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-9 gap-3">
          {items.map((item, i) => (
            <StatCard key={i} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
});

ReadingStatsGrid.displayName = 'ReadingStatsGrid';
