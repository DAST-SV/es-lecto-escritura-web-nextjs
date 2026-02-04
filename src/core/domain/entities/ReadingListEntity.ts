// ============================================
// src/core/domain/entities/ReadingListEntity.ts
// Entidad para listas de lectura
// ============================================

export interface ReadingListBookData {
  id: string;
  readingListId: string;
  bookId: string;
  orderIndex: number;
  addedAt: Date;
  bookTitle?: string;
  bookCover?: string;
}

export interface ReadingListData {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  // Denormalized
  userName?: string;
  bookCount?: number;
  books?: ReadingListBookData[];
}

export class ReadingListEntity {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly description: string | null;
  readonly isPublic: boolean;
  readonly isDefault: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly userName?: string;
  readonly bookCount?: number;
  readonly books: ReadingListBookData[];

  constructor(data: ReadingListData) {
    this.id = data.id;
    this.userId = data.userId;
    this.name = data.name;
    this.description = data.description;
    this.isPublic = data.isPublic;
    this.isDefault = data.isDefault;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
    this.userName = data.userName;
    this.bookCount = data.bookCount;
    this.books = data.books || [];
  }

  get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  get visibilityIcon(): string {
    return this.isPublic ? '🌐' : '🔒';
  }

  static fromDatabase(row: any, books: any[] = []): ReadingListEntity {
    return new ReadingListEntity({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description,
      isPublic: row.is_public || false,
      isDefault: row.is_default || false,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
      userName: row.user_name,
      bookCount: row.book_count,
      books: books.map(b => ({
        id: b.id,
        readingListId: b.reading_list_id,
        bookId: b.book_id,
        orderIndex: b.order_index || 0,
        addedAt: new Date(b.added_at),
        bookTitle: b.book_title,
        bookCover: b.book_cover,
      })),
    });
  }
}
