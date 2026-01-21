// ============================================
// src/presentation/features/languages/hooks/useLanguagesManager.ts
// Hook: Gestión completa de idiomas
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { Language } from '@/src/core/domain/entities/Language';
import { LanguageRepository } from '@/src/infrastructure/repositories/languages/LanguageRepository';
import { CreateLanguageDTO, UpdateLanguageDTO } from '@/src/core/domain/repositories/ILanguageRepository';

const languageRepository = new LanguageRepository();

export function useLanguagesManager() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLanguages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await languageRepository.findAll(true); // incluir inactivos
      setLanguages(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar idiomas');
      console.error('Error loading languages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createLanguage = useCallback(async (dto: CreateLanguageDTO) => {
    try {
      const newLanguage = await languageRepository.create(dto);
      setLanguages(prev => [...prev, newLanguage]);
      return newLanguage;
    } catch (err: any) {
      throw new Error(err.message || 'Error al crear idioma');
    }
  }, []);

  const updateLanguage = useCallback(async (code: string, dto: UpdateLanguageDTO) => {
    try {
      const updated = await languageRepository.update(code, dto);
      setLanguages(prev => prev.map(lang => lang.code === code ? updated : lang));
      return updated;
    } catch (err: any) {
      throw new Error(err.message || 'Error al actualizar idioma');
    }
  }, []);

  const deleteLanguage = useCallback(async (code: string) => {
    try {
      await languageRepository.delete(code);
      setLanguages(prev => prev.filter(lang => lang.code !== code));
    } catch (err: any) {
      throw new Error(err.message || 'Error al eliminar idioma');
    }
  }, []);

  const refresh = useCallback(() => {
    loadLanguages();
  }, [loadLanguages]);

  useEffect(() => {
    loadLanguages();
  }, [loadLanguages]);

  return {
    languages,
    loading,
    error,
    createLanguage,
    updateLanguage,
    deleteLanguage,
    refresh,
  };
}