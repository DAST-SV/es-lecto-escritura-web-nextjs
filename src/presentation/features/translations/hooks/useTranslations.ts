// ============================================
// src/presentation/features/translations/hooks/useTranslations.ts
// Hook: Gestión de traducciones
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { Translation } from '@/src/core/domain/entities/Translation';
import { SupabaseTranslationRepository } from '@/src/infrastructure/repositories/SupabaseTranslationRepository';
import { BulkCreateTranslationDTO, CreateTranslationDTO, UpdateTranslationDTO } from '@/src/core/domain/repositories';

const translationRepository = new SupabaseTranslationRepository();

export function useTranslations() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTranslations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await translationRepository.findAll();
      setTranslations(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar traducciones');
      console.error('Error loading translations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTranslation = useCallback(async (dto: CreateTranslationDTO) => {
    try {
      const newTranslation = await translationRepository.create(dto);
      setTranslations(prev => [...prev, newTranslation]);
      return newTranslation;
    } catch (err: any) {
      throw new Error(err.message || 'Error al crear traducción');
    }
  }, []);

  const createBulkTranslations = useCallback(async (dto: BulkCreateTranslationDTO) => {
    try {
      const newTranslations = await translationRepository.createBulk(dto);
      setTranslations(prev => [...prev, ...newTranslations]);
      return newTranslations;
    } catch (err: any) {
      throw new Error(err.message || 'Error al crear traducciones en lote');
    }
  }, []);

  const updateTranslation = useCallback(async (id: string, dto: UpdateTranslationDTO) => {
    try {
      const updated = await translationRepository.update(id, dto);
      setTranslations(prev => prev.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err: any) {
      throw new Error(err.message || 'Error al actualizar traducción');
    }
  }, []);

  const deleteTranslation = useCallback(async (id: string) => {
    try {
      await translationRepository.delete(id);
      setTranslations(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      throw new Error(err.message || 'Error al eliminar traducción');
    }
  }, []);

  const findByNamespace = useCallback(async (namespaceSlug: string) => {
    try {
      const data = await translationRepository.findByNamespace(namespaceSlug);
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Error al buscar traducciones');
    }
  }, []);

  const findByLanguage = useCallback(async (languageCode: string) => {
    try {
      const data = await translationRepository.findByLanguage(languageCode);
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Error al buscar traducciones');
    }
  }, []);

  const refresh = useCallback(() => {
    loadTranslations();
  }, [loadTranslations]);

  useEffect(() => {
    loadTranslations();
  }, [loadTranslations]);

  return {
    translations,
    loading,
    error,
    createTranslation,
    createBulkTranslations,
    updateTranslation,
    deleteTranslation,
    findByNamespace,
    findByLanguage,
    refresh,
  };
}