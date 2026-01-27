/////////////////////////////////////////////////////////////
/// src/presentation/features/translations/hooks/useSupabaseTranslations.ts
/////////////////////////////////////////////////////////////

'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { SupabaseTranslationRepository } from '@/src/infrastructure/repositories';
import { GetTranslationsUseCase } from '@/src/core/application/use-cases';

// Cache en memoria
const cache: Record<string, Record<string, string>> = {};

/**
 * Hook de presentación que consume el caso de uso
 * Soporta traducciones simples y arrays dinámicos desde Supabase
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

  // Función helper para obtener traducción simple
  const t = useCallback((key: string): string => {
    return translations[key] || `[${key}]`;
  }, [translations]);

  /**
   * Extrae un array de objetos desde claves indexadas
   * Ejemplo: tArray('slides', ['title', 'description', 'icon', 'button'])
   * Busca: slides.0.title, slides.0.description, slides.1.title, etc.
   */
  const tArray = useCallback(<T extends Record<string, string>>(
    prefix: string,
    fields: string[]
  ): T[] => {
    const result: T[] = [];
    let index = 0;

    // Buscar hasta que no encuentre más items
    while (true) {
      const firstField = fields[0];
      const firstKey = `${prefix}.${index}.${firstField}`;

      // Si no existe la primera clave del item, terminamos
      if (!translations[firstKey]) {
        break;
      }

      // Construir el objeto con todos los campos
      const item = {} as T;
      for (const field of fields) {
        const key = `${prefix}.${index}.${field}`;
        (item as Record<string, string>)[field] = translations[key] || '';
      }

      result.push(item);
      index++;

      // Límite de seguridad para evitar loops infinitos
      if (index > 100) break;
    }

    return result;
  }, [translations]);

  /**
   * Obtiene el conteo de items en un array de traducciones
   */
  const tCount = useCallback((prefix: string, field: string): number => {
    let count = 0;
    while (translations[`${prefix}.${count}.${field}`]) {
      count++;
      if (count > 100) break;
    }
    return count;
  }, [translations]);

  /**
   * Verifica si existe una traducción
   */
  const hasTranslation = useCallback((key: string): boolean => {
    return key in translations;
  }, [translations]);

  /**
   * Obtiene todas las traducciones raw (para casos avanzados)
   */
  const raw = useMemo(() => translations, [translations]);

  return {
    t,
    tArray,
    tCount,
    hasTranslation,
    raw,
    loading,
    locale
  };
}