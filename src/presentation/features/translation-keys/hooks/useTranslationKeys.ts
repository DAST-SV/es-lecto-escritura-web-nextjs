// ============================================
// src/presentation/features/translation-keys/hooks/useTranslationKeys.ts
// Hook: Gestión de claves de traducción
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { TranslationKey } from '@/src/core/domain/entities/TranslationKey';
import { createClient } from '@/src/infrastructure/config/supabase.config';

export function useTranslationKeys() {
  const [keys, setKeys] = useState<TranslationKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const loadKeys = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('translation_keys')
        .select(`
          *,
          translation_categories (
            name
          ),
          translations (count)
        `)
        .order('namespace_slug', { ascending: true })
        .order('key_name', { ascending: true });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const mappedKeys = (data || []).map((row: any) => {
        return TranslationKey.fromDatabase({
          ...row,
          category_name: row.translation_categories?.name,
          translation_count: row.translations?.[0]?.count || 0,
        });
      });

      setKeys(mappedKeys);
    } catch (err: any) {
      setError(err.message || 'Error al cargar claves');
      console.error('Error loading translation keys:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createKey = useCallback(async (dto: {
    namespaceSlug: string;
    keyName: string;
    categoryId?: string;
    description?: string;
    context?: string;
    defaultValue?: string;
    isSystemKey?: boolean;
  }) => {
    try {
      const { data, error: createError } = await supabase
        .from('translation_keys')
        .insert({
          namespace_slug: dto.namespaceSlug,
          key_name: dto.keyName,
          category_id: dto.categoryId || null,
          description: dto.description || null,
          context: dto.context || null,
          default_value: dto.defaultValue || null,
          is_system_key: dto.isSystemKey || false,
          is_active: true,
        })
        .select()
        .single();

      if (createError) {
        throw new Error(createError.message);
      }

      const newKey = TranslationKey.fromDatabase(data);
      setKeys(prev => [...prev, newKey]);
      return newKey;
    } catch (err: any) {
      throw new Error(err.message || 'Error al crear clave');
    }
  }, []);

  const updateKey = useCallback(async (id: string, dto: {
    keyName?: string;
    categoryId?: string;
    description?: string;
    context?: string;
    defaultValue?: string;
    isActive?: boolean;
  }) => {
    try {
      const updateData: any = {};
      if (dto.keyName !== undefined) updateData.key_name = dto.keyName;
      if (dto.categoryId !== undefined) updateData.category_id = dto.categoryId;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.context !== undefined) updateData.context = dto.context;
      if (dto.defaultValue !== undefined) updateData.default_value = dto.defaultValue;
      if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

      const { data, error: updateError } = await supabase
        .from('translation_keys')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      const updated = TranslationKey.fromDatabase(data);
      setKeys(prev => prev.map(k => k.id === id ? updated : k));
      return updated;
    } catch (err: any) {
      throw new Error(err.message || 'Error al actualizar clave');
    }
  }, []);

  const deleteKey = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('translation_keys')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      setKeys(prev => prev.filter(k => k.id !== id));
    } catch (err: any) {
      throw new Error(err.message || 'Error al eliminar clave');
    }
  }, []);

  const refresh = useCallback(() => {
    loadKeys();
  }, [loadKeys]);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  return {
    keys,
    loading,
    error,
    createKey,
    updateKey,
    deleteKey,
    refresh,
  };
}