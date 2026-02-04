// ============================================
// src/infrastructure/repositories/book-authors/BookAuthorRepository.ts
// Repository Implementation: BookAuthor with Supabase
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import { IBookAuthorRepository, CreateBookAuthorDTO, UpdateBookAuthorDTO } from '@/src/core/domain/repositories/IBookAuthorRepository';
import { BookAuthor } from '@/src/core/domain/entities/BookAuthor';

export class BookAuthorRepository implements IBookAuthorRepository {
  private supabase = createClient();

  async findAll(includeDeleted = false): Promise<BookAuthor[]> {
    let query = this.supabase
      .schema('books')
      .from('authors')
      .select(`*, author_translations (id, language_code, name, bio, is_active)`)
      .order('slug');

    if (!includeDeleted) query = query.is('deleted_at', null);

    const { data, error } = await query;
    if (error) throw new Error(`Error al obtener autores: ${error.message}`);
    return (data || []).map(BookAuthor.fromDatabase);
  }

  async findById(id: string): Promise<BookAuthor | null> {
    const { data, error } = await this.supabase
      .schema('books')
      .from('authors')
      .select(`*, author_translations (id, language_code, name, bio, is_active)`)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error al obtener autor: ${error.message}`);
    }
    return data ? BookAuthor.fromDatabase(data) : null;
  }

  async findBySlug(slug: string): Promise<BookAuthor | null> {
    const { data, error } = await this.supabase
      .schema('books')
      .from('authors')
      .select(`*, author_translations (id, language_code, name, bio, is_active)`)
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error al obtener autor: ${error.message}`);
    }
    return data ? BookAuthor.fromDatabase(data) : null;
  }

  async findActive(): Promise<BookAuthor[]> {
    const { data, error } = await this.supabase
      .schema('books')
      .from('authors')
      .select(`*, author_translations (id, language_code, name, bio, is_active)`)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('slug');

    if (error) throw new Error(`Error al obtener autores activos: ${error.message}`);
    return (data || []).map(BookAuthor.fromDatabase);
  }

  async create(dto: CreateBookAuthorDTO): Promise<BookAuthor> {
    if (!dto.slug?.trim()) throw new Error('El slug es requerido');
    if (!dto.translations?.length) throw new Error('Se requiere al menos una traducción');

    const existing = await this.findBySlug(dto.slug);
    if (existing) throw new Error(`Ya existe un autor con el slug "${dto.slug}"`);

    const { data: author, error: authorError } = await this.supabase
      .schema('books')
      .from('authors')
      .insert({
        slug: dto.slug.toLowerCase().trim(),
        avatar_url: dto.avatarUrl || null,
        website_url: dto.websiteUrl || null,
        is_active: dto.isActive ?? true,
      })
      .select('*')
      .single();

    if (authorError) throw new Error(`Error al crear autor: ${authorError.message}`);

    const translations = dto.translations.map(t => ({
      author_id: author.id,
      language_code: t.languageCode,
      name: t.name.trim(),
      bio: t.bio?.trim() || null,
      is_active: true,
    }));

    const { error: translationsError } = await this.supabase
      .schema('books')
      .from('author_translations')
      .insert(translations);

    if (translationsError) {
      await this.supabase.schema('books').from('authors').delete().eq('id', author.id);
      throw new Error(`Error al crear traducciones: ${translationsError.message}`);
    }

    const created = await this.findById(author.id);
    if (!created) throw new Error('Error al obtener autor creado');
    return created;
  }

  async update(id: string, dto: UpdateBookAuthorDTO): Promise<BookAuthor> {
    const existing = await this.findById(id);
    if (!existing) throw new Error('Autor no encontrado');

    if (dto.slug && dto.slug !== existing.slug) {
      const slugExists = await this.findBySlug(dto.slug);
      if (slugExists) throw new Error(`Ya existe un autor con el slug "${dto.slug}"`);
    }

    const updateData: any = {};
    if (dto.slug !== undefined) updateData.slug = dto.slug.toLowerCase().trim();
    if (dto.avatarUrl !== undefined) updateData.avatar_url = dto.avatarUrl;
    if (dto.websiteUrl !== undefined) updateData.website_url = dto.websiteUrl;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    if (Object.keys(updateData).length > 0) {
      const { error } = await this.supabase.schema('books').from('authors').update(updateData).eq('id', id);
      if (error) throw new Error(`Error al actualizar autor: ${error.message}`);
    }

    if (dto.translations?.length) {
      for (const t of dto.translations) {
        const { error } = await this.supabase
          .schema('books')
          .from('author_translations')
          .upsert({
            author_id: id,
            language_code: t.languageCode,
            name: t.name.trim(),
            bio: t.bio?.trim() || null,
            is_active: true,
          }, { onConflict: 'author_id,language_code' });

        if (error) throw new Error(`Error al actualizar traducción: ${error.message}`);
      }
    }

    const updated = await this.findById(id);
    if (!updated) throw new Error('Error al obtener autor actualizado');
    return updated;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('authors').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) throw new Error(`Error al eliminar autor: ${error.message}`);
  }

  async restore(id: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('authors').update({ deleted_at: null }).eq('id', id);
    if (error) throw new Error(`Error al restaurar autor: ${error.message}`);
  }

  async hardDelete(id: string): Promise<void> {
    const { error } = await this.supabase.schema('books').from('authors').delete().eq('id', id);
    if (error) throw new Error(`Error al eliminar autor: ${error.message}`);
  }
}
