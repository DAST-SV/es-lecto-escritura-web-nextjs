// ============================================
// src/infrastructure/repositories/book-levels/BookLevelRepository.ts
// Repository Implementation: BookLevel with Supabase
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import {
  IBookLevelRepository,
  CreateBookLevelDTO,
  UpdateBookLevelDTO,
} from '@/src/core/domain/repositories/IBookLevelRepository';
import { BookLevel } from '@/src/core/domain/entities/BookLevel';

export class BookLevelRepository implements IBookLevelRepository {
  private supabase = createClient();

  private mapToEntity(data: any): BookLevel {
    return BookLevel.fromDatabase(data);
  }

  async findAll(includeDeleted = false): Promise<BookLevel[]> {
    let query = this.supabase
      .schema('books')
      .from('levels')
      .select(`
        *,
        level_translations (
          id,
          language_code,
          name,
          description,
          age_label,
          is_active
        )
      `)
      .order('order_index')
      .order('min_age');

    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Error al obtener niveles: ${error.message}`);
    return (data || []).map(this.mapToEntity);
  }

  async findById(id: string): Promise<BookLevel | null> {
    const { data, error } = await this.supabase
      .schema('books')
      .from('levels')
      .select(`
        *,
        level_translations (
          id,
          language_code,
          name,
          description,
          age_label,
          is_active
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error al obtener nivel: ${error.message}`);
    }
    return data ? this.mapToEntity(data) : null;
  }

  async findBySlug(slug: string): Promise<BookLevel | null> {
    const { data, error } = await this.supabase
      .schema('books')
      .from('levels')
      .select(`
        *,
        level_translations (
          id,
          language_code,
          name,
          description,
          age_label,
          is_active
        )
      `)
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error al obtener nivel por slug: ${error.message}`);
    }
    return data ? this.mapToEntity(data) : null;
  }

  async findActive(): Promise<BookLevel[]> {
    const { data, error } = await this.supabase
      .schema('books')
      .from('levels')
      .select(`
        *,
        level_translations (
          id,
          language_code,
          name,
          description,
          age_label,
          is_active
        )
      `)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('order_index')
      .order('min_age');

    if (error) throw new Error(`Error al obtener niveles activos: ${error.message}`);
    return (data || []).map(this.mapToEntity);
  }

  async findByAgeRange(minAge: number, maxAge: number): Promise<BookLevel[]> {
    const { data, error } = await this.supabase
      .schema('books')
      .from('levels')
      .select(`
        *,
        level_translations (
          id,
          language_code,
          name,
          description,
          age_label,
          is_active
        )
      `)
      .lte('min_age', maxAge)
      .gte('max_age', minAge)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('min_age');

    if (error) throw new Error(`Error al buscar niveles por edad: ${error.message}`);
    return (data || []).map(this.mapToEntity);
  }

  async create(dto: CreateBookLevelDTO): Promise<BookLevel> {
    // Validaciones
    if (!dto.slug?.trim()) {
      throw new Error('El slug es requerido');
    }
    if (dto.minAge === undefined || dto.maxAge === undefined) {
      throw new Error('El rango de edad es requerido');
    }
    if (dto.minAge > dto.maxAge) {
      throw new Error('La edad mínima no puede ser mayor que la máxima');
    }
    if (!dto.translations || dto.translations.length === 0) {
      throw new Error('Se requiere al menos una traducción');
    }

    // Verificar slug único
    const existing = await this.findBySlug(dto.slug);
    if (existing) {
      throw new Error(`Ya existe un nivel con el slug "${dto.slug}"`);
    }

    // Crear nivel
    const { data: level, error: levelError } = await this.supabase
      .schema('books')
      .from('levels')
      .insert({
        slug: dto.slug.toLowerCase().trim(),
        min_age: dto.minAge,
        max_age: dto.maxAge,
        grade_min: dto.gradeMin ?? null,
        grade_max: dto.gradeMax ?? null,
        color: dto.color || null,
        icon: dto.icon || null,
        order_index: dto.orderIndex ?? 0,
        is_active: dto.isActive ?? true,
      })
      .select('*')
      .single();

    if (levelError) throw new Error(`Error al crear nivel: ${levelError.message}`);

    // Crear traducciones
    const translations = dto.translations.map(t => ({
      level_id: level.id,
      language_code: t.languageCode,
      name: t.name.trim(),
      description: t.description?.trim() || null,
      age_label: t.ageLabel?.trim() || null,
      is_active: true,
    }));

    const { error: translationsError } = await this.supabase
      .schema('books')
      .from('level_translations')
      .insert(translations);

    if (translationsError) {
      await this.supabase.schema('books').from('levels').delete().eq('id', level.id);
      throw new Error(`Error al crear traducciones: ${translationsError.message}`);
    }

    const created = await this.findById(level.id);
    if (!created) throw new Error('Error al obtener nivel creado');
    return created;
  }

  async update(id: string, dto: UpdateBookLevelDTO): Promise<BookLevel> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error('Nivel no encontrado');
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const slugExists = await this.findBySlug(dto.slug);
      if (slugExists) {
        throw new Error(`Ya existe un nivel con el slug "${dto.slug}"`);
      }
    }

    // Validar rango de edades
    const newMinAge = dto.minAge ?? existing.minAge;
    const newMaxAge = dto.maxAge ?? existing.maxAge;
    if (newMinAge > newMaxAge) {
      throw new Error('La edad mínima no puede ser mayor que la máxima');
    }

    const updateData: any = {};
    if (dto.slug !== undefined) updateData.slug = dto.slug.toLowerCase().trim();
    if (dto.minAge !== undefined) updateData.min_age = dto.minAge;
    if (dto.maxAge !== undefined) updateData.max_age = dto.maxAge;
    if (dto.gradeMin !== undefined) updateData.grade_min = dto.gradeMin;
    if (dto.gradeMax !== undefined) updateData.grade_max = dto.gradeMax;
    if (dto.color !== undefined) updateData.color = dto.color;
    if (dto.icon !== undefined) updateData.icon = dto.icon;
    if (dto.orderIndex !== undefined) updateData.order_index = dto.orderIndex;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    if (Object.keys(updateData).length > 0) {
      const { error } = await this.supabase
        .schema('books')
        .from('levels')
        .update(updateData)
        .eq('id', id);

      if (error) throw new Error(`Error al actualizar nivel: ${error.message}`);
    }

    if (dto.translations && dto.translations.length > 0) {
      for (const t of dto.translations) {
        const { error } = await this.supabase
          .schema('books')
          .from('level_translations')
          .upsert({
            level_id: id,
            language_code: t.languageCode,
            name: t.name.trim(),
            description: t.description?.trim() || null,
            age_label: t.ageLabel?.trim() || null,
            is_active: true,
          }, {
            onConflict: 'level_id,language_code',
          });

        if (error) throw new Error(`Error al actualizar traducción (${t.languageCode}): ${error.message}`);
      }
    }

    const updated = await this.findById(id);
    if (!updated) throw new Error('Error al obtener nivel actualizado');
    return updated;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('books')
      .from('levels')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(`Error al eliminar nivel: ${error.message}`);
  }

  async restore(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('books')
      .from('levels')
      .update({ deleted_at: null })
      .eq('id', id);

    if (error) throw new Error(`Error al restaurar nivel: ${error.message}`);
  }

  async hardDelete(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('books')
      .from('levels')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Error al eliminar nivel permanentemente: ${error.message}`);
  }

  async reorder(items: Array<{ id: string; orderIndex: number }>): Promise<void> {
    const promises = items.map(({ id, orderIndex }) =>
      this.supabase
        .schema('books')
        .from('levels')
        .update({ order_index: orderIndex })
        .eq('id', id)
    );

    await Promise.all(promises);
  }
}
