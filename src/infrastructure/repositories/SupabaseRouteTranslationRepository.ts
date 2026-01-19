// ============================================
// 3. INFRASTRUCTURE LAYER
// ============================================

// src/infrastructure/repositories/SupabaseRouteTranslationRepository.ts
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { IRouteTranslationRepository } from '@/src/core/domain/repositories/IRouteTranslationRepository';

export class SupabaseRouteTranslationRepository implements IRouteTranslationRepository {
  private supabase = createClient();

  async getTranslatedPath(pathname: string, locale: string): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .schema('app')
        .from('routes')
        .select(`
          route_translations!inner(translated_path)
        `)
        .eq('pathname', pathname)
        .eq('route_translations.language_code', locale)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.warn(`[RouteTranslation] No translation found for ${pathname} (${locale})`);
        return pathname; // Fallback
      }

      return data.route_translations[0]?.translated_path || pathname;
    } catch (error) {
      console.error('[RouteTranslation] Error:', error);
      return pathname;
    }
  }

  async getAllTranslations(pathname: string): Promise<Record<string, string>> {
    try {
      const { data } = await this.supabase
        .schema('app')
        .from('routes')
        .select(`
          route_translations(language_code, translated_path)
        `)
        .eq('pathname', pathname)
        .eq('is_active', true)
        .single();

      if (!data) return {};

      const translations: Record<string, string> = {};
      data.route_translations?.forEach((t: any) => {
        translations[t.language_code] = t.translated_path;
      });

      return translations;
    } catch (error) {
      console.error('[RouteTranslation] Error:', error);
      return {};
    }
  }
}