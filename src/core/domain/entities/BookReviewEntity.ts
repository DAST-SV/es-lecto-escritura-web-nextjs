// ============================================
// src/core/domain/entities/BookReviewEntity.ts
// Entidad para reseñas de libros
// ============================================

export interface BookReviewData {
  id: string;
  bookId: string;
  userId: string;
  title: string | null;
  content: string;
  isApproved: boolean;
  isFeatured: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  // Denormalized
  bookTitle?: string;
  userName?: string;
  userAvatar?: string;
}

export class BookReviewEntity {
  readonly id: string;
  readonly bookId: string;
  readonly userId: string;
  readonly title: string | null;
  readonly content: string;
  readonly isApproved: boolean;
  readonly isFeatured: boolean;
  readonly helpfulCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly bookTitle?: string;
  readonly userName?: string;
  readonly userAvatar?: string;

  constructor(data: BookReviewData) {
    this.id = data.id;
    this.bookId = data.bookId;
    this.userId = data.userId;
    this.title = data.title;
    this.content = data.content;
    this.isApproved = data.isApproved;
    this.isFeatured = data.isFeatured;
    this.helpfulCount = data.helpfulCount;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
    this.bookTitle = data.bookTitle;
    this.userName = data.userName;
    this.userAvatar = data.userAvatar;
  }

  get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  get shortContent(): string {
    return this.content.length > 100 ? this.content.substring(0, 100) + '...' : this.content;
  }

  static fromDatabase(row: any): BookReviewEntity {
    return new BookReviewEntity({
      id: row.id,
      bookId: row.book_id,
      userId: row.user_id,
      title: row.title,
      content: row.content,
      isApproved: row.is_approved || false,
      isFeatured: row.is_featured || false,
      helpfulCount: row.helpful_count || 0,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
      bookTitle: row.book_title,
      userName: row.user_name,
      userAvatar: row.user_avatar,
    });
  }
}
