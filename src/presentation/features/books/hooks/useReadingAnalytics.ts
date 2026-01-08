/**
 * UBICACIÓN: src/presentation/features/books/hooks/useReadingAnalytics.ts
 * 🎯 Hook para integrar Analytics en el lector de libros
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { BookReadingAnalyticsService } from '@/src/infrastructure/services/BookReadingAnalytics.service';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

interface UseReadingAnalyticsProps {
  bookId: string;
  totalPages: number;
  userId?: string;
  onComplete?: () => void;
}

export function useReadingAnalytics({
  bookId,
  totalPages,
  userId,
  onComplete,
}: UseReadingAnalyticsProps) {
  const router = useRouter();
  const locale = useLocale();
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const sessionStartTimeRef = useRef<number>(Date.now());
  const lastPageRef = useRef<number>(1);

  // ============================================
  // INICIAR SESIÓN AL MONTAR
  // ============================================
  useEffect(() => {
    async function initSession() {
      try {
        const newSessionId = await BookReadingAnalyticsService.startSession(
          bookId,
          totalPages,
          userId
        );
        setSessionId(newSessionId);
        setIsTracking(true);
        
        console.log('📖 Analytics iniciado:', newSessionId);
      } catch (error) {
        console.error('❌ Error iniciando analytics:', error);
      }
    }

    initSession();

    // Cleanup al desmontar
    return () => {
      if (sessionId) {
        handleEndSession();
      }
    };
  }, [bookId]);

  // ============================================
  // TRACK CAMBIO DE PÁGINA
  // ============================================
  const trackPageChange = useCallback(async (newPage: number) => {
    if (!sessionId || !isTracking) return;

    try {
      // Guardar duración de la página anterior
      if (lastPageRef.current !== newPage) {
        await BookReadingAnalyticsService.trackPageDuration(
          sessionId,
          lastPageRef.current
        );
      }

      // Registrar vista de nueva página
      await BookReadingAnalyticsService.trackPageView(sessionId, newPage);
      
      setCurrentPage(newPage);
      lastPageRef.current = newPage;

      // Actualizar progreso del usuario (cada 5 páginas o al completar)
      if (userId && (newPage % 5 === 0 || newPage === totalPages)) {
        const elapsedSeconds = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
        await BookReadingAnalyticsService.updateUserProgress(
          userId,
          bookId,
          newPage,
          totalPages,
          elapsedSeconds
        );
      }

      // Si completó el libro
      if (newPage === totalPages && userId) {
        await handleBookCompletion();
      }

    } catch (error) {
      console.error('❌ Error tracking página:', error);
    }
  }, [sessionId, userId, bookId, totalPages, isTracking]);

  // ============================================
  // COMPLETAR LIBRO
  // ============================================
  const handleBookCompletion = async () => {
    if (!userId) return;

    try {
      await BookReadingAnalyticsService.markBookAsCompleted(userId, bookId);
      console.log('🎉 Libro completado!');
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('❌ Error marcando completado:', error);
    }
  };

  // ============================================
  // FINALIZAR SESIÓN
  // ============================================
  const handleEndSession = async () => {
    if (!sessionId) return;

    try {
      // Guardar duración de la última página vista
      await BookReadingAnalyticsService.trackPageDuration(
        sessionId,
        lastPageRef.current
      );

      // Finalizar sesión
      await BookReadingAnalyticsService.endSession(sessionId);
      
      setIsTracking(false);
      console.log('✅ Sesión de lectura finalizada');
    } catch (error) {
      console.error('❌ Error finalizando sesión:', error);
    }
  };

  // ============================================
  // NAVEGAR A ESTADÍSTICAS
  // ============================================
  const goToStatistics = useCallback(() => {
    router.push(`/${locale}/books/${bookId}/statistics`);
  }, [bookId, locale, router]);

  return {
    sessionId,
    isTracking,
    currentPage,
    trackPageChange,
    handleEndSession,
    goToStatistics,
  };
}