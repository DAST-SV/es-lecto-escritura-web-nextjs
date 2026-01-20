// ============================================
// src/infrastructure/repositories/SupabaseTranslationRepository.ts
// ✅ CORRECCIÓN: Sin namespace_slug directo, obtenerlo via JOIN
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import { Translation } from '@/src/core/domain/entities/Translation';
import { BulkCreateTranslationDTO, CreateTranslationDTO, ITranslationRepository, UpdateTranslationDTO } from '@/src/core/domain/repositories';

export class SupabaseTranslationRepository implements ITranslationRepository {
  private supabase = createClient();

  async findAll(): Promise<Translation[]> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('translations')
      .select(`
        *,
        translation_key:translation_keys!inner (
          namespace_slug,
          key_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching translations: ${error.message}`);
    }

    return (data || []).map((row: any) => Translation.fromDatabase({
      ...row,
      namespace_slug: row.translation_key?.namespace_slug,
      key_name: row.translation_key?.key_name,
    }));
  }

  async findById(id: string): Promise<Translation | null> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('translations')
      .select(`
        *,
        translation_key:translation_keys!inner (
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

    return Translation.fromDatabase({
      ...data,
      namespace_slug: data.translation_key?.namespace_slug,
      key_name: data.translation_key?.key_name,
    });
  }

  async findByNamespace(namespaceSlug: string): Promise<Translation[]> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('translations')
      .select(`
        *,
        translation_key:translation_keys!inner (
          namespace_slug,
          key_name
        )
      `)
      .eq('translation_key.namespace_slug', namespaceSlug)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching translations by namespace: ${error.message}`);
    }

    return (data || []).map((row: any) => Translation.fromDatabase({
      ...row,
      namespace_slug: row.translation_key?.namespace_slug,
      key_name: row.translation_key?.key_name,
    }));
  }

  async findByLanguage(languageCode: string): Promise<Translation[]> {
    const { data, error } = await this.supabase
      .schema('app')
      .from('translations')
      .select(`
        *,
        translation_key:translation_keys!inner (
          namespace_slug,
          key_name
        )
      `)
      .eq('language_code', languageCode)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching translations by language: ${error.message}`);
    }

    return (data || []).map((row: any) => Translation.fromDatabase({
      ...row,
      namespace_slug: row.translation_key?.namespace_slug,
      key_name: row.translation_key?.key_name,
    }));
  }

  async findByKey(
    namespaceSlug: string,
    translationKey: string,
    languageCode: string
  ): Promise<Translation | null> {
    // Primero encontrar la translation_key
    const { data: keyData, error: keyError } = await this.supabase
      .schema('app')
      .from('translation_keys')
      .select('id')
      .eq('namespace_slug', namespaceSlug)
      .eq('key_name', translationKey)
      .single();

    if (keyError || !keyData) {
      return null;
    }

    // Luego buscar la traducción
    const { data, error } = await this.supabase
      .schema('app')
      .from('translations')
      .select(`
        *,
        translation_key:translation_keys!inner (
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

    return Translation.fromDatabase({
      ...data,
      namespace_slug: data.translation_key?.namespace_slug,
      key_name: data.translation_key?.key_name,
    });
  }

  async create(dto: CreateTranslationDTO): Promise<Translation> {
    // Primero encontrar la translation_key
    const { data: keyData, error: keyError } = await this.supabase
      .schema('app')
      .from('translation_keys')
      .select('id, namespace_slug, key_name')
      .eq('namespace_slug', dto.namespaceSlug)
      .eq('key_name', dto.translationKey)
      .single();

    if (keyError || !keyData) {
      throw new Error(`Translation key not found: ${dto.namespaceSlug}.${dto.translationKey}`);
    }

    const { data, error } = await this.supabase
      .schema('app')
      .from('translations')
      .insert({
        translation_key_id: keyData.id,
        language_code: dto.languageCode,
        value: dto.value,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating translation: ${error.message}`);
    }

    return Translation.fromDatabase({
      ...data,
      namespace_slug: keyData.namespace_slug,
      key_name: keyData.key_name,
    });
  }

  async createBulk(dto: BulkCreateTranslationDTO): Promise<Translation[]> {
    // Validaciones de entrada
    if (!dto.namespaceSlug || !dto.namespaceSlug.trim()) {
      throw new Error('namespaceSlug es requerido');
    }
    if (!dto.translationKey || !dto.translationKey.trim()) {
      throw new Error('translationKey es requerido');
    }
    if (!dto.translations || dto.translations.length === 0) {
      throw new Error('Debe proporcionar al menos una traducción');
    }

    // Validar cada traducción
    for (const trans of dto.translations) {
      if (!trans.languageCode || !trans.languageCode.trim()) {
        throw new Error('Cada traducción debe tener un languageCode');
      }
      if (!trans.value || !trans.value.trim()) {
        throw new Error('Cada traducción debe tener un valor');
      }
    }

    // Primero encontrar la translation_key
    const { data: keyData, error: keyError } = await this.supabase
      .schema('app')
      .from('translation_keys')
      .select('id, namespace_slug, key_name')
      .eq('namespace_slug', dto.namespaceSlug)
      .eq('key_name', dto.translationKey)
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
      .schema('app')
      .from('translations')
      .insert(insertData)
      .select();

    if (error) {
      throw new Error(`Error creating bulk translations: ${error.message}`);
    }

    return (data || []).map((row: any) => Translation.fromDatabase({
      ...row,
      namespace_slug: keyData.namespace_slug,
      key_name: keyData.key_name,
    }));
  }

  async update(id: string, dto: UpdateTranslationDTO): Promise<Translation> {
    const updateData: any = {};
    if (dto.value !== undefined) updateData.value = dto.value;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const { data, error } = await this.supabase
      .schema('app')
      .from('translations')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        translation_key:translation_keys!inner (
          namespace_slug,
          key_name
        )
      `)
      .single();

    if (error) {
      throw new Error(`Error updating translation: ${error.message}`);
    }

    return Translation.fromDatabase({
      ...data,
      namespace_slug: data.translation_key?.namespace_slug,
      key_name: data.translation_key?.key_name,
    });
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('app')
      .from('translations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting translation: ${error.message}`);
    }
  }
}