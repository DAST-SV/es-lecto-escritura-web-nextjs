// ============================================
// src/infrastructure/repositories/book-categories/BookCategoryRepository.ts
// Repository Implementation: BookCategory with Supabase
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import {
  IBookCategoryRepository,
  CreateBookCategoryDTO,
  UpdateBookCategoryDTO,
} from '@/src/core/domain/repositories/IBookCategoryRepository';
import { BookCategory } from '@/src/core/domain/entities/BookCategory';

export class BookCategoryRepository implements IBookCategoryRepository {
  private supabase = createClient();

  private mapToEntity(data: any): BookCategory {
    return BookCategory.fromDatabase(data);
  }

  async findAll(includeDeleted = false): Promise<BookCategory[]> {
    let query = this.supabase
      .schema('books')
      .from('categories')
      .select(`
        *,
        category_translations (
          id,
          language_code,
          name,
          description,
          is_active
        )
      `)
      .order('order_index')
      .order('slug');

    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Error al obtener categorías: ${error.message}`);
    return (data || []).map(this.mapToEntity);
  }

  async findById(id: string): Promise<BookCategory | null> {
    const { data, error } = await this.supabase
      .schema('books')
      .from('categories')
      .select(`
        *,
        category_translations (
          id,
          language_code,
          name,
          description,
          is_active
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error al obtener categoría: ${error.message}`);
    }
    return data ? this.mapToEntity(data) : null;
  }

  async findBySlug(slug: string): Promise<BookCategory | null> {
    const { data, error } = await this.supabase
      .schema('books')
      .from('categories')
      .select(`
        *,
        category_translations (
          id,
          language_code,
          name,
          description,
          is_active
        )
      `)
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error al obtener categoría por slug: ${error.message}`);
    }
    return data ? this.mapToEntity(data) : null;
  }

  async findActive(): Promise<BookCategory[]> {
    const { data, error } = await this.supabase
      .schema('books')
      .from('categories')
      .select(`
        *,
        category_translations (
          id,
          language_code,
          name,
          description,
          is_active
        )
      `)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('order_index')
      .order('slug');

    if (error) throw new Error(`Error al obtener categorías activas: ${error.message}`);
    return (data || []).map(this.mapToEntity);
  }

  async create(dto: CreateBookCategoryDTO): Promise<BookCategory> {
    // Validaciones
    if (!dto.slug?.trim()) {
      throw new Error('El slug es requerido');
    }
    if (!dto.translations || dto.translations.length === 0) {
      throw new Error('Se requiere al menos una traducción');
    }

    // Verificar slug único
    const existing = await this.findBySlug(dto.slug);
    if (existing) {
      throw new Error(`Ya existe una categoría con el slug "${dto.slug}"`);
    }

    // Crear categoría
    const { data: category, error: categoryError } = await this.supabase
      .schema('books')
      .from('categories')
      .insert({
        slug: dto.slug.toLowerCase().trim(),
        icon: dto.icon || null,
        color: dto.color || null,
        order_index: dto.orderIndex ?? 0,
        is_active: dto.isActive ?? true,
      })
      .select('*')
      .single();

    if (categoryError) throw new Error(`Error al crear categoría: ${categoryError.message}`);

    // Crear traducciones
    const translations = dto.translations.map(t => ({
      category_id: category.id,
      language_code: t.languageCode,
      name: t.name.trim(),
      description: t.description?.trim() || null,
      is_active: true,
    }));

    const { error: translationsError } = await this.supabase
      .schema('books')
      .from('category_translations')
      .insert(translations);

    if (translationsError) {
      // Rollback: eliminar categoría si las traducciones fallan
      await this.supabase.schema('books').from('categories').delete().eq('id', category.id);
      throw new Error(`Error al crear traducciones: ${translationsError.message}`);
    }

    // Retornar categoría completa
    const created = await this.findById(category.id);
    if (!created) throw new Error('Error al obtener categoría creada');
    return created;
  }

  async update(id: string, dto: UpdateBookCategoryDTO): Promise<BookCategory> {
    // Verificar que existe
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error('Categoría no encontrada');
    }

    // Verificar slug único si se está cambiando
    if (dto.slug && dto.slug !== existing.slug) {
      const slugExists = await this.findBySlug(dto.slug);
      if (slugExists) {
        throw new Error(`Ya existe una categoría con el slug "${dto.slug}"`);
      }
    }

    // Preparar datos de actualización
    const updateData: any = {};
    if (dto.slug !== undefined) updateData.slug = dto.slug.toLowerCase().trim();
    if (dto.icon !== undefined) updateData.icon = dto.icon;
    if (dto.color !== undefined) updateData.color = dto.color;
    if (dto.orderIndex !== undefined) updateData.order_index = dto.orderIndex;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    // Actualizar categoría si hay cambios
    if (Object.keys(updateData).length > 0) {
      const { error } = await this.supabase
        .schema('books')
        .from('categories')
        .update(updateData)
        .eq('id', id);

      if (error) throw new Error(`Error al actualizar categoría: ${error.message}`);
    }

    // Actualizar traducciones si se proporcionan
    if (dto.translations && dto.translations.length > 0) {
      for (const t of dto.translations) {
        const { error } = await this.supabase
          .schema('books')
          .from('category_translations')
          .upsert({
            category_id: id,
            language_code: t.languageCode,
            name: t.name.trim(),
            description: t.description?.trim() || null,
            is_active: true,
          }, {
            onConflict: 'category_id,language_code',
          });

        if (error) throw new Error(`Error al actualizar traducción (${t.languageCode}): ${error.message}`);
      }
    }

    // Retornar categoría actualizada
    const updated = await this.findById(id);
    if (!updated) throw new Error('Error al obtener categoría actualizada');
    return updated;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('books')
      .from('categories')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(`Error al eliminar categoría: ${error.message}`);
  }

  async restore(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('books')
      .from('categories')
      .update({ deleted_at: null })
      .eq('id', id);

    if (error) throw new Error(`Error al restaurar categoría: ${error.message}`);
  }

  async hardDelete(id: string): Promise<void> {
    // Las traducciones se eliminan automáticamente por CASCADE
    const { error } = await this.supabase
      .schema('books')
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Error al eliminar categoría permanentemente: ${error.message}`);
  }

  async reorder(items: Array<{ id: string; orderIndex: number }>): Promise<void> {
    const promises = items.map(({ id, orderIndex }) =>
      this.supabase
        .schema('books')
        .from('categories')
        .update({ order_index: orderIndex })
        .eq('id', id)
    );

    await Promise.all(promises);
  }
}
