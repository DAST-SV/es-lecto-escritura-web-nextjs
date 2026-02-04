// ============================================
// src/infrastructure/repositories/reading-progress/ReadingProgressRepository.ts
// Implementación Supabase del repositorio de progreso de lectura
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import { ReadingProgressEntity } from '@/src/core/domain/entities/ReadingProgressEntity';
import {
  IReadingProgressRepository,
  CreateReadingProgressDTO,
  UpdateReadingProgressDTO,
} from '@/src/core/domain/repositories/IReadingProgressRepository';

export class ReadingProgressRepository implements IReadingProgressRepository {
  private supabase = createClient();

  async findAll(): Promise<ReadingProgressEntity[]> {
    const { data, error } = await this.supabase.schema('books').from('reading_progress').select('*').order('last_read_at', { ascending: false });
    if (error) throw new Error(`Error fetching progress: ${error.message}`);
    return (data || []).map(row => ReadingProgressEntity.fromDatabase(row));
  }

  async findById(id: string): Promise<ReadingProgressEntity | null> {
    const { data, error } = await this.supabase.schema('books').from('reading_progress').select('*').eq('id', id).single();
    if (error || !data) return null;
    return ReadingProgressEntity.fromDatabase(data);
  }

  async findByBookId(bookId: string): Promise<ReadingProgressEntity[]> {
    const { data, error } = await this.supabase.schema('books').from('reading_progress').select('*').eq('book_id', bookId).order('last_read_at', { ascending: false });
    if (error) throw new Error(`Error fetching progress: ${error.message}`);
    return (data || []).map(row => ReadingProgressEntity.fromDatabase(row));
  }

  async findByUserId(userId: string): Promise<ReadingProgressEntity[]> {
    const { data, error } = await this.supabase.schema('books').from('reading_progress').select('*').eq('user_id', userId).order('last_read_at', { ascending: false });
    if (error) throw new Error(`Error fetching progress: ${error.message}`);
    return (data || []).map(row => ReadingProgressEntity.fromDatabase(row));
  }

  async findByBookAndUser(bookId: string, userId: string): Promise<ReadingProgressEntity | null> {
    const { data, error } = await this.supabase.schema('books').from('reading_progress').select('*').eq('book_id', bookId).eq('user_id', userId).single();
    if (error || !data) return null;
    return ReadingProgressEntity.fromDatabase(data);
  }

  async create(dto: CreateReadingProgressDTO): Promise<ReadingProgressEntity> {
    const { data, error } = await this.supabase.schema('books').from('reading_progress').insert({
      book_id: dto.bookId,
      user_id: dto.userId,
      current_page: dto.currentPage || 1,
    }).select().single();
    if (error) throw new Error(`Error creating progress: ${error.message}`);
    return ReadingProgressEntity.fromDatabase(data);
  }

  async update(id: string, dto: UpdateReadingProgressDTO): Promise<ReadingProgressEntity> {
    const updateData: Record<string, any> = { updated_at: new Date().toISOString(), last_read_at: new Date().toISOString() };
    if (dto.currentPage !== undefined) updateData.current_page = dto.currentPage;
    if (dto.totalPagesRead !== undefined) updateData.total_pages_read = dto.totalPagesRead;
    if (dto.completionPercentage !== undefined) updateData.completion_percentage = dto.completionPercentage;
    if (dto.isCompleted !== undefined) updateData.is_completed = dto.isCompleted;
    if (dto.readingTimeSeconds !== undefined) updateData.reading_time_seconds = dto.readingTimeSeconds;

    const { data, error } = await this.supabase.schema('books').from('reading_progress').update(updateData).eq('id', id).select().single();
    if (error) throw new Error(`Error updating progress: ${error.message}`);
    return ReadingProgressEntity.fromDatabase(data);
  }

  async upsert(dto: CreateReadingProgressDTO & UpdateReadingProgressDTO): Promise<ReadingProgressEntity> {
    const { data, error } = await this.supabase.schema('books').from('reading_progress').upsert({
      book_id: dto.bookId,
      user_id: dto.userId,
      current_page: dto.currentPage || 1,
      total_pages_read: dto.totalPagesRead || 0,
      completion_percentage: dto.completionPercentage || 0,
      is_completed: dto.isCompleted || false,
      reading_time_seconds: dto.readingTimeSeconds || 0,
      last_read_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'book_id,user_id' }).select().single();
    if (error) throw new Error(`Error upserting progress: ${error.message}`);
    return ReadingProgressEntity.fromDatabase(data);
  }

  async markAsCompleted(id: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('reading_progress').update({
      is_completed: true,
      completion_percentage: 100,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    if (error) throw new Error(`Error marking as completed: ${error.message}`);
  }

  async addReadingTime(id: string, seconds: number): Promise<void> {
    const current = await this.findById(id);
    if (!current) throw new Error('Progress not found');

    const { error } = await this.supabase.schema('books').from('reading_progress').update({
      reading_time_seconds: current.readingTimeSeconds + seconds,
      last_read_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    if (error) throw new Error(`Error adding reading time: ${error.message}`);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('reading_progress').delete().eq('id', id);
    if (error) throw new Error(`Error deleting progress: ${error.message}`);
  }
}
