// ============================================
// src/infrastructure/repositories/favorites/FavoriteRepository.ts
// Implementación Supabase del repositorio de favoritos
// ============================================

import { createClient } from '@/src/lib/supabase/client';
import { FavoriteEntity } from '@/src/core/domain/entities/FavoriteEntity';
import {
  IFavoriteRepository,
  CreateFavoriteDTO,
} from '@/src/core/domain/repositories/IFavoriteRepository';

export class FavoriteRepository implements IFavoriteRepository {
  private supabase = createClient();

  async findAll(): Promise<FavoriteEntity[]> {
    const { data, error } = await this.supabase.schema('books').from('favorites').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(`Error fetching favorites: ${error.message}`);
    return (data || []).map(row => FavoriteEntity.fromDatabase(row));
  }

  async findById(id: string): Promise<FavoriteEntity | null> {
    const { data, error } = await this.supabase.schema('books').from('favorites').select('*').eq('id', id).single();
    if (error || !data) return null;
    return FavoriteEntity.fromDatabase(data);
  }

  async findByBookId(bookId: string): Promise<FavoriteEntity[]> {
    const { data, error } = await this.supabase.schema('books').from('favorites').select('*').eq('book_id', bookId).order('created_at', { ascending: false });
    if (error) throw new Error(`Error fetching favorites: ${error.message}`);
    return (data || []).map(row => FavoriteEntity.fromDatabase(row));
  }

  async findByUserId(userId: string): Promise<FavoriteEntity[]> {
    const { data, error } = await this.supabase.schema('books').from('favorites').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw new Error(`Error fetching favorites: ${error.message}`);
    return (data || []).map(row => FavoriteEntity.fromDatabase(row));
  }

  async findByBookAndUser(bookId: string, userId: string): Promise<FavoriteEntity | null> {
    const { data, error } = await this.supabase.schema('books').from('favorites').select('*').eq('book_id', bookId).eq('user_id', userId).single();
    if (error || !data) return null;
    return FavoriteEntity.fromDatabase(data);
  }

  async isFavorite(bookId: string, userId: string): Promise<boolean> {
    const favorite = await this.findByBookAndUser(bookId, userId);
    return favorite !== null;
  }

  async create(dto: CreateFavoriteDTO): Promise<FavoriteEntity> {
    const { data, error } = await this.supabase.schema('books').from('favorites').insert({
      book_id: dto.bookId,
      user_id: dto.userId,
    }).select().single();
    if (error) throw new Error(`Error creating favorite: ${error.message}`);
    return FavoriteEntity.fromDatabase(data);
  }

  async toggle(bookId: string, userId: string): Promise<boolean> {
    const existing = await this.findByBookAndUser(bookId, userId);
    if (existing) {
      await this.delete(existing.id);
      return false;
    } else {
      await this.create({ bookId, userId });
      return true;
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('favorites').delete().eq('id', id);
    if (error) throw new Error(`Error deleting favorite: ${error.message}`);
  }

  async deleteByBookAndUser(bookId: string, userId: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('favorites').delete().eq('book_id', bookId).eq('user_id', userId);
    if (error) throw new Error(`Error deleting favorite: ${error.message}`);
  }
}
