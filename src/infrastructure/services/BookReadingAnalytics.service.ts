/**
 * UBICACIÓN: src/infrastructure/services/BookReadingAnalytics.service.ts
 * 📊 SISTEMA DE ANALYTICS - USANDO SUPABASE ADMIN COMO BOOKREPOSITORY
 */

import { createClient } from '@/src/utils/supabase/client';

// ============================================
// INTERFACES
// ============================================

export interface ReadingSession {
  sessionId: string;
  bookId: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  totalPages: number;
  pagesVisited: number[];
  currentPage: number;
  deviceType: 'desktop' | 'mobile' | 'tablet';
}

export interface UserProgress {
  userId: string;
  bookId: string;
  currentPage: number;
  totalPages: number;
  completionPercentage: number;
  totalReadingTime: number;
  isCompleted: boolean;
  lastReadAt: Date;
}

export interface BookStatistics {
  bookId: string;
  totalReaders: number;
  activeReaders: number;
  completedReaders: number;
  avgCompletionRate: number;
  avgSessionDuration: number;
  totalReadingTime: number;
  mostViewedPage: number;
  bounceRate: number;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
}

export interface ReadingComparison {
  userTime: number;
  avgTime: number;
  percentile: number;
  isFasterThanAverage: boolean;
  speedRank: string;
}

// ============================================
// CLASE PRINCIPAL
// ============================================

export class BookReadingAnalyticsService {
  private static supabase = createClient();
  private static activeSessions = new Map<string, ReadingSession>();
  private static pageStartTimes = new Map<string, Date>();

  // ============================================
  // 1. GESTIÓN DE SESIONES
  // ============================================

  static async startSession(
    bookId: string,
    totalPages: number,
    userId?: string
  ): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: ReadingSession = {
      sessionId,
      bookId,
      userId,
      startTime: new Date(),
      totalPages,
      pagesVisited: [],
      currentPage: 1,
      deviceType: this.detectDeviceType(),
    };

    this.activeSessions.set(sessionId, session);
    console.log('📖 Sesión iniciada:', sessionId);
    return sessionId;
  }

  static async endSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      console.warn('⚠️ Sesión no encontrada:', sessionId);
      return;
    }

    session.endTime = new Date();
    const durationSeconds = Math.floor(
      (session.endTime.getTime() - session.startTime.getTime()) / 1000
    );

    const uniquePagesVisited = new Set(session.pagesVisited);
    const completionPercentage = (uniquePagesVisited.size / session.totalPages) * 100;

    try {
      // ✅ USANDO EL MISMO PATRÓN QUE BOOKREPOSITORY
      const { error } = await this.supabase
        
        .from('book_reading_sessions')
        .insert({
          book_id: session.bookId,
          user_id: session.userId || null,
          session_id: sessionId,
          started_at: session.startTime.toISOString(),
          ended_at: session.endTime.toISOString(),
          duration_seconds: durationSeconds,
          total_pages: session.totalPages,
          pages_read: session.pagesVisited.length,
          unique_pages: uniquePagesVisited.size,
          completion_percentage: completionPercentage,
          device_type: session.deviceType,
        });

      if (error) {
        console.error('❌ Error guardando sesión:', error.message, error);
        throw error;
      }

      console.log('✅ Sesión guardada:', sessionId);

      if (session.userId && completionPercentage === 100) {
        await this.markBookAsCompleted(session.userId, session.bookId);
      }

      this.activeSessions.delete(sessionId);

    } catch (error: any) {
      console.error('❌ Error en endSession:', error.message || error);
      throw error;
    }
  }

  // ============================================
  // 2. TRACKING DE PÁGINAS
  // ============================================

  static async trackPageView(
    sessionId: string,
    pageNumber: number
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.currentPage = pageNumber;
    if (!session.pagesVisited.includes(pageNumber)) {
      session.pagesVisited.push(pageNumber);
    }

    const pageKey = `${sessionId}_${pageNumber}`;
    this.pageStartTimes.set(pageKey, new Date());

    console.log(`📄 Página ${pageNumber} vista`);
  }

  static async trackPageDuration(
    sessionId: string,
    pageNumber: number
  ): Promise<void> {
    const pageKey = `${sessionId}_${pageNumber}`;
    const startTime = this.pageStartTimes.get(pageKey);
    
    if (!startTime) return;

    const endTime = new Date();
    const durationSeconds = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000
    );

    if (durationSeconds < 1 || durationSeconds > 600) {
      this.pageStartTimes.delete(pageKey);
      return;
    }

    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    try {
      const { error } = await this.supabase
        
        .from('book_page_views')
        .insert({
          book_id: session.bookId,
          session_id: sessionId,
          page_number: pageNumber,
          viewed_at: startTime.toISOString(),
          duration_seconds: durationSeconds,
        });

      if (error) {
        console.error('❌ Error guardando duración:', error.message, error);
      } else {
        console.log(`⏱️ Página ${pageNumber}: ${durationSeconds}s`);
      }
      
      this.pageStartTimes.delete(pageKey);

    } catch (error: any) {
      console.error('❌ Error en trackPageDuration:', error.message || error);
    }
  }

  // ============================================
  // 3. PROGRESO DEL USUARIO
  // ============================================

  static async updateUserProgress(
    userId: string,
    bookId: string,
    currentPage: number,
    totalPages: number,
    readingTimeSeconds: number
  ): Promise<void> {
    const completionPercentage = (currentPage / totalPages) * 100;

    try {
      // ✅ Verificar si existe
      const { data: existing, error: fetchError } = await this.supabase
        
        .from('user_book_progress')
        .select('id, total_reading_time, completed_at')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ Error verificando progreso:', fetchError.message, fetchError);
        throw fetchError;
      }

      const isCompleted = completionPercentage >= 100;
      const now = new Date().toISOString();

      if (existing) {
        // Actualizar
        const newTotalTime = (existing.total_reading_time || 0) + readingTimeSeconds;
        
        const { error: updateError } = await this.supabase
          
          .from('user_book_progress')
          .update({
            current_page: currentPage,
            total_pages: totalPages,
            completion_percentage: completionPercentage,
            is_completed: isCompleted,
            total_reading_time: newTotalTime,
            last_read_at: now,
            ...(isCompleted && !existing.completed_at ? { completed_at: now } : {})
          })
          .eq('user_id', userId)
          .eq('book_id', bookId);

        if (updateError) {
          console.error('❌ Error actualizando progreso:', updateError.message, updateError);
          throw updateError;
        }
      } else {
        // Insertar
        const { error: insertError } = await this.supabase
          
          .from('user_book_progress')
          .insert({
            user_id: userId,
            book_id: bookId,
            current_page: currentPage,
            total_pages: totalPages,
            completion_percentage: completionPercentage,
            is_completed: isCompleted,
            total_reading_time: readingTimeSeconds,
            last_read_at: now,
            ...(isCompleted ? { completed_at: now } : {})
          });

        if (insertError) {
          console.error('❌ Error insertando progreso:', insertError.message, insertError);
          throw insertError;
        }
      }

      console.log('✅ Progreso actualizado');

    } catch (error: any) {
      console.error('❌ Error en updateUserProgress:', error.message || error);
      throw error;
    }
  }

  static async markBookAsCompleted(
    userId: string,
    bookId: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        
        .from('user_book_progress')
        .update({
          is_completed: true,
          completion_percentage: 100,
          completed_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('book_id', bookId);

      if (error) {
        console.error('❌ Error marcando completado:', error.message, error);
        throw error;
      }

      console.log('🎉 ¡Libro completado!');

    } catch (error: any) {
      console.error('❌ Error en markBookAsCompleted:', error.message || error);
      throw error;
    }
  }

  static async getUserProgress(
    userId: string,
    bookId: string
  ): Promise<UserProgress | null> {
    try {
      const { data, error } = await this.supabase
        
        .from('user_book_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error obteniendo progreso:', error.message, error);
        return null;
      }

      if (!data) return null;

      return {
        userId: data.user_id,
        bookId: data.book_id,
        currentPage: data.current_page,
        totalPages: data.total_pages,
        completionPercentage: data.completion_percentage,
        totalReadingTime: data.total_reading_time,
        isCompleted: data.is_completed,
        lastReadAt: new Date(data.last_read_at),
      };

    } catch (error: any) {
      console.error('❌ Error en getUserProgress:', error.message || error);
      return null;
    }
  }

  // ============================================
  // 4. ESTADÍSTICAS DEL LIBRO
  // ============================================

  static async getBookStatistics(bookId: string): Promise<BookStatistics | null> {
    try {
      const { data: sessions } = await this.supabase
        
        .from('book_reading_sessions')
        .select('*')
        .eq('book_id', bookId);

      if (!sessions || sessions.length === 0) return null;

      const { data: progress } = await this.supabase
        
        .from('user_book_progress')
        .select('*')
        .eq('book_id', bookId);

      const { data: pageViews } = await this.supabase
        
        .from('book_page_views')
        .select('page_number, duration_seconds')
        .eq('book_id', bookId);

      const totalReaders = new Set(sessions.map(s => s.user_id).filter(Boolean)).size;
      const activeReaders = progress?.filter(p => !p.is_completed).length || 0;
      const completedReaders = progress?.filter(p => p.is_completed).length || 0;

      const avgCompletionRate = sessions.reduce((sum, s) => sum + s.completion_percentage, 0) / sessions.length;
      const avgSessionDuration = sessions.reduce((sum, s) => sum + s.duration_seconds, 0) / sessions.length;
      const totalReadingTime = sessions.reduce((sum, s) => sum + s.duration_seconds, 0);

      const pageCounts = new Map<number, number>();
      pageViews?.forEach(pv => {
        pageCounts.set(pv.page_number, (pageCounts.get(pv.page_number) || 0) + 1);
      });
      const mostViewedPage = Array.from(pageCounts.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 1;

      const bouncedSessions = sessions.filter(s => s.completion_percentage < 10).length;
      const bounceRate = (bouncedSessions / sessions.length) * 100;

      const deviceCounts = { desktop: 0, mobile: 0, tablet: 0 };
      sessions.forEach(s => {
        if (s.device_type in deviceCounts) {
          deviceCounts[s.device_type as keyof typeof deviceCounts]++;
        }
      });

      return {
        bookId,
        totalReaders,
        activeReaders,
        completedReaders,
        avgCompletionRate,
        avgSessionDuration,
        totalReadingTime,
        mostViewedPage,
        bounceRate,
        deviceBreakdown: deviceCounts,
      };

    } catch (error: any) {
      console.error('❌ Error obteniendo estadísticas:', error.message || error);
      return null;
    }
  }

  // ============================================
  // 5. COMPARATIVAS
  // ============================================

  static async compareReadingTime(
    userId: string,
    bookId: string
  ): Promise<ReadingComparison | null> {
    try {
      const { data: userSessions } = await this.supabase
        
        .from('book_reading_sessions')
        .select('duration_seconds')
        .eq('book_id', bookId)
        .eq('user_id', userId);

      if (!userSessions || userSessions.length === 0) return null;

      const userTime = userSessions.reduce((sum, s) => sum + s.duration_seconds, 0);

      const { data: allSessions } = await this.supabase
        
        .from('book_reading_sessions')
        .select('duration_seconds, user_id')
        .eq('book_id', bookId)
        .not('user_id', 'is', null);

      if (!allSessions || allSessions.length === 0) return null;

      const userTotals = new Map<string, number>();
      allSessions.forEach(s => {
        const current = userTotals.get(s.user_id) || 0;
        userTotals.set(s.user_id, current + s.duration_seconds);
      });

      const times = Array.from(userTotals.values()).sort((a, b) => a - b);
      const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;

      const fasterThanCount = times.filter(t => t > userTime).length;
      const percentile = (fasterThanCount / times.length) * 100;

      let speedRank: string;
      if (percentile >= 90) speedRank = 'Muy rápido';
      else if (percentile >= 70) speedRank = 'Rápido';
      else if (percentile >= 30) speedRank = 'Promedio';
      else if (percentile >= 10) speedRank = 'Lento';
      else speedRank = 'Muy lento';

      return {
        userTime,
        avgTime,
        percentile,
        isFasterThanAverage: userTime < avgTime,
        speedRank,
      };

    } catch (error: any) {
      console.error('❌ Error comparando tiempos:', error.message || error);
      return null;
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  private static detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else if (minutes > 0) {
      return `${minutes}min ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  static formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}