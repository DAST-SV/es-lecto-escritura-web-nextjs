// ============================================
// src/infrastructure/repositories/book-ratings/BookRatingRepository.ts
// Implementación Supabase del repositorio de calificaciones
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import { BookRatingEntity } from '@/src/core/domain/entities/BookRatingEntity';
import {
  IBookRatingRepository2,
  CreateBookRatingDTO,
  UpdateBookRatingDTO,
  BookRatingStats,
} from '@/src/core/domain/repositories/IBookRatingRepository2';

export class BookRatingRepository implements IBookRatingRepository2 {
  private supabase = createClient();

  async findAll(): Promise<BookRatingEntity[]> {
    const { data, error } = await this.supabase.schema('books').from('book_ratings').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(`Error fetching ratings: ${error.message}`);
    return (data || []).map(row => BookRatingEntity.fromDatabase(row));
  }

  async findById(id: string): Promise<BookRatingEntity | null> {
    const { data, error } = await this.supabase.schema('books').from('book_ratings').select('*').eq('id', id).single();
    if (error || !data) return null;
    return BookRatingEntity.fromDatabase(data);
  }

  async findByBookId(bookId: string): Promise<BookRatingEntity[]> {
    const { data, error } = await this.supabase.schema('books').from('book_ratings').select('*').eq('book_id', bookId).order('created_at', { ascending: false });
    if (error) throw new Error(`Error fetching ratings: ${error.message}`);
    return (data || []).map(row => BookRatingEntity.fromDatabase(row));
  }

  async findByUserId(userId: string): Promise<BookRatingEntity[]> {
    const { data, error } = await this.supabase.schema('books').from('book_ratings').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw new Error(`Error fetching ratings: ${error.message}`);
    return (data || []).map(row => BookRatingEntity.fromDatabase(row));
  }

  async findByBookAndUser(bookId: string, userId: string): Promise<BookRatingEntity | null> {
    const { data, error } = await this.supabase.schema('books').from('book_ratings').select('*').eq('book_id', bookId).eq('user_id', userId).single();
    if (error || !data) return null;
    return BookRatingEntity.fromDatabase(data);
  }

  async getBookStats(bookId: string): Promise<BookRatingStats> {
    const { data, error } = await this.supabase.schema('books').from('book_ratings').select('rating').eq('book_id', bookId);
    if (error) throw new Error(`Error fetching stats: ${error.message}`);

    const ratings = data || [];
    const total = ratings.length;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(r => distribution[r.rating]++);

    return {
      bookId,
      averageRating: total > 0 ? sum / total : 0,
      totalRatings: total,
      distribution,
    };
  }

  async create(dto: CreateBookRatingDTO): Promise<BookRatingEntity> {
    const { data, error } = await this.supabase.schema('books').from('book_ratings').insert({
      book_id: dto.bookId,
      user_id: dto.userId,
      rating: dto.rating,
    }).select().single();
    if (error) throw new Error(`Error creating rating: ${error.message}`);
    return BookRatingEntity.fromDatabase(data);
  }

  async update(id: string, dto: UpdateBookRatingDTO): Promise<BookRatingEntity> {
    const { data, error } = await this.supabase.schema('books').from('book_ratings').update({
      rating: dto.rating,
      updated_at: new Date().toISOString(),
    }).eq('id', id).select().single();
    if (error) throw new Error(`Error updating rating: ${error.message}`);
    return BookRatingEntity.fromDatabase(data);
  }

  async upsert(dto: CreateBookRatingDTO): Promise<BookRatingEntity> {
    const { data, error } = await this.supabase.schema('books').from('book_ratings').upsert({
      book_id: dto.bookId,
      user_id: dto.userId,
      rating: dto.rating,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'book_id,user_id' }).select().single();
    if (error) throw new Error(`Error upserting rating: ${error.message}`);
    return BookRatingEntity.fromDatabase(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('book_ratings').delete().eq('id', id);
    if (error) throw new Error(`Error deleting rating: ${error.message}`);
  }
}
