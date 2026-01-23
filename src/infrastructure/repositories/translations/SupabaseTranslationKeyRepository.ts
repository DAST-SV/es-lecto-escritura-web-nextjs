// ============================================
// src/infrastructure/repositories/SupabaseTranslationKeyRepository.ts
// ✅ CORRECCIÓN DEFINITIVA: .schema('app') en TODAS las operaciones
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import {
  ITranslationKeyRepository,
  CreateTranslationKeyDTO,
  UpdateTranslationKeyDTO,
} from '@/src/core/domain/repositories/ITranslationKeyRepository';
import { TranslationKey } from '@/src/core/domain/entities/TranslationKey';

export class SupabaseTranslationKeyRepository implements ITranslationKeyRepository {
  private supabase = createClient();

  async findAll(): Promise<TranslationKey[]> {
    const { data, error } = await this.supabase
      .schema('app')  // ✅ CRÍTICO
      .from('translation_keys')
      .select(`
        *,
        category:translation_categories(name)
      `)
      .order('namespace_slug', { ascending: true })
      .order('key_name', { ascending: true });

    if (error) {
      throw new Error(`Error fetching translation keys: ${error.message}`);
    }

    // Contar traducciones manualmente
    const keysWithCounts = await Promise.all(
      (data || []).map(async (row: any) => {
        const { count } = await this.supabase
          .schema('app')
          .from('translations')
          .select('*', { count: 'exact', head: true })
          .eq('translation_key_id', row.id);

        return TranslationKey.fromDatabase({
          ...row,
          category_name: row.category?.name,
          translation_count: count ?? 0,
        });
      })
    );

    return keysWithCounts;
  }

  async findById(id: string): Promise<TranslationKey | null> {
    const { data, error } = await this.supabase
      .schema('app')  // ✅ CRÍTICO
      .from('translation_keys')
      .select(`
        *,
        category:translation_categories(name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error fetching translation key: ${error.message}`);
    }

    // Contar traducciones
    const { count } = await this.supabase
      .schema('app')
      .from('translations')
      .select('*', { count: 'exact', head: true })
      .eq('translation_key_id', data.id);

    return TranslationKey.fromDatabase({
      ...data,
      category_name: data.category?.name,
      translation_count: count ?? 0,
    });
  }

  async findByNamespace(namespaceSlug: string): Promise<TranslationKey[]> {
    const { data, error } = await this.supabase
      .schema('app')  // ✅ CRÍTICO
      .from('translation_keys')
      .select(`
        *,
        category:translation_categories(name)
      `)
      .eq('namespace_slug', namespaceSlug)
      .order('key_name', { ascending: true });

    if (error) {
      throw new Error(`Error fetching translation keys by namespace: ${error.message}`);
    }

    const keysWithCounts = await Promise.all(
      (data || []).map(async (row: any) => {
        const { count } = await this.supabase
          .schema('app')
          .from('translations')
          .select('*', { count: 'exact', head: true })
          .eq('translation_key_id', row.id);

        return TranslationKey.fromDatabase({
          ...row,
          category_name: row.category?.name,
          translation_count: count ?? 0,
        });
      })
    );

    return keysWithCounts;
  }

  async create(dto: CreateTranslationKeyDTO): Promise<TranslationKey> {
    // Validaciones de entrada
    if (!dto.namespaceSlug || !dto.namespaceSlug.trim()) {
      throw new Error('El namespace es requerido');
    }
    if (!dto.keyName || !dto.keyName.trim()) {
      throw new Error('El nombre de la clave es requerido');
    }

    const { data, error } = await this.supabase
      .schema('app')  // ✅ CRÍTICO
      .from('translation_keys')
      .insert({
        namespace_slug: dto.namespaceSlug,
        key_name: dto.keyName,
        category_id: dto.categoryId,
        description: dto.description,
        context: dto.context,
        default_value: dto.defaultValue,
        is_system_key: dto.isSystemKey ?? false,
      })
      .select(`
        *,
        category:translation_categories(name)
      `)
      .single();

    if (error) {
      throw new Error(`Error creating translation key: ${error.message}`);
    }

    return TranslationKey.fromDatabase({
      ...data,
      category_name: data.category?.name,
      translation_count: 0,
    });
  }

  async update(id: string, dto: UpdateTranslationKeyDTO): Promise<TranslationKey> {
    const updateData: any = {};
    if (dto.keyName !== undefined) updateData.key_name = dto.keyName;
    if (dto.categoryId !== undefined) updateData.category_id = dto.categoryId;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.context !== undefined) updateData.context = dto.context;
    if (dto.defaultValue !== undefined) updateData.default_value = dto.defaultValue;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const { data, error } = await this.supabase
      .schema('app')  // ✅ CRÍTICO
      .from('translation_keys')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        category:translation_categories(name)
      `)
      .single();

    if (error) {
      throw new Error(`Error updating translation key: ${error.message}`);
    }

    // Contar traducciones
    const { count } = await this.supabase
      .schema('app')
      .from('translations')
      .select('*', { count: 'exact', head: true })
      .eq('translation_key_id', data.id);

    return TranslationKey.fromDatabase({
      ...data,
      category_name: data.category?.name,
      translation_count: count ?? 0,
    });
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('app')  // ✅ CRÍTICO
      .from('translation_keys')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting translation key: ${error.message}`);
    }
  }
}