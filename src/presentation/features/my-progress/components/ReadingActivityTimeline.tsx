// src/presentation/features/my-progress/components/ReadingActivityTimeline.tsx
/**
 * ============================================
 * COMPONENTE: ReadingActivityTimeline
 * Timeline vertical de sesiones de lectura recientes
 * Estilo tarjeta con portada mini + info
 * ============================================
 */

'use client';

import React, { memo, useMemo } from 'react';
import { BookOpen, Clock, FileText } from 'lucide-react';
import { ReadingSession } from '@/src/infrastructure/repositories/my-progress/MyProgressRepository';

// ============================================
// HELPERS
// ============================================

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds < 60) return '<1m';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function getRelativeDay(dateStr: string, todayLabel: string, yesterdayLabel: string, daysAgoTemplate: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86400000);

  const dateKey = date.toISOString().split('T')[0];
  const todayKey = today.toISOString().split('T')[0];
  const yesterdayKey = yesterday.toISOString().split('T')[0];

  if (dateKey === todayKey) return todayLabel;
  if (dateKey === yesterdayKey) return yesterdayLabel;

  const diffDays = Math.floor((today.getTime() - date.getTime()) / 86400000);
  return daysAgoTemplate.replace('{n}', String(diffDays));
}

function getTimeStr(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

// ============================================
// SKELETON
// ============================================

export const ReadingActivityTimelineSkeleton: React.FC = memo(() => (
  <section className="px-4 py-5">
    <div className="container mx-auto max-w-3xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-white/30 rounded-full animate-pulse" />
        <div className="h-7 bg-white/30 rounded-xl w-48 animate-pulse" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white/30 rounded-2xl h-20 animate-pulse" />
        ))}
      </div>
    </div>
  </section>
));

ReadingActivityTimelineSkeleton.displayName = 'ReadingActivityTimelineSkeleton';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface ReadingActivityTimelineProps {
  sessions: ReadingSession[];
  onBookSelect: (bookId: string) => void;
  t: (key: string) => string;
  translationsLoading: boolean;
}

export const ReadingActivityTimeline: React.FC<ReadingActivityTimelineProps> = memo(
  ({ sessions, onBookSelect, t, translationsLoading }) => {
    const txt = (key: string, fallback: string) => translationsLoading ? fallback : t(key);

    // Agrupar sesiones por dia
    const groupedSessions = useMemo(() => {
      const groups = new Map<string, ReadingSession[]>();

      sessions.forEach(session => {
        const dayKey = new Date(session.startedAt).toISOString().split('T')[0];
        if (!groups.has(dayKey)) groups.set(dayKey, []);
        groups.get(dayKey)!.push(session);
      });

      return Array.from(groups.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .slice(0, 7); // Max 7 dias
    }, [sessions]);

    const todayLabel = txt('activity.today', 'Hoy');
    const yesterdayLabel = txt('activity.yesterday', 'Ayer');
    const daysAgoTemplate = txt('activity.days_ago', 'hace {n} dias');
    const readLabel = txt('activity.read', 'Leiste');
    const pagesLabel = txt('activity.pages', 'paginas de');
    const forLabel = txt('activity.for', 'durante');
    const sectionTitle = txt('sections.activity', 'Actividad Reciente');

    if (sessions.length === 0) {
      return null;
    }

    return (
      <section className="px-4 py-5">
        <div className="container mx-auto max-w-3xl">
          {/* Titulo */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <h2
              className="text-xl md:text-2xl font-black text-white drop-shadow-lg"
              style={{ fontFamily: 'Comic Sans MS, cursive', textShadow: '2px 2px 0px rgba(0,0,0,0.2)' }}
            >
              {sectionTitle}
            </h2>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            {groupedSessions.map(([dayKey, daySessions]) => (
              <div key={dayKey}>
                {/* Day header */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px flex-1 bg-white/20" />
                  <span
                    className="text-xs font-black text-white/70 px-3 py-1 bg-white/10 rounded-full"
                    style={{ fontFamily: 'Comic Sans MS, cursive' }}
                  >
                    {getRelativeDay(dayKey, todayLabel, yesterdayLabel, daysAgoTemplate)}
                  </span>
                  <div className="h-px flex-1 bg-white/20" />
                </div>

                {/* Sessions for day */}
                <div className="space-y-2">
                  {daySessions.map(session => (
                    <button
                      key={session.id}
                      onClick={() => onBookSelect(session.bookId)}
                      className="w-full flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2.5 border-2 border-white/50 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-200 text-left"
                    >
                      {/* Mini cover */}
                      <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-purple-100 border border-yellow-200">
                        {session.bookCoverUrl ? (
                          <img
                            src={session.bookCoverUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-blue-300" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-bold text-blue-800 truncate"
                          style={{ fontFamily: 'Comic Sans MS, cursive' }}
                        >
                          {session.bookTitle}
                        </p>
                        <p className="text-xs text-slate-500" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                          {readLabel}{' '}
                          <span className="font-bold text-blue-600">{session.pagesRead}</span>{' '}
                          {pagesLabel}
                          {session.durationSeconds && session.durationSeconds > 0 && (
                            <>
                              {' '}{forLabel}{' '}
                              <span className="font-bold text-purple-600">{formatDuration(session.durationSeconds)}</span>
                            </>
                          )}
                        </p>
                      </div>

                      {/* Time */}
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {getTimeStr(session.startedAt)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
);

ReadingActivityTimeline.displayName = 'ReadingActivityTimeline';
