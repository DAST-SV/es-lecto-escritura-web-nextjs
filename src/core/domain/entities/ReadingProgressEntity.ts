// ============================================
// src/core/domain/entities/ReadingProgressEntity.ts
// Entidad para progreso de lectura
// ============================================

export interface ReadingProgressData {
  id: string;
  bookId: string;
  userId: string;
  currentPage: number;
  totalPagesRead: number;
  completionPercentage: number;
  isCompleted: boolean;
  completedAt: Date | null;
  lastReadAt: Date;
  readingTimeSeconds: number;
  createdAt: Date;
  updatedAt: Date;
  // Denormalized
  bookTitle?: string;
  bookCover?: string;
  userName?: string;
}

export class ReadingProgressEntity {
  readonly id: string;
  readonly bookId: string;
  readonly userId: string;
  readonly currentPage: number;
  readonly totalPagesRead: number;
  readonly completionPercentage: number;
  readonly isCompleted: boolean;
  readonly completedAt: Date | null;
  readonly lastReadAt: Date;
  readonly readingTimeSeconds: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly bookTitle?: string;
  readonly bookCover?: string;
  readonly userName?: string;

  constructor(data: ReadingProgressData) {
    this.id = data.id;
    this.bookId = data.bookId;
    this.userId = data.userId;
    this.currentPage = data.currentPage;
    this.totalPagesRead = data.totalPagesRead;
    this.completionPercentage = data.completionPercentage;
    this.isCompleted = data.isCompleted;
    this.completedAt = data.completedAt;
    this.lastReadAt = data.lastReadAt;
    this.readingTimeSeconds = data.readingTimeSeconds;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.bookTitle = data.bookTitle;
    this.bookCover = data.bookCover;
    this.userName = data.userName;
  }

  get readingTimeFormatted(): string {
    const hours = Math.floor(this.readingTimeSeconds / 3600);
    const minutes = Math.floor((this.readingTimeSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  get progressDisplay(): string {
    return `${this.completionPercentage.toFixed(1)}%`;
  }

  static fromDatabase(row: any): ReadingProgressEntity {
    return new ReadingProgressEntity({
      id: row.id,
      bookId: row.book_id,
      userId: row.user_id,
      currentPage: row.current_page || 1,
      totalPagesRead: row.total_pages_read || 0,
      completionPercentage: parseFloat(row.completion_percentage) || 0,
      isCompleted: row.is_completed || false,
      completedAt: row.completed_at ? new Date(row.completed_at) : null,
      lastReadAt: new Date(row.last_read_at),
      readingTimeSeconds: row.reading_time_seconds || 0,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      bookTitle: row.book_title,
      bookCover: row.book_cover,
      userName: row.user_name,
    });
  }
}
