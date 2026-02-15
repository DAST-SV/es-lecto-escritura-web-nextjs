// ============================================
// src/presentation/hooks/useLanguages.ts
// Hook: Obtener idiomas disponibles
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Language } from '@/src/core/domain/entities/Language';
import { LanguageRepository } from '@/src/infrastructure/repositories/languages/LanguageRepository';
import { logDetailedError, getUserFriendlyError } from '@/src/infrastructure/utils/error-formatter';

export function useLanguages(includeInactive = false) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLanguages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Lazy instantiate repository only when needed (client-side)
      const languageRepository = new LanguageRepository();
      const data = await languageRepository.findAll(includeInactive);
      setLanguages(data);
    } catch (err: unknown) {
      logDetailedError('useLanguages.loadLanguages', err);
      setError(getUserFriendlyError(err, 'Error al cargar idiomas'));
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    loadLanguages();
  }, [loadLanguages]);

  const defaultLanguage = useMemo(() => {
    return languages.find(l => l.isDefault) || languages[0] || null;
  }, [languages]);

  const activeLanguages = useMemo(() => {
    return languages.filter(l => l.isActive);
  }, [languages]);

  return {
    languages,
    activeLanguages,
    defaultLanguage,
    loading,
    error,
    refresh: loadLanguages,
  };
}
