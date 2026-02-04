// ============================================
// src/infrastructure/repositories/book-reviews/BookReviewRepository.ts
// Implementación Supabase del repositorio de reseñas
// ============================================

import { createClient } from '@/src/lib/supabase/client';
import { BookReviewEntity } from '@/src/core/domain/entities/BookReviewEntity';
import {
  IBookReviewRepository,
  CreateBookReviewDTO,
  UpdateBookReviewDTO,
} from '@/src/core/domain/repositories/IBookReviewRepository';

export class BookReviewRepository implements IBookReviewRepository {
  private supabase = createClient();

  async findAll(includeDeleted = false): Promise<BookReviewEntity[]> {
    let query = this.supabase.schema('books').from('book_reviews').select('*');
    if (!includeDeleted) query = query.is('deleted_at', null);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(`Error fetching reviews: ${error.message}`);
    return (data || []).map(row => BookReviewEntity.fromDatabase(row));
  }

  async findById(id: string): Promise<BookReviewEntity | null> {
    const { data, error } = await this.supabase.schema('books').from('book_reviews').select('*').eq('id', id).single();
    if (error || !data) return null;
    return BookReviewEntity.fromDatabase(data);
  }

  async findByBookId(bookId: string): Promise<BookReviewEntity[]> {
    const { data, error } = await this.supabase.schema('books').from('book_reviews').select('*').eq('book_id', bookId).is('deleted_at', null).order('created_at', { ascending: false });
    if (error) throw new Error(`Error fetching reviews: ${error.message}`);
    return (data || []).map(row => BookReviewEntity.fromDatabase(row));
  }

  async findByUserId(userId: string): Promise<BookReviewEntity[]> {
    const { data, error } = await this.supabase.schema('books').from('book_reviews').select('*').eq('user_id', userId).is('deleted_at', null).order('created_at', { ascending: false });
    if (error) throw new Error(`Error fetching reviews: ${error.message}`);
    return (data || []).map(row => BookReviewEntity.fromDatabase(row));
  }

  async create(dto: CreateBookReviewDTO): Promise<BookReviewEntity> {
    const { data, error } = await this.supabase.schema('books').from('book_reviews').insert({
      book_id: dto.bookId,
      user_id: dto.userId,
      title: dto.title || null,
      content: dto.content,
    }).select().single();
    if (error) throw new Error(`Error creating review: ${error.message}`);
    return BookReviewEntity.fromDatabase(data);
  }

  async update(id: string, dto: UpdateBookReviewDTO): Promise<BookReviewEntity> {
    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.isApproved !== undefined) updateData.is_approved = dto.isApproved;
    if (dto.isFeatured !== undefined) updateData.is_featured = dto.isFeatured;

    const { data, error } = await this.supabase.schema('books').from('book_reviews').update(updateData).eq('id', id).select().single();
    if (error) throw new Error(`Error updating review: ${error.message}`);
    return BookReviewEntity.fromDatabase(data);
  }

  async approve(id: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('book_reviews').update({ is_approved: true, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw new Error(`Error approving review: ${error.message}`);
  }

  async reject(id: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('book_reviews').update({ is_approved: false, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw new Error(`Error rejecting review: ${error.message}`);
  }

  async feature(id: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('book_reviews').update({ is_featured: true, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw new Error(`Error featuring review: ${error.message}`);
  }

  async unfeature(id: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('book_reviews').update({ is_featured: false, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw new Error(`Error unfeaturing review: ${error.message}`);
  }

  async incrementHelpful(id: string): Promise<void> {
    const { error } = await this.supabase.rpc('increment_helpful_count', { review_id: id });
    if (error) {
      // Fallback if RPC doesn't exist
      const { data } = await this.supabase.schema('books').from('book_reviews').select('helpful_count').eq('id', id).single();
      await this.supabase.schema('books').from('book_reviews').update({ helpful_count: (data?.helpful_count || 0) + 1 }).eq('id', id);
    }
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('book_reviews').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) throw new Error(`Error deleting review: ${error.message}`);
  }

  async restore(id: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('book_reviews').update({ deleted_at: null }).eq('id', id);
    if (error) throw new Error(`Error restoring review: ${error.message}`);
  }

  async hardDelete(id: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('book_reviews').delete().eq('id', id);
    if (error) throw new Error(`Error deleting review: ${error.message}`);
  }
}
