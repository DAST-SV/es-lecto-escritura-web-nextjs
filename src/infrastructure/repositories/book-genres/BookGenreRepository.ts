// ============================================
// src/infrastructure/repositories/book-genres/BookGenreRepository.ts
// Repository Implementation: BookGenre with Supabase
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import {
  IBookGenreRepository,
  CreateBookGenreDTO,
  UpdateBookGenreDTO,
} from '@/src/core/domain/repositories/IBookGenreRepository';
import { BookGenre } from '@/src/core/domain/entities/BookGenre';

export class BookGenreRepository implements IBookGenreRepository {
  private supabase = createClient();

  private mapToEntity(data: any): BookGenre {
    return BookGenre.fromDatabase(data);
  }

  async findAll(includeDeleted = false): Promise<BookGenre[]> {
    let query = this.supabase
      .schema('books')
      .from('genres')
      .select(`*, genre_translations (id, language_code, name, description, is_active)`)
      .order('order_index')
      .order('slug');

    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Error al obtener géneros: ${error.message}`);
    return (data || []).map(this.mapToEntity);
  }

  async findById(id: string): Promise<BookGenre | null> {
    const { data, error } = await this.supabase
      .schema('books')
      .from('genres')
      .select(`*, genre_translations (id, language_code, name, description, is_active)`)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error al obtener género: ${error.message}`);
    }
    return data ? this.mapToEntity(data) : null;
  }

  async findBySlug(slug: string): Promise<BookGenre | null> {
    const { data, error } = await this.supabase
      .schema('books')
      .from('genres')
      .select(`*, genre_translations (id, language_code, name, description, is_active)`)
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error al obtener género: ${error.message}`);
    }
    return data ? this.mapToEntity(data) : null;
  }

  async findActive(): Promise<BookGenre[]> {
    const { data, error } = await this.supabase
      .schema('books')
      .from('genres')
      .select(`*, genre_translations (id, language_code, name, description, is_active)`)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('order_index');

    if (error) throw new Error(`Error al obtener géneros activos: ${error.message}`);
    return (data || []).map(this.mapToEntity);
  }

  async create(dto: CreateBookGenreDTO): Promise<BookGenre> {
    if (!dto.slug?.trim()) throw new Error('El slug es requerido');
    if (!dto.translations?.length) throw new Error('Se requiere al menos una traducción');

    const existing = await this.findBySlug(dto.slug);
    if (existing) throw new Error(`Ya existe un género con el slug "${dto.slug}"`);

    const { data: genre, error: genreError } = await this.supabase
      .schema('books')
      .from('genres')
      .insert({
        slug: dto.slug.toLowerCase().trim(),
        icon: dto.icon || null,
        color: dto.color || null,
        order_index: dto.orderIndex ?? 0,
        is_active: dto.isActive ?? true,
      })
      .select('*')
      .single();

    if (genreError) throw new Error(`Error al crear género: ${genreError.message}`);

    const translations = dto.translations.map(t => ({
      genre_id: genre.id,
      language_code: t.languageCode,
      name: t.name.trim(),
      description: t.description?.trim() || null,
      is_active: true,
    }));

    const { error: translationsError } = await this.supabase
      .schema('books')
      .from('genre_translations')
      .insert(translations);

    if (translationsError) {
      await this.supabase.schema('books').from('genres').delete().eq('id', genre.id);
      throw new Error(`Error al crear traducciones: ${translationsError.message}`);
    }

    const created = await this.findById(genre.id);
    if (!created) throw new Error('Error al obtener género creado');
    return created;
  }

  async update(id: string, dto: UpdateBookGenreDTO): Promise<BookGenre> {
    const existing = await this.findById(id);
    if (!existing) throw new Error('Género no encontrado');

    if (dto.slug && dto.slug !== existing.slug) {
      const slugExists = await this.findBySlug(dto.slug);
      if (slugExists) throw new Error(`Ya existe un género con el slug "${dto.slug}"`);
    }

    const updateData: any = {};
    if (dto.slug !== undefined) updateData.slug = dto.slug.toLowerCase().trim();
    if (dto.icon !== undefined) updateData.icon = dto.icon;
    if (dto.color !== undefined) updateData.color = dto.color;
    if (dto.orderIndex !== undefined) updateData.order_index = dto.orderIndex;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    if (Object.keys(updateData).length > 0) {
      const { error } = await this.supabase.schema('books').from('genres').update(updateData).eq('id', id);
      if (error) throw new Error(`Error al actualizar género: ${error.message}`);
    }

    if (dto.translations?.length) {
      for (const t of dto.translations) {
        const { error } = await this.supabase
          .schema('books')
          .from('genre_translations')
          .upsert({
            genre_id: id,
            language_code: t.languageCode,
            name: t.name.trim(),
            description: t.description?.trim() || null,
            is_active: true,
          }, { onConflict: 'genre_id,language_code' });

        if (error) throw new Error(`Error al actualizar traducción: ${error.message}`);
      }
    }

    const updated = await this.findById(id);
    if (!updated) throw new Error('Error al obtener género actualizado');
    return updated;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('genres')
      .update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) throw new Error(`Error al eliminar género: ${error.message}`);
  }

  async restore(id: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('genres')
      .update({ deleted_at: null }).eq('id', id);
    if (error) throw new Error(`Error al restaurar género: ${error.message}`);
  }

  async hardDelete(id: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('genres').delete().eq('id', id);
    if (error) throw new Error(`Error al eliminar género: ${error.message}`);
  }

  async reorder(items: Array<{ id: string; orderIndex: number }>): Promise<void> {
    await Promise.all(items.map(({ id, orderIndex }) =>
      this.supabase.schema('books').from('genres').update({ order_index: orderIndex }).eq('id', id)
    ));
  }
}
