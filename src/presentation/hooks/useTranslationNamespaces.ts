// ============================================
// src/presentation/hooks/useTranslationNamespaces.ts
// Hook: Obtener namespaces
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { TranslationNamespace } from '@/src/core/domain/entities/TranslationNamespace';
import { TranslationNamespaceRepository } from '@/src/infrastructure/repositories/translation-namespaces/TranslationNamespaceRepository';

export function useTranslationNamespaces(includeInactive = false) {
  const [namespaces, setNamespaces] = useState<TranslationNamespace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNamespaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Lazy instantiate repository only when needed (client-side)
      const namespaceRepository = new TranslationNamespaceRepository();
      const data = await namespaceRepository.findAll(includeInactive);
      setNamespaces(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar namespaces');
      console.error('Error loading namespaces:', err);
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    loadNamespaces();
  }, [loadNamespaces]);

  return {
    namespaces,
    loading,
    error,
    refresh: loadNamespaces,
  };
}
