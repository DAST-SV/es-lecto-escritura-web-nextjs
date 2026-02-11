// ============================================
// src/infrastructure/repositories/reading-sessions/ReadingSessionRepository.ts
// Implementación Supabase del repositorio de sesiones de lectura
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import { ReadingSessionEntity } from '@/src/core/domain/entities/ReadingSessionEntity';
import {
  IReadingSessionRepository,
  CreateReadingSessionDTO,
  EndReadingSessionDTO,
} from '@/src/core/domain/repositories/IReadingSessionRepository';

export class ReadingSessionRepository implements IReadingSessionRepository {
  private supabase = createClient();

  async findAll(): Promise<ReadingSessionEntity[]> {
    const { data, error } = await this.supabase.schema('books').from('reading_sessions').select('*').order('started_at', { ascending: false });
    if (error) throw new Error(`Error fetching sessions: ${error.message}`);
    return (data || []).map((row: any) => ReadingSessionEntity.fromDatabase(row));
  }

  async findById(id: string): Promise<ReadingSessionEntity | null> {
    const { data, error } = await this.supabase.schema('books').from('reading_sessions').select('*').eq('id', id).single();
    if (error || !data) return null;
    return ReadingSessionEntity.fromDatabase(data);
  }

  async findByBookId(bookId: string): Promise<ReadingSessionEntity[]> {
    const { data, error } = await this.supabase.schema('books').from('reading_sessions').select('*').eq('book_id', bookId).order('started_at', { ascending: false });
    if (error) throw new Error(`Error fetching sessions: ${error.message}`);
    return (data || []).map((row: any) => ReadingSessionEntity.fromDatabase(row));
  }

  async findByUserId(userId: string): Promise<ReadingSessionEntity[]> {
    const { data, error } = await this.supabase.schema('books').from('reading_sessions').select('*').eq('user_id', userId).order('started_at', { ascending: false });
    if (error) throw new Error(`Error fetching sessions: ${error.message}`);
    return (data || []).map((row: any) => ReadingSessionEntity.fromDatabase(row));
  }

  async findActiveByUser(userId: string): Promise<ReadingSessionEntity | null> {
    const { data, error } = await this.supabase.schema('books').from('reading_sessions').select('*').eq('user_id', userId).is('ended_at', null).order('started_at', { ascending: false }).limit(1).single();
    if (error || !data) return null;
    return ReadingSessionEntity.fromDatabase(data);
  }

  async create(dto: CreateReadingSessionDTO): Promise<ReadingSessionEntity> {
    const { data, error } = await this.supabase.schema('books').from('reading_sessions').insert({
      book_id: dto.bookId,
      user_id: dto.userId,
      start_page: dto.startPage,
      end_page: dto.endPage,
      device_type: dto.deviceType || null,
      language_code: dto.languageCode || null,
    }).select().single();
    if (error) throw new Error(`Error creating session: ${error.message}`);
    return ReadingSessionEntity.fromDatabase(data);
  }

  async endSession(id: string, dto: EndReadingSessionDTO): Promise<ReadingSessionEntity> {
    const { data, error } = await this.supabase.schema('books').from('reading_sessions').update({
      end_page: dto.endPage,
      ended_at: new Date().toISOString(),
      duration_seconds: dto.durationSeconds,
    }).eq('id', id).select().single();
    if (error) throw new Error(`Error ending session: ${error.message}`);
    return ReadingSessionEntity.fromDatabase(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('reading_sessions').delete().eq('id', id);
    if (error) throw new Error(`Error deleting session: ${error.message}`);
  }
}
