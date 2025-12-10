import { createClient } from '@/src/utils/supabase/client';

interface ReadingSession {
  bookId: string;
  userId?: string;
  sessionId: string;
  startTime: Date;
  totalPages: number;
  pagesRead: number[];
  currentPage: number;
  deviceType: 'desktop' | 'mobile' | 'tablet';
}

export class BookAnalyticsService {
  private static supabase = createClient();

  static async startReadingSession(bookId: string, totalPages: number, userId?: string): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(`reading_session_${bookId}`, JSON.stringify({
      bookId, userId, sessionId, startTime: new Date(), totalPages, pagesRead: [], currentPage: 1,
      deviceType: this.getDeviceType(),
    }));
    return sessionId;
  }

  static async endReadingSession(bookId: string, sessionId: string): Promise<void> {
    const data = localStorage.getItem(`reading_session_${bookId}`);
    if (!data) return;
    const session = JSON.parse(data);
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - new Date(session.startTime).getTime()) / 1000);
    await this.supabase.from('book_reading_sessions').insert({
      book_id: bookId, user_id: session.userId, session_id: sessionId,
      started_at: session.startTime, ended_at: endTime.toISOString(),
      duration_seconds: duration, total_pages: session.totalPages,
      pages_read: session.pagesRead.length, unique_pages: [...new Set(session.pagesRead)].length,
      completion_percentage: (session.pagesRead.length / session.totalPages) * 100,
      device_type: session.deviceType,
    });
    localStorage.removeItem(`reading_session_${bookId}`);
  }

  static async trackPageView(bookId: string, sessionId: string, pageNumber: number): Promise<void> {
    const data = localStorage.getItem(`reading_session_${bookId}`);
    if (!data) return;
    const session = JSON.parse(data);
    session.currentPage = pageNumber;
    if (!session.pagesRead.includes(pageNumber)) {
      session.pagesRead.push(pageNumber);
    }
    localStorage.setItem(`reading_session_${bookId}`, JSON.stringify(session));
  }

  static async trackPageDuration(bookId: string, sessionId: string, pageNumber: number, durationSeconds: number): Promise<void> {
    if (durationSeconds <= 0) return;
    await this.supabase.from('book_page_views').insert({
      book_id: bookId, session_id: sessionId, page_number: pageNumber,
      duration_seconds: durationSeconds, viewed_at: new Date().toISOString(),
    });
  }

  static async getReadingStats(bookId: string) {
    const { data: sessions } = await this.supabase.from('book_reading_sessions').select('*').eq('book_id', bookId);
    if (!sessions || sessions.length === 0) return null;
    const { data: pageViews } = await this.supabase.from('book_page_views').select('*').eq('book_id', bookId);
    const totalSessions = sessions.length;
    const uniqueReaders = new Set(sessions.map(s => s.user_id).filter(Boolean)).size;
    const avgDuration = Math.round(sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / totalSessions);
    const avgCompletion = Math.round(sessions.reduce((sum, s) => sum + (s.completion_percentage || 0), 0) / totalSessions);
    const totalReadingTime = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
    const pageStats = pageViews?.reduce((acc: any, view: any) => {
      if (!acc[view.page_number]) acc[view.page_number] = { views: 0, totalDuration: 0 };
      acc[view.page_number].views++;
      acc[view.page_number].totalDuration += view.duration_seconds || 0;
      return acc;
    }, {});
    const mostReadPages = Object.entries(pageStats || {}).map(([page, stats]: any) => ({
      page: Number(page), views: stats.views, avg_duration: Math.round(stats.totalDuration / stats.views)
    })).sort((a, b) => b.views - a.views).slice(0, 10);
    return { totalSessions, uniqueReaders, avgDuration, avgCompletion, totalReadingTime, mostReadPages };
  }

  private static getDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }
}