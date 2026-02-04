// ============================================
// src/infrastructure/repositories/book-pages/BookPageRepository.ts
// Implementación Supabase del repositorio de páginas de libros
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import { BookPageEntity } from '@/src/core/domain/entities/BookPageEntity';
import {
  IBookPageRepository2,
  CreateBookPageDTO,
  UpdateBookPageDTO,
  CreatePageTranslationDTO,
} from '@/src/core/domain/repositories/IBookPageRepository2';

export class BookPageRepository implements IBookPageRepository2 {
  private supabase = createClient();

  async findAll(): Promise<BookPageEntity[]> {
    const { data, error } = await this.supabase.schema('books').from('pages').select('*').order('book_id').order('page_number');
    if (error) throw new Error(`Error fetching pages: ${error.message}`);

    const pageIds = (data || []).map(p => p.id);
    const { data: translations } = await this.supabase.schema('books').from('page_translations').select('*').in('page_id', pageIds);

    return (data || []).map(row => {
      const pageTrans = (translations || []).filter((t: any) => t.page_id === row.id);
      return BookPageEntity.fromDatabase(row, pageTrans);
    });
  }

  async findById(id: string): Promise<BookPageEntity | null> {
    const { data, error } = await this.supabase.schema('books').from('pages').select('*').eq('id', id).single();
    if (error || !data) return null;

    const { data: translations } = await this.supabase.schema('books').from('page_translations').select('*').eq('page_id', id);
    return BookPageEntity.fromDatabase(data, translations || []);
  }

  async findByBookId(bookId: string): Promise<BookPageEntity[]> {
    const { data, error } = await this.supabase.schema('books').from('pages').select('*').eq('book_id', bookId).order('page_number');
    if (error) throw new Error(`Error fetching pages: ${error.message}`);

    const pageIds = (data || []).map(p => p.id);
    const { data: translations } = await this.supabase.schema('books').from('page_translations').select('*').in('page_id', pageIds);

    return (data || []).map(row => {
      const pageTrans = (translations || []).filter((t: any) => t.page_id === row.id);
      return BookPageEntity.fromDatabase(row, pageTrans);
    });
  }

  async findByBookIdAndPage(bookId: string, pageNumber: number): Promise<BookPageEntity | null> {
    const { data, error } = await this.supabase.schema('books').from('pages').select('*').eq('book_id', bookId).eq('page_number', pageNumber).single();
    if (error || !data) return null;

    const { data: translations } = await this.supabase.schema('books').from('page_translations').select('*').eq('page_id', data.id);
    return BookPageEntity.fromDatabase(data, translations || []);
  }

  async create(dto: CreateBookPageDTO): Promise<BookPageEntity> {
    const { data, error } = await this.supabase.schema('books').from('pages').insert({
      book_id: dto.bookId,
      page_number: dto.pageNumber,
      image_url: dto.imageUrl || null,
      audio_url: dto.audioUrl || null,
      has_interaction: dto.hasInteraction || false,
      interaction_type: dto.interactionType || null,
      interaction_data: dto.interactionData || null,
    }).select().single();
    if (error) throw new Error(`Error creating page: ${error.message}`);

    if (dto.translations && dto.translations.length > 0) {
      await this.supabase.schema('books').from('page_translations').insert(
        dto.translations.map(t => ({
          page_id: data.id,
          language_code: t.languageCode,
          content: t.content,
          audio_url: t.audioUrl || null,
          is_active: t.isActive !== false,
        }))
      );
    }

    return (await this.findById(data.id))!;
  }

  async update(id: string, dto: UpdateBookPageDTO): Promise<BookPageEntity> {
    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    if (dto.pageNumber !== undefined) updateData.page_number = dto.pageNumber;
    if (dto.imageUrl !== undefined) updateData.image_url = dto.imageUrl;
    if (dto.audioUrl !== undefined) updateData.audio_url = dto.audioUrl;
    if (dto.hasInteraction !== undefined) updateData.has_interaction = dto.hasInteraction;
    if (dto.interactionType !== undefined) updateData.interaction_type = dto.interactionType;
    if (dto.interactionData !== undefined) updateData.interaction_data = dto.interactionData;

    const { error } = await this.supabase.schema('books').from('pages').update(updateData).eq('id', id);
    if (error) throw new Error(`Error updating page: ${error.message}`);

    if (dto.translations) {
      await this.supabase.schema('books').from('page_translations').delete().eq('page_id', id);
      if (dto.translations.length > 0) {
        await this.supabase.schema('books').from('page_translations').insert(
          dto.translations.map(t => ({
            page_id: id,
            language_code: t.languageCode,
            content: t.content,
            audio_url: t.audioUrl || null,
            is_active: t.isActive !== false,
          }))
        );
      }
    }

    return (await this.findById(id))!;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('pages').delete().eq('id', id);
    if (error) throw new Error(`Error deleting page: ${error.message}`);
  }

  async addTranslation(pageId: string, data: CreatePageTranslationDTO): Promise<void> {
    const { error } = await this.supabase.schema('books').from('page_translations').insert({
      page_id: pageId,
      language_code: data.languageCode,
      content: data.content,
      audio_url: data.audioUrl || null,
      is_active: data.isActive !== false,
    });
    if (error) throw new Error(`Error adding translation: ${error.message}`);
  }

  async updateTranslation(pageId: string, languageCode: string, data: Partial<CreatePageTranslationDTO>): Promise<void> {
    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    if (data.content !== undefined) updateData.content = data.content;
    if (data.audioUrl !== undefined) updateData.audio_url = data.audioUrl;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    const { error } = await this.supabase.schema('books').from('page_translations').update(updateData).eq('page_id', pageId).eq('language_code', languageCode);
    if (error) throw new Error(`Error updating translation: ${error.message}`);
  }

  async deleteTranslation(pageId: string, languageCode: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('page_translations').delete().eq('page_id', pageId).eq('language_code', languageCode);
    if (error) throw new Error(`Error deleting translation: ${error.message}`);
  }

  async reorderPages(bookId: string, pageIds: string[]): Promise<void> {
    for (let i = 0; i < pageIds.length; i++) {
      await this.supabase.schema('books').from('pages').update({ page_number: i + 1, updated_at: new Date().toISOString() }).eq('id', pageIds[i]);
    }
  }
}
