// ============================================
// src/infrastructure/repositories/translation-categories/TranslationCategoryRepository.ts
// Repository Implementation: Translation Category with Supabase
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import {
  ITranslationCategoryRepository,
  CreateTranslationCategoryDTO,
  UpdateTranslationCategoryDTO,
} from '@/src/core/domain/repositories/ITranslationCategoryRepository';
import { TranslationCategory } from '@/src/core/domain/entities/TranslationCategory';

export class TranslationCategoryRepository implements ITranslationCategoryRepository {
  private supabase = createClient();

  private mapToEntity(data: any): TranslationCategory {
    return TranslationCategory.fromDatabase(data);
  }

  async findAll(includeInactive = false): Promise<TranslationCategory[]> {
    let query = this.supabase
      .schema('app')
      .from('translation_categories')
      .select('*')
      .order('name');

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch categories: ${error.message}`);
    return (data || []).map(this.mapToEntity);
  }

  async findById(id: string): Promise<TranslationCategory | null> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('translation_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch category: ${error.message}`);
    }
    return data ? this.mapToEntity(data) : null;
  }

  async findBySlug(slug: string): Promise<TranslationCategory | null> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('translation_categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch category: ${error.message}`);
    }
    return data ? this.mapToEntity(data) : null;
  }

  async create(dto: CreateTranslationCategoryDTO): Promise<TranslationCategory> {
    // Validaciones de entrada
    if (!dto.name || !dto.name.trim()) {
      throw new Error('El nombre de la categoría es requerido');
    }
    if (!dto.slug || !dto.slug.trim()) {
      throw new Error('El slug de la categoría es requerido');
    }

    const { data, error } = await this.supabase
      .schema('app')
      .from('translation_categories')
      .insert({
        name: dto.name,
        description: dto.description || null,
        slug: dto.slug,
        is_active: dto.isActive ?? true,
      })
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create category: ${error.message}`);
    return this.mapToEntity(data);
  }

  async update(id: string, dto: UpdateTranslationCategoryDTO): Promise<TranslationCategory> {
    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.slug !== undefined) updateData.slug = dto.slug;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const { data, error } = await this.supabase
      .schema('app')
      .from('translation_categories')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to update category: ${error.message}`);
    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('app')
      .from('translation_categories')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete category: ${error.message}`);
  }
}