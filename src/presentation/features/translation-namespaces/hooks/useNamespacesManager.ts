// ============================================
// src/presentation/features/translation-namespaces/hooks/useNamespacesManager.ts
// Hook: Gestión completa de namespaces
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { TranslationNamespace } from '@/src/core/domain/entities/TranslationNamespace';
import { TranslationNamespaceRepository } from '@/src/infrastructure/repositories/translation-namespaces/TranslationNamespaceRepository';
import { CreateTranslationNamespaceDTO, UpdateTranslationNamespaceDTO } from '@/src/core/domain/repositories/ITranslationNamespaceRepository';

const namespaceRepository = new TranslationNamespaceRepository();

export function useNamespacesManager() {
  const [namespaces, setNamespaces] = useState<TranslationNamespace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNamespaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await namespaceRepository.findAll(true); // incluir inactivos
      setNamespaces(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar namespaces');
      console.error('Error loading namespaces:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createNamespace = useCallback(async (dto: CreateTranslationNamespaceDTO) => {
    try {
      const newNamespace = await namespaceRepository.create(dto);
      setNamespaces(prev => [...prev, newNamespace]);
      return newNamespace;
    } catch (err: any) {
      throw new Error(err.message || 'Error al crear namespace');
    }
  }, []);

  const updateNamespace = useCallback(async (id: string, dto: UpdateTranslationNamespaceDTO) => {
    try {
      const updated = await namespaceRepository.update(id, dto);
      setNamespaces(prev => prev.map(ns => ns.id === id ? updated : ns));
      return updated;
    } catch (err: any) {
      throw new Error(err.message || 'Error al actualizar namespace');
    }
  }, []);

  const deleteNamespace = useCallback(async (id: string) => {
    try {
      await namespaceRepository.delete(id);
      setNamespaces(prev => prev.filter(ns => ns.id !== id));
    } catch (err: any) {
      throw new Error(err.message || 'Error al eliminar namespace');
    }
  }, []);

  const refresh = useCallback(() => {
    loadNamespaces();
  }, [loadNamespaces]);

  useEffect(() => {
    loadNamespaces();
  }, [loadNamespaces]);

  return {
    namespaces,
    loading,
    error,
    createNamespace,
    updateNamespace,
    deleteNamespace,
    refresh,
  };
}