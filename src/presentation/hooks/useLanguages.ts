// ============================================
// src/presentation/hooks/useLanguages.ts
// Hook: Languages Management
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/src/core/domain/entities/Language';
import { LanguageRepository } from '@/src/infrastructure/repositories/languages/LanguageRepository';

const languageRepository = new LanguageRepository();

export function useLanguages() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLanguages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await languageRepository.findActive();
      setLanguages(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar idiomas');
      console.error('Error loading languages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLanguages();
  }, []);

  return {
    languages,
    loading,
    error,
    reload: loadLanguages,
  };
}
