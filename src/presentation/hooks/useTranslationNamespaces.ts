// ============================================
// src/presentation/hooks/useTranslationNamespaces.ts
// Hook: Translation Namespaces Management
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { TranslationNamespace } from '@/src/core/domain/entities/TranslationNamespace';
import { TranslationNamespaceRepository } from '@/src/infrastructure/repositories/translation-namespaces/TranslationNamespaceRepository';

const namespaceRepository = new TranslationNamespaceRepository();

export function useTranslationNamespaces() {
  const [namespaces, setNamespaces] = useState<TranslationNamespace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNamespaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await namespaceRepository.findActive();
      setNamespaces(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar namespaces');
      console.error('Error loading namespaces:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNamespaces();
  }, []);

  return {
    namespaces,
    loading,
    error,
    reload: loadNamespaces,
  };
}
