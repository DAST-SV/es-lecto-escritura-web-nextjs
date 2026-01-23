// ============================================
// src/i18n/request.ts
// ✅ CORREGIDO: Fallback a JSON estático en build time
// ============================================

import { getRequestConfig } from 'next-intl/server';
import { routing } from '@/src/infrastructure/config/routing.config';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  
  // ✅ Intentar cargar desde Supabase SOLO en runtime
  const messages = await loadTranslations(locale);
  
  return { 
    locale, 
    messages 
  };
});

async function loadTranslations(languageCode: string) {
  // ✅ En build time, usar JSON estático
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log(`📦 Build time: usando JSON estático para ${languageCode}`);
    return await loadStaticJSON(languageCode);
  }

  // ✅ En runtime, intentar Supabase primero
  try {
    return await loadFromSupabase(languageCode);
  } catch (error) {
    console.warn(`⚠️ Supabase falló, usando JSON estático:`, error);
    return await loadStaticJSON(languageCode);
  }
}

async function loadFromSupabase(languageCode: string) {
  // Evitar importar createServerSupabaseClient en build time
  const { createServerSupabaseClient } = await import('@/src/infrastructure/config/supabase.config');
  const supabase = await createServerSupabaseClient();
  
  // Obtener todos los namespaces activos
  const { data: namespaces } = await supabase
    .from('translation_namespaces')
    .select('slug')
    .eq('is_active', true);

  if (!namespaces || namespaces.length === 0) {
    throw new Error('No namespaces encontrados');
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

  console.log(`✅ Traducciones desde Supabase para ${languageCode}:`, Object.keys(messages));
  return messages;
}

async function loadStaticJSON(languageCode: string) {
  try {
    const messages = (await import(`../../messages/${languageCode}.json`)).default;
    console.log(`✅ Traducciones desde JSON para ${languageCode}`);
    return messages;
  } catch (error) {
    console.error(`❌ Error cargando JSON para ${languageCode}:`, error);
    return {};
  }
}