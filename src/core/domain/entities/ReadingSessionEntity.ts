// ============================================
// src/core/domain/entities/ReadingSessionEntity.ts
// Entidad para sesiones de lectura
// ============================================

export interface ReadingSessionData {
  id: string;
  bookId: string;
  userId: string;
  startPage: number;
  endPage: number;
  pagesRead: number;
  startedAt: Date;
  endedAt: Date | null;
  durationSeconds: number | null;
  deviceType: string | null;
  languageCode: string | null;
  createdAt: Date;
  // Denormalized
  bookTitle?: string;
  userName?: string;
}

export class ReadingSessionEntity {
  readonly id: string;
  readonly bookId: string;
  readonly userId: string;
  readonly startPage: number;
  readonly endPage: number;
  readonly pagesRead: number;
  readonly startedAt: Date;
  readonly endedAt: Date | null;
  readonly durationSeconds: number | null;
  readonly deviceType: string | null;
  readonly languageCode: string | null;
  readonly createdAt: Date;
  readonly bookTitle?: string;
  readonly userName?: string;

  constructor(data: ReadingSessionData) {
    this.id = data.id;
    this.bookId = data.bookId;
    this.userId = data.userId;
    this.startPage = data.startPage;
    this.endPage = data.endPage;
    this.pagesRead = data.pagesRead;
    this.startedAt = data.startedAt;
    this.endedAt = data.endedAt;
    this.durationSeconds = data.durationSeconds;
    this.deviceType = data.deviceType;
    this.languageCode = data.languageCode;
    this.createdAt = data.createdAt;
    this.bookTitle = data.bookTitle;
    this.userName = data.userName;
  }

  get isActive(): boolean {
    return this.endedAt === null;
  }

  get durationFormatted(): string {
    if (!this.durationSeconds) return 'En curso';
    const minutes = Math.floor(this.durationSeconds / 60);
    const seconds = this.durationSeconds % 60;
    return `${minutes}m ${seconds}s`;
  }

  get deviceIcon(): string {
    switch (this.deviceType) {
      case 'mobile': return '📱';
      case 'tablet': return '📱';
      case 'desktop': return '💻';
      default: return '🖥️';
    }
  }

  static fromDatabase(row: any): ReadingSessionEntity {
    return new ReadingSessionEntity({
      id: row.id,
      bookId: row.book_id,
      userId: row.user_id,
      startPage: row.start_page,
      endPage: row.end_page,
      pagesRead: row.pages_read || (row.end_page - row.start_page + 1),
      startedAt: new Date(row.started_at),
      endedAt: row.ended_at ? new Date(row.ended_at) : null,
      durationSeconds: row.duration_seconds,
      deviceType: row.device_type,
      languageCode: row.language_code,
      createdAt: new Date(row.created_at),
      bookTitle: row.book_title,
      userName: row.user_name,
    });
  }
}
