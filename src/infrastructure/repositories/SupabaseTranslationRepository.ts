/////////////////////////////////////////////////////////////////////
/// src/infrastructure/repositories/SupabaseTranslationRepository.ts
/////////////////////////////////////////////////////////////////////

// Implementación concreta del repositorio
import { ITranslationRepository } from '@/src/core/domain/repositories/ITranslationRepository';
import { Translation, Language } from '@/src/core/domain/entities/Translation';
import { createClient } from '@/src/infrastructure/config/supabase.config';

export class SupabaseTranslationRepository implements ITranslationRepository {
  private supabase = createClient();

  async getTranslationsByNamespace(
    namespace: string,
    languageCode: string
  ): Promise<Translation[]> {
    const { data, error } = await this.supabase
      .from('translations')
      .select('*')
      .eq('namespace_slug', namespace)
      .eq('language_code', languageCode)
      .eq('is_active', true);

    if (error) {
      console.error('Error loading translations:', error);
      throw new Error(`Failed to load translations: ${error.message}`);
    }

    return (data || []).map(item => ({
      id: item.id,
      namespaceSlug: item.namespace_slug,
      translationKey: item.translation_key,
      languageCode: item.language_code,
      value: item.value,
      isActive: item.is_active,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    }));
  }

  async getActiveLanguages(): Promise<Language[]> {
    const { data, error } = await this.supabase
      .from('languages')
      .select('*')
      .eq('is_active', true)
      .order('order_index');

    if (error) {
      console.error('Error loading languages:', error);
      throw new Error(`Failed to load languages: ${error.message}`);
    }

    return (data || []).map(item => ({
      code: item.code,
      name: item.name,
      nativeName: item.native_name,
      flagEmoji: item.flag_emoji,
      isDefault: item.is_default,
      isActive: item.is_active,
      orderIndex: item.order_index
    }));
  }

  async getDefaultLanguage(): Promise<string> {
    const { data, error } = await this.supabase
      .from('languages')
      .select('code')
      .eq('is_default', true)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (error || !data) {
      return 'es'; // Fallback
    }

    return data.code;
  }
}