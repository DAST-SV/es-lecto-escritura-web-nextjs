/**
 * UBICACIÓN: src/infrastructure/services/BookReadingAnalytics.service.ts
 * 📊 SISTEMA DE ANALYTICS COMPLETO
 * ✅ CORREGIDO: user_book_progress en vez de book_reading_progress
 */

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

export interface ReadingComparison {
  userTime: number;
  avgTime: number;
  percentile: number;
  isFasterThanAverage: boolean;
  speedRank: string;
}

export interface BookStatistics {
  totalReaders: number;
  activeReaders: number;
  completedReaders: number;
  avgCompletionRate: number;
  mostViewedPage: number;
  avgSessionDuration: number;
  bounceRate: number;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
}

// ============================================
// CLASE PRINCIPAL
// ============================================

export class BookReadingAnalyticsService {
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
    const completionPercentage = session.totalPages > 0 
      ? Math.max(0, Math.min(100, (uniquePagesVisited.size / session.totalPages) * 100))
      : 0;

    try {
      const { createClient } = await import('@/src/utils/supabase/client');
      const supabase = createClient();

      // Guardar sesión en Supabase
      const { error } = await supabase
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
        throw error;
      }

      console.log('✅ Sesión guardada:', sessionId);

      if (session.userId && completionPercentage === 100) {
        await this.markBookAsCompleted(session.userId, session.bookId);
      }

      this.activeSessions.delete(sessionId);

    } catch (error: any) {
      console.error('❌ Error en endSession:', error.message || error);
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
      const { createClient } = await import('@/src/utils/supabase/client');
      const supabase = createClient();

      // Guardar vista de página
      const { error } = await supabase
        .from('book_page_views')
        .insert({
          book_id: session.bookId,
          session_id: sessionId,
          page_number: pageNumber,
          viewed_at: startTime.toISOString(),
          duration_seconds: durationSeconds,
        });

      if (error) {
        console.error('❌ Error guardando duración:', error);
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
    const isCompleted = completionPercentage >= 100;

    try {
      const { createClient } = await import('@/src/utils/supabase/client');
      const supabase = createClient();

      // ✅ CORREGIDO: user_book_progress
      const { error } = await supabase
        .from('user_book_progress')
        .upsert(
          {
            user_id: userId,
            book_id: bookId,
            current_page: currentPage,
            total_pages: totalPages,
            completion_percentage: completionPercentage,
            is_completed: isCompleted,
            total_reading_time: readingTimeSeconds,
            last_read_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,book_id',
          }
        );

      if (error) {
        throw error;
      }

      console.log('✅ Progreso actualizado');

    } catch (error: any) {
      console.error('❌ Error en updateUserProgress:', error.message || error);
    }
  }

  static async markBookAsCompleted(
    userId: string,
    bookId: string
  ): Promise<void> {
    try {
      await this.updateUserProgress(userId, bookId, 100, 100, 0);
      console.log('🎉 ¡Libro completado!');
    } catch (error: any) {
      console.error('❌ Error en markBookAsCompleted:', error.message || error);
    }
  }

  static async getUserProgress(
    userId: string,
    bookId: string
  ): Promise<UserProgress | null> {
    try {
      const { createClient } = await import('@/src/utils/supabase/client');
      const supabase = createClient();

      // ✅ CORREGIDO: user_book_progress
      const { data, error } = await supabase
        .from('user_book_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .single();

      if (error || !data) {
        console.error('❌ Error obteniendo progreso:', error);
        return null;
      }

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
  // 4. COMPARACIONES Y ESTADÍSTICAS
  // ============================================

  static async compareReadingTime(
    userId: string,
    bookId: string
  ): Promise<ReadingComparison> {
    try {
      const { createClient } = await import('@/src/utils/supabase/client');
      const supabase = createClient();

      // ✅ CORREGIDO: user_book_progress
      const { data: userProgress } = await supabase
        .from('user_book_progress')
        .select('total_reading_time')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .single();

      const userTime = userProgress?.total_reading_time || 0;

      // ✅ CORREGIDO: user_book_progress
      const { data: allProgress } = await supabase
        .from('user_book_progress')
        .select('total_reading_time')
        .eq('book_id', bookId)
        .gt('total_reading_time', 0);

      if (!allProgress || allProgress.length === 0) {
        return {
          userTime,
          avgTime: userTime,
          percentile: 50,
          isFasterThanAverage: false,
          speedRank: 'Único lector',
        };
      }

      const totalTime = allProgress.reduce((sum, p) => sum + (p.total_reading_time || 0), 0);
      const avgTime = Math.floor(totalTime / allProgress.length);

      const slowerCount = allProgress.filter(p => (p.total_reading_time || 0) > userTime).length;
      const percentile = Math.round((slowerCount / allProgress.length) * 100);

      const isFasterThanAverage = userTime < avgTime;

      let speedRank = 'Promedio';
      if (percentile >= 90) speedRank = 'Top 10% más rápido';
      else if (percentile >= 75) speedRank = 'Top 25% más rápido';
      else if (percentile >= 50) speedRank = 'Más rápido que el promedio';
      else if (percentile >= 25) speedRank = 'Más lento que el promedio';
      else speedRank = 'Lector pausado';

      return {
        userTime,
        avgTime,
        percentile,
        isFasterThanAverage,
        speedRank,
      };

    } catch (error: any) {
      console.error('❌ Error en compareReadingTime:', error.message || error);
      
      return {
        userTime: 0,
        avgTime: 0,
        percentile: 50,
        isFasterThanAverage: false,
        speedRank: 'Sin datos',
      };
    }
  }

  static async getBookStatistics(
    bookId: string
  ): Promise<BookStatistics> {
    try {
      const { createClient } = await import('@/src/utils/supabase/client');
      const supabase = createClient();

      const { data: allSessions, count: totalReaders } = await supabase
        .from('book_reading_sessions')
        .select('user_id', { count: 'exact', head: false })
        .eq('book_id', bookId);

      const uniqueReaders = new Set(
        allSessions?.map(s => s.user_id).filter(Boolean)
      ).size;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: activeReaders } = await supabase
        .from('book_reading_sessions')
        .select('user_id', { count: 'exact', head: true })
        .eq('book_id', bookId)
        .gte('started_at', sevenDaysAgo.toISOString());

      // ✅ CORREGIDO: user_book_progress
      const { count: completedReaders } = await supabase
        .from('user_book_progress')
        .select('*', { count: 'exact', head: true })
        .eq('book_id', bookId)
        .eq('is_completed', true);

      // ✅ CORREGIDO: user_book_progress
      const { data: progressData } = await supabase
        .from('user_book_progress')
        .select('completion_percentage')
        .eq('book_id', bookId);

      const avgCompletionRate = progressData && progressData.length > 0
        ? progressData.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / progressData.length
        : 0;

      const { data: pageViews } = await supabase
        .from('book_page_views')
        .select('page_number')
        .eq('book_id', bookId);

      let mostViewedPage = 1;
      if (pageViews && pageViews.length > 0) {
        const pageCounts = pageViews.reduce((acc: Record<number, number>, view) => {
          acc[view.page_number] = (acc[view.page_number] || 0) + 1;
          return acc;
        }, {});

        mostViewedPage = Number(
          Object.entries(pageCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 1
        );
      }

      const { data: sessions } = await supabase
        .from('book_reading_sessions')
        .select('duration_seconds')
        .eq('book_id', bookId)
        .gt('duration_seconds', 0);

      const avgSessionDuration = sessions && sessions.length > 0
        ? Math.floor(
            sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / sessions.length
          )
        : 0;

      const { count: totalSessions } = await supabase
        .from('book_reading_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('book_id', bookId);

      const { count: shortSessions } = await supabase
        .from('book_reading_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('book_id', bookId)
        .lt('duration_seconds', 30);

      const bounceRate = totalSessions && totalSessions > 0
        ? ((shortSessions || 0) / totalSessions) * 100
        : 0;

      const { data: deviceData } = await supabase
        .from('book_reading_sessions')
        .select('device_type')
        .eq('book_id', bookId);

      const deviceBreakdown = {
        desktop: 0,
        mobile: 0,
        tablet: 0,
      };

      if (deviceData) {
        deviceData.forEach(d => {
          if (d.device_type === 'desktop') deviceBreakdown.desktop++;
          else if (d.device_type === 'mobile') deviceBreakdown.mobile++;
          else if (d.device_type === 'tablet') deviceBreakdown.tablet++;
        });
      }

      return {
        totalReaders: uniqueReaders || 0,
        activeReaders: activeReaders || 0,
        completedReaders: completedReaders || 0,
        avgCompletionRate: Math.round(avgCompletionRate),
        mostViewedPage,
        avgSessionDuration,
        bounceRate: Math.round(bounceRate * 10) / 10,
        deviceBreakdown,
      };

    } catch (error: any) {
      console.error('❌ Error en getBookStatistics:', error.message || error);
      
      return {
        totalReaders: 0,
        activeReaders: 0,
        completedReaders: 0,
        avgCompletionRate: 0,
        mostViewedPage: 1,
        avgSessionDuration: 0,
        bounceRate: 0,
        deviceBreakdown: {
          desktop: 0,
          mobile: 0,
          tablet: 0,
        },
      };
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