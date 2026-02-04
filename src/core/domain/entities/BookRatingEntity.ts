// ============================================
// src/core/domain/entities/BookRatingEntity.ts
// Entidad para calificaciones de libros
// ============================================

export interface BookRatingData {
  id: string;
  bookId: string;
  userId: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
  // Denormalized
  bookTitle?: string;
  userName?: string;
}

export class BookRatingEntity {
  readonly id: string;
  readonly bookId: string;
  readonly userId: string;
  readonly rating: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly bookTitle?: string;
  readonly userName?: string;

  constructor(data: BookRatingData) {
    this.id = data.id;
    this.bookId = data.bookId;
    this.userId = data.userId;
    this.rating = data.rating;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.bookTitle = data.bookTitle;
    this.userName = data.userName;
  }

  get stars(): string {
    return '★'.repeat(this.rating) + '☆'.repeat(5 - this.rating);
  }

  static fromDatabase(row: any): BookRatingEntity {
    return new BookRatingEntity({
      id: row.id,
      bookId: row.book_id,
      userId: row.user_id,
      rating: row.rating,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      bookTitle: row.book_title,
      userName: row.user_name,
    });
  }
}
