/**
 * ============================================
 * INTERFACES: IBookRatingRepository, IBookReviewRepository
 * Repositorios para ratings y reviews de libros
 * ============================================
 */

import { BookRating, BookReview, BookRatingStatsEntity } from '../entities/BookReview';
import { BookRatingData, BookReviewData, BookRatingStats } from '../types';

// ============================================
// RATINGS
// ============================================

export interface IBookRatingRepository {
  // CRUD
  rate(bookId: string, userId: string, rating: number): Promise<BookRating>;
  getUserRating(bookId: string, userId: string): Promise<BookRating | null>;
  updateRating(bookId: string, userId: string, rating: number): Promise<BookRating>;
  deleteRating(bookId: string, userId: string): Promise<void>;

  // Consultas
  getBookRatings(bookId: string, limit?: number, offset?: number): Promise<BookRating[]>;
  getBookRatingStats(bookId: string): Promise<BookRatingStats>;
  getUserRatings(userId: string, limit?: number, offset?: number): Promise<BookRating[]>;

  // Estadísticas
  getAverageRating(bookId: string): Promise<number>;
  getTotalRatings(bookId: string): Promise<number>;
  getRatingDistribution(bookId: string): Promise<Record<number, number>>;
}

// ============================================
// REVIEWS
// ============================================

export interface CreateReviewDTO {
  bookId: string;
  userId: string;
  title?: string;
  content: string;
}

export interface UpdateReviewDTO {
  title?: string;
  content?: string;
}

export interface ReviewFilters {
  bookId?: string;
  userId?: string;
  isApproved?: boolean;
  isFeatured?: boolean;
  sortBy?: 'recent' | 'helpful' | 'rating';
  limit?: number;
  offset?: number;
}

export interface IBookReviewRepository {
  // CRUD
  create(dto: CreateReviewDTO): Promise<BookReview>;
  findById(id: string): Promise<BookReview | null>;
  findByBookAndUser(bookId: string, userId: string): Promise<BookReview | null>;
  update(id: string, dto: UpdateReviewDTO): Promise<BookReview>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;

  // Consultas
  findByBookId(bookId: string, filters?: ReviewFilters): Promise<BookReview[]>;
  findByUserId(userId: string, limit?: number, offset?: number): Promise<BookReview[]>;
  findAll(filters?: ReviewFilters): Promise<BookReview[]>;
  getApprovedReviews(bookId: string, limit?: number, offset?: number): Promise<BookReview[]>;
  getFeaturedReviews(bookId: string, limit?: number): Promise<BookReview[]>;
  getPendingReviews(limit?: number, offset?: number): Promise<BookReview[]>;

  // Moderación
  approve(id: string, approvedBy: string): Promise<BookReview>;
  reject(id: string, reason: string): Promise<void>;
  hide(id: string): Promise<void>;
  unhide(id: string): Promise<void>;
  setFeatured(id: string, isFeatured: boolean): Promise<BookReview>;

  // Votos
  voteHelpful(reviewId: string, userId: string, isHelpful: boolean): Promise<void>;
  removeVote(reviewId: string, userId: string): Promise<void>;
  getUserVote(reviewId: string, userId: string): Promise<boolean | null>;

  // Reportes
  report(reviewId: string, userId: string, reason: string): Promise<void>;
  getReportedReviews(limit?: number, offset?: number): Promise<BookReview[]>;

  // Estadísticas
  getReviewCount(bookId: string, onlyApproved?: boolean): Promise<number>;
  getUserReviewCount(userId: string): Promise<number>;
}
