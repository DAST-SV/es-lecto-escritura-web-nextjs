/**
 * UBICACIÓN: app/[locale]/books/[id]/statistics/page.tsx
 * 📊 PÁGINA DE ESTADÍSTICAS COMPLETAS DEL LIBRO
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { 
  ArrowLeft, Loader2, Clock, TrendingUp, Users, Target,
  Zap, Calendar, Trophy, BarChart3
} from 'lucide-react';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { BookReadingAnalyticsService } from '@/src/infrastructure/services/books';
import { UnifiedLayout } from '@/src/presentation/features/navigation';

export default function BookStatisticsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();
  const bookId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [bookTitle, setBookTitle] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  
  // Datos de estadísticas
  const [userProgress, setUserProgress] = useState<any>(null);
  const [comparison, setComparison] = useState<any>(null);
  const [bookStats, setBookStats] = useState<any>(null);

  useEffect(() => {
    loadStatistics();
  }, [bookId]);

  async function loadStatistics() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push(`/${locale}/login`);
        return;
      }
      
      setUserId(user.id);

      // Cargar título del libro
      const { data: book } = await supabase
        .from('books')
        .select('title')
        .eq('id', bookId)
        .single();
      
      if (book) {
        setBookTitle(book.title);
      }

      // Cargar progreso del usuario
      const progress = await BookReadingAnalyticsService.getUserProgress(user.id, bookId);
      setUserProgress(progress);

      // Cargar comparación con otros lectores
      const comp = await BookReadingAnalyticsService.compareReadingTime(user.id, bookId);
      setComparison(comp);

      // Cargar estadísticas del libro
      const stats = await BookReadingAnalyticsService.getBookStatistics(bookId);
      setBookStats(stats);

      setIsLoading(false);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <UnifiedLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando estadísticas...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              Volver
            </button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <BarChart3 size={32} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Estadísticas de Lectura</h1>
                <p className="text-gray-600">{bookTitle}</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 1: TU PROGRESO */}
          {userProgress && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Target className="text-indigo-600" size={24} />
                Tu Progreso
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Completitud */}
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <div className="text-5xl font-bold text-green-600 mb-2">
                    {userProgress.completionPercentage.toFixed(0)}%
                  </div>
                  <p className="text-gray-700 font-medium">Completado</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {userProgress.currentPage} de {userProgress.totalPages} páginas
                  </p>
                </div>

                {/* Tiempo total */}
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="text-blue-600" size={24} />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {BookReadingAnalyticsService.formatDuration(userProgress.totalReadingTime)}
                  </div>
                  <p className="text-gray-700 font-medium">Tiempo de lectura</p>
                </div>

                {/* Última lectura */}
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calendar className="text-purple-600" size={24} />
                  </div>
                  <p className="text-sm text-gray-700 font-medium mb-1">Última lectura</p>
                  <p className="text-xs text-gray-600">
                    {BookReadingAnalyticsService.formatDate(userProgress.lastReadAt)}
                  </p>
                  {userProgress.isCompleted && (
                    <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      <Trophy size={14} />
                      Completado
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN 2: COMPARACIÓN CON OTROS */}
          {comparison && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="text-orange-600" size={24} />
                Comparación con Otros Lectores
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tu velocidad */}
                <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="text-orange-600" size={28} />
                    <div>
                      <p className="text-sm text-gray-600">Tu tiempo</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {BookReadingAnalyticsService.formatDuration(comparison.userTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Promedio de otros</p>
                    <p className="text-lg font-semibold text-gray-700">
                      {BookReadingAnalyticsService.formatDuration(comparison.avgTime)}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-orange-200">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">
                        {comparison.isFasterThanAverage ? '⚡ Más rápido' : '🐢 Más lento'}
                      </p>
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold">
                        {comparison.speedRank}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Percentil */}
                <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2">Tu velocidad supera al</p>
                  <div className="text-5xl font-bold text-indigo-600 mb-4">
                    {comparison.percentile.toFixed(0)}%
                  </div>
                  <p className="text-sm text-gray-700">de los lectores</p>

                  {/* Barra visual */}
                  <div className="mt-6">
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-1000"
                        style={{ width: `${comparison.percentile}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN 3: ESTADÍSTICAS DEL LIBRO */}
          {bookStats && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Users className="text-purple-600" size={24} />
                Estadísticas Generales del Libro
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <p className="text-3xl font-bold text-purple-600">{bookStats.totalReaders}</p>
                  <p className="text-sm text-gray-600 mt-1">Lectores totales</p>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <p className="text-3xl font-bold text-blue-600">{bookStats.activeReaders}</p>
                  <p className="text-sm text-gray-600 mt-1">Leyendo ahora</p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <p className="text-3xl font-bold text-green-600">{bookStats.completedReaders}</p>
                  <p className="text-sm text-gray-600 mt-1">Completado</p>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <p className="text-3xl font-bold text-orange-600">
                    {bookStats.avgCompletionRate.toFixed(0)}%
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Tasa promedio</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Página más leída</p>
                  <p className="text-2xl font-bold text-gray-900">Pág. {bookStats.mostViewedPage}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Tiempo promedio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {BookReadingAnalyticsService.formatDuration(bookStats.avgSessionDuration)}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Tasa de rebote</p>
                  <p className="text-2xl font-bold text-gray-900">{bookStats.bounceRate.toFixed(1)}%</p>
                </div>
              </div>

              {/* Dispositivos */}
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Dispositivos más usados</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-700">{bookStats.deviceBreakdown.desktop}</p>
                    <p className="text-xs text-gray-600">Desktop</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-700">{bookStats.deviceBreakdown.mobile}</p>
                    <p className="text-xs text-gray-600">Mobile</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-700">{bookStats.deviceBreakdown.tablet}</p>
                    <p className="text-xs text-gray-600">Tablet</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </UnifiedLayout>
  );
}