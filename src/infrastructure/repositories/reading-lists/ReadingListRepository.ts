// ============================================
// src/infrastructure/repositories/reading-lists/ReadingListRepository.ts
// Implementación Supabase del repositorio de listas de lectura
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import { ReadingListEntity } from '@/src/core/domain/entities/ReadingListEntity';
import {
  IReadingListRepository,
  CreateReadingListDTO,
  UpdateReadingListDTO,
  AddBookToListDTO,
} from '@/src/core/domain/repositories/IReadingListRepository';

export class ReadingListRepository implements IReadingListRepository {
  private supabase = createClient();

  async findAll(includeDeleted = false): Promise<ReadingListEntity[]> {
    let query = this.supabase.schema('books').from('reading_lists').select('*');
    if (!includeDeleted) query = query.is('deleted_at', null);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(`Error fetching lists: ${error.message}`);

    // Fetch book counts
    const listIds = (data || []).map(l => l.id);
    const { data: bookCounts } = await this.supabase.schema('books').from('reading_list_books').select('reading_list_id').in('reading_list_id', listIds);

    const countMap = new Map<string, number>();
    (bookCounts || []).forEach((b: any) => {
      countMap.set(b.reading_list_id, (countMap.get(b.reading_list_id) || 0) + 1);
    });

    return (data || []).map(row => ReadingListEntity.fromDatabase({ ...row, book_count: countMap.get(row.id) || 0 }));
  }

  async findById(id: string): Promise<ReadingListEntity | null> {
    const { data, error } = await this.supabase.schema('books').from('reading_lists').select('*').eq('id', id).single();
    if (error || !data) return null;

    const { data: books } = await this.supabase.schema('books').from('reading_list_books').select('*').eq('reading_list_id', id).order('order_index');
    return ReadingListEntity.fromDatabase({ ...data, book_count: books?.length || 0 }, books || []);
  }

  async findByUserId(userId: string): Promise<ReadingListEntity[]> {
    const { data, error } = await this.supabase.schema('books').from('reading_lists').select('*').eq('user_id', userId).is('deleted_at', null).order('created_at', { ascending: false });
    if (error) throw new Error(`Error fetching lists: ${error.message}`);
    return (data || []).map(row => ReadingListEntity.fromDatabase(row));
  }

  async findPublic(): Promise<ReadingListEntity[]> {
    const { data, error } = await this.supabase.schema('books').from('reading_lists').select('*').eq('is_public', true).is('deleted_at', null).order('created_at', { ascending: false });
    if (error) throw new Error(`Error fetching lists: ${error.message}`);
    return (data || []).map(row => ReadingListEntity.fromDatabase(row));
  }

  async create(dto: CreateReadingListDTO): Promise<ReadingListEntity> {
    const { data, error } = await this.supabase.schema('books').from('reading_lists').insert({
      user_id: dto.userId,
      name: dto.name,
      description: dto.description || null,
      is_public: dto.isPublic || false,
      is_default: dto.isDefault || false,
    }).select().single();
    if (error) throw new Error(`Error creating list: ${error.message}`);
    return ReadingListEntity.fromDatabase(data);
  }

  async update(id: string, dto: UpdateReadingListDTO): Promise<ReadingListEntity> {
    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.isPublic !== undefined) updateData.is_public = dto.isPublic;
    if (dto.isDefault !== undefined) updateData.is_default = dto.isDefault;

    const { data, error } = await this.supabase.schema('books').from('reading_lists').update(updateData).eq('id', id).select().single();
    if (error) throw new Error(`Error updating list: ${error.message}`);
    return ReadingListEntity.fromDatabase(data);
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('reading_lists').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) throw new Error(`Error deleting list: ${error.message}`);
  }

  async restore(id: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('reading_lists').update({ deleted_at: null }).eq('id', id);
    if (error) throw new Error(`Error restoring list: ${error.message}`);
  }

  async hardDelete(id: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('reading_lists').delete().eq('id', id);
    if (error) throw new Error(`Error deleting list: ${error.message}`);
  }

  async addBook(dto: AddBookToListDTO): Promise<void> {
    const { error } = await this.supabase.schema('books').from('reading_list_books').insert({
      reading_list_id: dto.readingListId,
      book_id: dto.bookId,
      order_index: dto.orderIndex || 0,
    });
    if (error) throw new Error(`Error adding book: ${error.message}`);
  }

  async removeBook(readingListId: string, bookId: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('reading_list_books').delete().eq('reading_list_id', readingListId).eq('book_id', bookId);
    if (error) throw new Error(`Error removing book: ${error.message}`);
  }

  async reorderBooks(readingListId: string, bookIds: string[]): Promise<void> {
    for (let i = 0; i < bookIds.length; i++) {
      await this.supabase.schema('books').from('reading_list_books').update({ order_index: i }).eq('reading_list_id', readingListId).eq('book_id', bookIds[i]);
    }
  }
}
