// ============================================
// src/presentation/hooks/useLanguages.ts
// Hook: Obtener idiomas disponibles
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { Language } from '@/src/core/domain/entities/Language';
import { LanguageRepository } from '@/src/infrastructure/repositories/languages/LanguageRepository';

const languageRepository = new LanguageRepository();

export function useLanguages(includeInactive = false) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLanguages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await languageRepository.findAll(includeInactive);
      setLanguages(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar idiomas');
      console.error('Error loading languages:', err);
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    loadLanguages();
  }, [loadLanguages]);

  return {
    languages,
    loading,
    error,
    refresh: loadLanguages,
  };
}
