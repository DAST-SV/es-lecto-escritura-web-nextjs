// ============================================
// src/core/domain/entities/FavoriteEntity.ts
// Entidad para favoritos
// ============================================

export interface FavoriteData {
  id: string;
  bookId: string;
  userId: string;
  createdAt: Date;
  // Denormalized
  bookTitle?: string;
  bookCover?: string;
  userName?: string;
}

export class FavoriteEntity {
  readonly id: string;
  readonly bookId: string;
  readonly userId: string;
  readonly createdAt: Date;
  readonly bookTitle?: string;
  readonly bookCover?: string;
  readonly userName?: string;

  constructor(data: FavoriteData) {
    this.id = data.id;
    this.bookId = data.bookId;
    this.userId = data.userId;
    this.createdAt = data.createdAt;
    this.bookTitle = data.bookTitle;
    this.bookCover = data.bookCover;
    this.userName = data.userName;
  }

  static fromDatabase(row: any): FavoriteEntity {
    return new FavoriteEntity({
      id: row.id,
      bookId: row.book_id,
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      bookTitle: row.book_title,
      bookCover: row.book_cover,
      userName: row.user_name,
    });
  }
}
