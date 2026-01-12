// ============================================
// src/infrastructure/repositories/SupabaseTranslationRepository.ts
// ✅ CORREGIDO: Todas las referencias a translation_key cambiadas a key_name
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
      .select(`
        *,
        translation_keys!inner (
          namespace_slug,
          key_name
        )
      `)
      .order('namespace_slug', { ascending: true })
      .order('key_name', { ascending: true });

    if (error) {
      throw new Error(`Error fetching translations: ${error.message}`);
    }

    // ✅ CORRECCIÓN: Mapear correctamente desde la base de datos
    return (data || []).map((row: any) => Translation.fromDatabase({
      ...row,
      namespace_slug: row.translation_keys?.namespace_slug,
      key_name: row.translation_keys?.key_name,
    }));
  }

  async findById(id: string): Promise<Translation | null> {
    const { data, error } = await this.supabase
      .from('translations')
      .select(`
        *,
        translation_keys!inner (
          namespace_slug,
          key_name
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error fetching translation: ${error.message}`);
    }

    // ✅ CORRECCIÓN: Mapear correctamente
    return Translation.fromDatabase({
      ...data,
      namespace_slug: data.translation_keys?.namespace_slug,
      key_name: data.translation_keys?.key_name,
    });
  }

  async findByNamespace(namespaceSlug: string): Promise<Translation[]> {
    const { data, error } = await this.supabase
      .from('translations')
      .select(`
        *,
        translation_keys!inner (
          namespace_slug,
          key_name
        )
      `)
      .eq('translation_keys.namespace_slug', namespaceSlug)
      .order('key_name', { ascending: true });

    if (error) {
      throw new Error(`Error fetching translations by namespace: ${error.message}`);
    }

    // ✅ CORRECCIÓN: Mapear correctamente
    return (data || []).map((row: any) => Translation.fromDatabase({
      ...row,
      namespace_slug: row.translation_keys?.namespace_slug,
      key_name: row.translation_keys?.key_name,
    }));
  }

  async findByLanguage(languageCode: string): Promise<Translation[]> {
    const { data, error } = await this.supabase
      .from('translations')
      .select(`
        *,
        translation_keys!inner (
          namespace_slug,
          key_name
        )
      `)
      .eq('language_code', languageCode)
      .order('namespace_slug', { ascending: true })
      .order('key_name', { ascending: true });

    if (error) {
      throw new Error(`Error fetching translations by language: ${error.message}`);
    }

    // ✅ CORRECCIÓN: Mapear correctamente
    return (data || []).map((row: any) => Translation.fromDatabase({
      ...row,
      namespace_slug: row.translation_keys?.namespace_slug,
      key_name: row.translation_keys?.key_name,
    }));
  }

  async findByKey(
    namespaceSlug: string,
    translationKey: string,
    languageCode: string
  ): Promise<Translation | null> {
    // Primero encontrar la translation_key
    const { data: keyData, error: keyError } = await this.supabase
      .from('translation_keys')
      .select('id')
      .eq('namespace_slug', namespaceSlug)
      .eq('key_name', translationKey)  // ✅ CORRECCIÓN: key_name
      .single();

    if (keyError || !keyData) {
      return null;
    }

    // Luego buscar la traducción
    const { data, error } = await this.supabase
      .from('translations')
      .select(`
        *,
        translation_keys!inner (
          namespace_slug,
          key_name
        )
      `)
      .eq('translation_key_id', keyData.id)
      .eq('language_code', languageCode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error fetching translation: ${error.message}`);
    }

    // ✅ CORRECCIÓN: Mapear correctamente
    return Translation.fromDatabase({
      ...data,
      namespace_slug: data.translation_keys?.namespace_slug,
      key_name: data.translation_keys?.key_name,
    });
  }

  async create(dto: CreateTranslationDTO): Promise<Translation> {
    // Primero encontrar la translation_key
    const { data: keyData, error: keyError } = await this.supabase
      .from('translation_keys')
      .select('id')
      .eq('namespace_slug', dto.namespaceSlug)
      .eq('key_name', dto.translationKey)  // ✅ CORRECCIÓN: key_name
      .single();

    if (keyError || !keyData) {
      throw new Error(`Translation key not found: ${dto.namespaceSlug}.${dto.translationKey}`);
    }

    const { data, error } = await this.supabase
      .from('translations')
      .insert({
        translation_key_id: keyData.id,
        language_code: dto.languageCode,
        value: dto.value,
      })
      .select(`
        *,
        translation_keys!inner (
          namespace_slug,
          key_name
        )
      `)
      .single();

    if (error) {
      throw new Error(`Error creating translation: ${error.message}`);
    }

    // ✅ CORRECCIÓN: Mapear correctamente
    return Translation.fromDatabase({
      ...data,
      namespace_slug: data.translation_keys?.namespace_slug,
      key_name: data.translation_keys?.key_name,
    });
  }

  async createBulk(dto: BulkCreateTranslationDTO): Promise<Translation[]> {
    // Primero encontrar la translation_key
    const { data: keyData, error: keyError } = await this.supabase
      .from('translation_keys')
      .select('id')
      .eq('namespace_slug', dto.namespaceSlug)
      .eq('key_name', dto.translationKey)  // ✅ CORRECCIÓN: key_name
      .single();

    if (keyError || !keyData) {
      throw new Error(`Translation key not found: ${dto.namespaceSlug}.${dto.translationKey}`);
    }

    const insertData = dto.translations.map(t => ({
      translation_key_id: keyData.id,
      language_code: t.languageCode,
      value: t.value,
    }));

    const { data, error } = await this.supabase
      .from('translations')
      .insert(insertData)
      .select(`
        *,
        translation_keys!inner (
          namespace_slug,
          key_name
        )
      `);

    if (error) {
      throw new Error(`Error creating bulk translations: ${error.message}`);
    }

    // ✅ CORRECCIÓN: Mapear correctamente
    return (data || []).map((row: any) => Translation.fromDatabase({
      ...row,
      namespace_slug: row.translation_keys?.namespace_slug,
      key_name: row.translation_keys?.key_name,
    }));
  }

  async update(id: string, dto: UpdateTranslationDTO): Promise<Translation> {
    const updateData: any = {};
    if (dto.value !== undefined) updateData.value = dto.value;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const { data, error } = await this.supabase
      .from('translations')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        translation_keys!inner (
          namespace_slug,
          key_name
        )
      `)
      .single();

    if (error) {
      throw new Error(`Error updating translation: ${error.message}`);
    }

    // ✅ CORRECCIÓN: Mapear correctamente
    return Translation.fromDatabase({
      ...data,
      namespace_slug: data.translation_keys?.namespace_slug,
      key_name: data.translation_keys?.key_name,
    });
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