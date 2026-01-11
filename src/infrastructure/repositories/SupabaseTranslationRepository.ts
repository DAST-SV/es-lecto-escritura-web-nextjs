// ============================================
// src/infrastructure/repositories/SupabaseTranslationRepository.ts
// Implementación: Repositorio de Traducciones con Supabase
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import {
  TranslationRepository,
  CreateTranslationDTO,
  UpdateTranslationDTO,
  BulkCreateTranslationDTO,
} from '@/src/core/domain/repositories/TranslationRepository';
import { Translation } from '@/src/core/domain/entities/Translation';

export class SupabaseTranslationRepository implements TranslationRepository {
  private supabase = createClient();

  async findAll(): Promise<Translation[]> {
    const { data, error } = await this.supabase
      .from('translations')
      .select('*')
      .order('namespace_slug', { ascending: true })
      .order('translation_key', { ascending: true });

    if (error) {
      throw new Error(`Error fetching translations: ${error.message}`);
    }

    return (data || []).map(Translation.fromDatabase);
  }

  async findById(id: string): Promise<Translation | null> {
    const { data, error } = await this.supabase
      .from('translations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error fetching translation: ${error.message}`);
    }

    return Translation.fromDatabase(data);
  }

  async findByNamespace(namespaceSlug: string): Promise<Translation[]> {
    const { data, error } = await this.supabase
      .from('translations')
      .select('*')
      .eq('namespace_slug', namespaceSlug)
      .order('translation_key', { ascending: true });

    if (error) {
      throw new Error(`Error fetching translations by namespace: ${error.message}`);
    }

    return (data || []).map(Translation.fromDatabase);
  }

  async findByLanguage(languageCode: string): Promise<Translation[]> {
    const { data, error } = await this.supabase
      .from('translations')
      .select('*')
      .eq('language_code', languageCode)
      .order('namespace_slug', { ascending: true })
      .order('translation_key', { ascending: true });

    if (error) {
      throw new Error(`Error fetching translations by language: ${error.message}`);
    }

    return (data || []).map(Translation.fromDatabase);
  }

  async findByKey(
    namespaceSlug: string,
    translationKey: string,
    languageCode: string
  ): Promise<Translation | null> {
    const { data, error } = await this.supabase
      .from('translations')
      .select('*')
      .eq('namespace_slug', namespaceSlug)
      .eq('translation_key', translationKey)
      .eq('language_code', languageCode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error fetching translation: ${error.message}`);
    }

    return Translation.fromDatabase(data);
  }

  async create(dto: CreateTranslationDTO): Promise<Translation> {
    const { data, error } = await this.supabase
      .from('translations')
      .insert({
        namespace_slug: dto.namespaceSlug,
        translation_key: dto.translationKey,
        language_code: dto.languageCode,
        value: dto.value,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating translation: ${error.message}`);
    }

    return Translation.fromDatabase(data);
  }

  async createBulk(dto: BulkCreateTranslationDTO): Promise<Translation[]> {
    const insertData = dto.translations.map(t => ({
      namespace_slug: dto.namespaceSlug,
      translation_key: dto.translationKey,
      language_code: t.languageCode,
      value: t.value,
    }));

    const { data, error } = await this.supabase
      .from('translations')
      .insert(insertData)
      .select();

    if (error) {
      throw new Error(`Error creating bulk translations: ${error.message}`);
    }

    return (data || []).map(Translation.fromDatabase);
  }

  async update(id: string, dto: UpdateTranslationDTO): Promise<Translation> {
    const updateData: any = {};
    if (dto.value !== undefined) updateData.value = dto.value;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const { data, error } = await this.supabase
      .from('translations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating translation: ${error.message}`);
    }

    return Translation.fromDatabase(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('translations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting translation: ${error.message}`);
    }
  }
}