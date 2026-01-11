// ============================================
// src/i18n/request.ts
// ============================================

import { getRequestConfig } from 'next-intl/server';
import { routing } from '@/src/infrastructure/config/routing.config';
import { createServerSupabaseClient } from '@/src/infrastructure/config/supabase.config';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  
  // ✅ CARGAR TRADUCCIONES DESDE SUPABASE
  const messages = await loadTranslationsFromSupabase(locale);
  
  return { 
    locale, 
    messages 
  };
});

async function loadTranslationsFromSupabase(languageCode: string) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Obtener todos los namespaces activos
    const { data: namespaces } = await supabase
      .from('translation_namespaces')
      .select('slug')
      .eq('is_active', true);

    if (!namespaces) {
      console.warn('⚠️ No se encontraron namespaces');
      return {};
    }

    const messages: Record<string, any> = {};

    // Cargar traducciones de cada namespace
    for (const ns of namespaces) {
      const { data: translations } = await supabase
        .from('translations')
        .select('translation_key, value')
        .eq('namespace_slug', ns.slug)
        .eq('language_code', languageCode)
        .eq('is_active', true);

      if (translations && translations.length > 0) {
        messages[ns.slug] = {};
        
        translations.forEach(t => {
          // Convertir "nav.home" en estructura anidada
          const keys = t.translation_key.split('.');
          let current = messages[ns.slug];
          
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
              current[keys[i]] = {};
            }
            current = current[keys[i]];
          }
          
          current[keys[keys.length - 1]] = t.value;
        });
      }
    }

    console.log(`✅ Traducciones cargadas para ${languageCode}:`, Object.keys(messages));
    return messages;
    
  } catch (error) {
    console.error('❌ Error cargando traducciones:', error);
    // Fallback a JSON estático
    return (await import(`../../messages/${languageCode}.json`)).default;
  }
}