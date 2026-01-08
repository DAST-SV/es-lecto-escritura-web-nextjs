/**
 * UBICACIÓN: src/infrastructure/services/BookReadingAnalytics.service.ts
 * 📊 SISTEMA COMPLETO DE ANALYTICS DE LECTURA - NIVEL ENTERPRISE
 * 
 * Funcionalidades:
 * - Tracking de sesiones completas
 * - Tiempo por página
 * - Progreso del usuario
 * - Estadísticas agregadas
 * - Comparativas y rankings
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
  pagesVisited: number[]; // Array de páginas visitadas (con duplicados)
  currentPage: number;
  deviceType: 'desktop' | 'mobile' | 'tablet';
}

export interface PageViewData {
  bookId: string;
  sessionId: string;
  pageNumber: number;
  startTime: Date;
  endTime?: Date;
  interactions: number;
}

export interface UserProgress {
  userId: string;
  bookId: string;
  currentPage: number;
  totalPages: number;
  completionPercentage: number;
  totalReadingTime: number; // segundos
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
  bounceRate: number; // % que leen <10% y se van
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
}

export interface ReadingComparison {
  userTime: number;
  avgTime: number;
  percentile: number; // 0-100
  isFasterThanAverage: boolean;
  speedRank: string; // "Muy rápido", "Rápido", "Promedio", "Lento"
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

  /**
   * Inicia una nueva sesión de lectura
   */
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

    // Guardar en memoria (cliente)
    this.activeSessions.set(sessionId, session);

    console.log('📖 Sesión iniciada:', sessionId);
    return sessionId;
  }

  /**
   * Finaliza una sesión de lectura y guarda en DB
   */
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
      // Guardar en tabla book_reading_sessions
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

      if (error) throw error;

      console.log('✅ Sesión guardada:', {
        sessionId,
        duration: `${Math.floor(durationSeconds / 60)}min ${durationSeconds % 60}s`,
        completion: `${completionPercentage.toFixed(1)}%`,
      });

      // Si el usuario completó el libro, actualizar progreso
      if (session.userId && completionPercentage === 100) {
        await this.markBookAsCompleted(session.userId, session.bookId);
      }

      // Limpiar memoria
      this.activeSessions.delete(sessionId);

    } catch (error) {
      console.error('❌ Error guardando sesión:', error);
      throw error;
    }
  }

  // ============================================
  // 2. TRACKING DE PÁGINAS
  // ============================================

  /**
   * Registra que el usuario está viendo una página
   */
  static async trackPageView(
    sessionId: string,
    pageNumber: number
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    // Actualizar sesión en memoria
    session.currentPage = pageNumber;
    if (!session.pagesVisited.includes(pageNumber)) {
      session.pagesVisited.push(pageNumber);
    }

    // Guardar timestamp de inicio de esta página
    const pageKey = `${sessionId}_${pageNumber}`;
    this.pageStartTimes.set(pageKey, new Date());

    console.log(`📄 Página ${pageNumber} vista`);
  }

  /**
   * Registra el tiempo que pasó en una página (cuando cambia de página)
   */
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

    // No guardar si el tiempo es muy corto (< 1 seg) o muy largo (> 10 min)
    if (durationSeconds < 1 || durationSeconds > 600) {
      this.pageStartTimes.delete(pageKey);
      return;
    }

    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    try {
      // Guardar en tabla book_page_views
      await this.supabase
        .from('book_page_views')
        .insert({
          book_id: session.bookId,
          session_id: sessionId,
          page_number: pageNumber,
          viewed_at: startTime.toISOString(),
          duration_seconds: durationSeconds,
        });

      console.log(`⏱️ Página ${pageNumber}: ${durationSeconds}s`);
      
      // Limpiar memoria
      this.pageStartTimes.delete(pageKey);

    } catch (error) {
      console.error('❌ Error guardando duración de página:', error);
    }
  }

  // ============================================
  // 3. PROGRESO DEL USUARIO
  // ============================================

  /**
   * Actualiza el progreso del usuario en un libro
   */
  static async updateUserProgress(
    userId: string,
    bookId: string,
    currentPage: number,
    totalPages: number,
    readingTimeSeconds: number
  ): Promise<void> {
    const completionPercentage = (currentPage / totalPages) * 100;

    try {
      const { error } = await this.supabase
        .from('user_book_progress')
        .upsert({
          user_id: userId,
          book_id: bookId,
          current_page: currentPage,
          total_pages: totalPages,
          completion_percentage: completionPercentage,
          is_completed: completionPercentage === 100,
          total_reading_time: readingTimeSeconds,
          last_read_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,book_id',
        });

      if (error) throw error;

      console.log('✅ Progreso actualizado:', {
        page: `${currentPage}/${totalPages}`,
        completion: `${completionPercentage.toFixed(1)}%`,
      });

    } catch (error) {
      console.error('❌ Error actualizando progreso:', error);
      throw error;
    }
  }

  /**
   * Marca un libro como completado
   */
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

      if (error) throw error;

      console.log('🎉 ¡Libro completado!');

    } catch (error) {
      console.error('❌ Error marcando libro como completado:', error);
      throw error;
    }
  }

  /**
   * Obtiene el progreso del usuario en un libro
   */
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
        .single();

      if (error || !data) return null;

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

    } catch (error) {
      console.error('❌ Error obteniendo progreso:', error);
      return null;
    }
  }

  // ============================================
  // 4. ESTADÍSTICAS DEL LIBRO
  // ============================================

  /**
   * Obtiene estadísticas completas de un libro
   */
  static async getBookStatistics(bookId: string): Promise<BookStatistics | null> {
    try {
      // Estadísticas de sesiones
      const { data: sessions } = await this.supabase
        .from('book_reading_sessions')
        .select('*')
        .eq('book_id', bookId);

      if (!sessions || sessions.length === 0) return null;

      // Progreso de usuarios
      const { data: progress } = await this.supabase
        .from('user_book_progress')
        .select('*')
        .eq('book_id', bookId);

      // Vistas de páginas
      const { data: pageViews } = await this.supabase
        .from('book_page_views')
        .select('page_number, duration_seconds')
        .eq('book_id', bookId);

      // Calcular estadísticas
      const totalReaders = new Set(sessions.map(s => s.user_id).filter(Boolean)).size;
      const activeReaders = progress?.filter(p => !p.is_completed).length || 0;
      const completedReaders = progress?.filter(p => p.is_completed).length || 0;

      const avgCompletionRate = sessions.reduce((sum, s) => sum + s.completion_percentage, 0) / sessions.length;
      const avgSessionDuration = sessions.reduce((sum, s) => sum + s.duration_seconds, 0) / sessions.length;
      const totalReadingTime = sessions.reduce((sum, s) => sum + s.duration_seconds, 0);

      // Página más vista
      const pageCounts = new Map<number, number>();
      pageViews?.forEach(pv => {
        pageCounts.set(pv.page_number, (pageCounts.get(pv.page_number) || 0) + 1);
      });
      const mostViewedPage = Array.from(pageCounts.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 1;

      // Bounce rate (usuarios que leyeron <10% y se fueron)
      const bouncedSessions = sessions.filter(s => s.completion_percentage < 10).length;
      const bounceRate = (bouncedSessions / sessions.length) * 100;

      // Breakdown de dispositivos
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

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return null;
    }
  }

  // ============================================
  // 5. COMPARATIVAS Y RANKINGS
  // ============================================

  /**
   * Compara el tiempo de lectura del usuario con otros
   */
  static async compareReadingTime(
    userId: string,
    bookId: string
  ): Promise<ReadingComparison | null> {
    try {
      // Tiempo del usuario
      const { data: userSessions } = await this.supabase
        .from('book_reading_sessions')
        .select('duration_seconds')
        .eq('book_id', bookId)
        .eq('user_id', userId);

      if (!userSessions || userSessions.length === 0) return null;

      const userTime = userSessions.reduce((sum, s) => sum + s.duration_seconds, 0);

      // Tiempo promedio de todos
      const { data: allSessions } = await this.supabase
        .from('book_reading_sessions')
        .select('duration_seconds, user_id')
        .eq('book_id', bookId)
        .not('user_id', 'is', null);

      if (!allSessions || allSessions.length === 0) return null;

      // Agrupar por usuario (solo la suma total de cada usuario)
      const userTotals = new Map<string, number>();
      allSessions.forEach(s => {
        const current = userTotals.get(s.user_id) || 0;
        userTotals.set(s.user_id, current + s.duration_seconds);
      });

      const times = Array.from(userTotals.values()).sort((a, b) => a - b);
      const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;

      // Calcular percentil
      const fasterThanCount = times.filter(t => t > userTime).length;
      const percentile = (fasterThanCount / times.length) * 100;

      // Clasificación
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

    } catch (error) {
      console.error('❌ Error comparando tiempos:', error);
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

  /**
   * Formatea segundos a formato legible
   */
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

  /**
   * Formatea fecha de manera amigable
   */
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