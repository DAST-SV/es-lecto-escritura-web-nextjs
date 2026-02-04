// ============================================
// src/infrastructure/repositories/book-tags/BookTagRepository.ts
// Repository Implementation: BookTag with Supabase
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import { IBookTagRepository, CreateBookTagDTO, UpdateBookTagDTO } from '@/src/core/domain/repositories/IBookTagRepository';
import { BookTag } from '@/src/core/domain/entities/BookTag';

export class BookTagRepository implements IBookTagRepository {
  private supabase = createClient();

  async findAll(includeDeleted = false): Promise<BookTag[]> {
    let query = this.supabase
      .schema('books')
      .from('tags')
      .select(`*, tag_translations (id, language_code, name, is_active)`)
      .order('slug');

    if (!includeDeleted) query = query.is('deleted_at', null);

    const { data, error } = await query;
    if (error) throw new Error(`Error al obtener etiquetas: ${error.message}`);
    return (data || []).map(BookTag.fromDatabase);
  }

  async findById(id: string): Promise<BookTag | null> {
    const { data, error } = await this.supabase
      .schema('books')
      .from('tags')
      .select(`*, tag_translations (id, language_code, name, is_active)`)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error al obtener etiqueta: ${error.message}`);
    }
    return data ? BookTag.fromDatabase(data) : null;
  }

  async findBySlug(slug: string): Promise<BookTag | null> {
    const { data, error } = await this.supabase
      .schema('books')
      .from('tags')
      .select(`*, tag_translations (id, language_code, name, is_active)`)
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error al obtener etiqueta: ${error.message}`);
    }
    return data ? BookTag.fromDatabase(data) : null;
  }

  async findActive(): Promise<BookTag[]> {
    const { data, error } = await this.supabase
      .schema('books')
      .from('tags')
      .select(`*, tag_translations (id, language_code, name, is_active)`)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('slug');

    if (error) throw new Error(`Error al obtener etiquetas activas: ${error.message}`);
    return (data || []).map(BookTag.fromDatabase);
  }

  async create(dto: CreateBookTagDTO): Promise<BookTag> {
    if (!dto.slug?.trim()) throw new Error('El slug es requerido');
    if (!dto.translations?.length) throw new Error('Se requiere al menos una traducción');

    const existing = await this.findBySlug(dto.slug);
    if (existing) throw new Error(`Ya existe una etiqueta con el slug "${dto.slug}"`);

    const { data: tag, error: tagError } = await this.supabase
      .schema('books')
      .from('tags')
      .insert({
        slug: dto.slug.toLowerCase().trim(),
        color: dto.color || null,
        is_active: dto.isActive ?? true,
      })
      .select('*')
      .single();

    if (tagError) throw new Error(`Error al crear etiqueta: ${tagError.message}`);

    const translations = dto.translations.map(t => ({
      tag_id: tag.id,
      language_code: t.languageCode,
      name: t.name.trim(),
      is_active: true,
    }));

    const { error: translationsError } = await this.supabase
      .schema('books')
      .from('tag_translations')
      .insert(translations);

    if (translationsError) {
      await this.supabase.schema('books').from('tags').delete().eq('id', tag.id);
      throw new Error(`Error al crear traducciones: ${translationsError.message}`);
    }

    const created = await this.findById(tag.id);
    if (!created) throw new Error('Error al obtener etiqueta creada');
    return created;
  }

  async update(id: string, dto: UpdateBookTagDTO): Promise<BookTag> {
    const existing = await this.findById(id);
    if (!existing) throw new Error('Etiqueta no encontrada');

    if (dto.slug && dto.slug !== existing.slug) {
      const slugExists = await this.findBySlug(dto.slug);
      if (slugExists) throw new Error(`Ya existe una etiqueta con el slug "${dto.slug}"`);
    }

    const updateData: any = {};
    if (dto.slug !== undefined) updateData.slug = dto.slug.toLowerCase().trim();
    if (dto.color !== undefined) updateData.color = dto.color;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    if (Object.keys(updateData).length > 0) {
      const { error } = await this.supabase.schema('books').from('tags').update(updateData).eq('id', id);
      if (error) throw new Error(`Error al actualizar etiqueta: ${error.message}`);
    }

    if (dto.translations?.length) {
      for (const t of dto.translations) {
        const { error } = await this.supabase
          .schema('books')
          .from('tag_translations')
          .upsert({ tag_id: id, language_code: t.languageCode, name: t.name.trim(), is_active: true }, { onConflict: 'tag_id,language_code' });

        if (error) throw new Error(`Error al actualizar traducción: ${error.message}`);
      }
    }

    const updated = await this.findById(id);
    if (!updated) throw new Error('Error al obtener etiqueta actualizada');
    return updated;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('tags').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) throw new Error(`Error al eliminar etiqueta: ${error.message}`);
  }

  async restore(id: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('tags').update({ deleted_at: null }).eq('id', id);
    if (error) throw new Error(`Error al restaurar etiqueta: ${error.message}`);
  }

  async hardDelete(id: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('tags').delete().eq('id', id);
    if (error) throw new Error(`Error al eliminar etiqueta: ${error.message}`);
  }
}
