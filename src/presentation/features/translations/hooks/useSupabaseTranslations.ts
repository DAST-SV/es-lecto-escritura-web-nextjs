/////////////////////////////////////////////////////////////
/// src/presentation/features/translations/hooks/useSupabaseTranslations.ts
/////////////////////////////////////////////////////////////

'use client';
import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { SupabaseTranslationRepository } from '@/src/infrastructure/repositories';
import { GetTranslationsUseCase } from '@/src/core/application/use-cases';

// Cache en memoria
const cache: Record<string, Record<string, string>> = {};

/**
 * Hook de presentación que consume el caso de uso
 */
export function useSupabaseTranslations(namespace: string) {
  const locale = useLocale();
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cacheKey = `${namespace}-${locale}`;

    // Si está en cache, úsalo
    if (cache[cacheKey]) {
      setTranslations(cache[cacheKey]);
      setLoading(false);
      return;
    }

    // Cargar traducciones usando el caso de uso
    const loadTranslations = async () => {
      try {
        // Inyección de dependencias
        const repository = new SupabaseTranslationRepository();
        const useCase = new GetTranslationsUseCase(repository);

        // Ejecutar caso de uso
        const translationsMap = await useCase.execute(namespace, locale);

        // Guardar en cache
        cache[cacheKey] = translationsMap;
        setTranslations(translationsMap);
      } catch (error) {
        console.error('Error in useSupabaseTranslations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [namespace, locale]);

  // Función helper para obtener traducción
  const t = (key: string): string => {
    return translations[key] || `[${key}]`;
  };

  return { t, loading, locale };
}