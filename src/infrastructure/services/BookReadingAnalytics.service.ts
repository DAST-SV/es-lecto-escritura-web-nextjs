/**
 * UBICACIÓN: src/infrastructure/services/BookReadingAnalytics.service.ts
 * 📊 SISTEMA DE ANALYTICS - USANDO API ROUTES
 * 
 * ✅ SOLUCIÓN: Llamar a API routes (server-side) desde el cliente
 * ✅ PATRÓN: Igual que user-types (fetch a /api/...)
 * ✅ VENTAJA: Las tablas siguen en books schema, organizadas y limpias
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

    // ✅ CORREGIDO: Siempre calcular porcentaje, nunca NULL
    const uniquePagesVisited = new Set(session.pagesVisited);
    const completionPercentage = session.totalPages > 0 
      ? Math.max(0, Math.min(100, (uniquePagesVisited.size / session.totalPages) * 100))
      : 0;

    try {
      // ✅ Llamar a API route (server-side)
      const response = await fetch('/api/analytics/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error guardando sesión');
      }

      console.log('✅ Sesión guardada:', sessionId);

      if (session.userId && completionPercentage === 100) {
        await this.markBookAsCompleted(session.userId, session.bookId);
      }

      this.activeSessions.delete(sessionId);

    } catch (error: any) {
      console.error('❌ Error en endSession:', error.message || error);
      // No lanzar error para no romper la experiencia del usuario
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
      // ✅ Llamar a API route
      const response = await fetch('/api/analytics/page-views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: session.bookId,
          session_id: sessionId,
          page_number: pageNumber,
          viewed_at: startTime.toISOString(),
          duration_seconds: durationSeconds,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Error guardando duración:', error.error);
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
      // ✅ Llamar a API route
      const response = await fetch('/api/analytics/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          book_id: bookId,
          current_page: currentPage,
          total_pages: totalPages,
          completion_percentage: completionPercentage,
          is_completed: isCompleted,
          total_reading_time: readingTimeSeconds,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error actualizando progreso');
      }

      console.log('✅ Progreso actualizado');

    } catch (error: any) {
      console.error('❌ Error en updateUserProgress:', error.message || error);
      // No lanzar error para no romper la experiencia
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
      const response = await fetch(
        `/api/analytics/progress?user_id=${userId}&book_id=${bookId}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Error obteniendo progreso:', error.error);
        return null;
      }

      const data = await response.json();
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