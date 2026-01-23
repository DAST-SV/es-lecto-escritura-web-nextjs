// ============================================
// src/presentation/features/translation-keys/hooks/useTranslationKeys.ts
// ✅ MEJORADO: Con validaciones y manejo de errores completo
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { TranslationKey } from '@/src/core/domain/entities/TranslationKey';
import { SupabaseTranslationKeyRepository } from '@/src/infrastructure/repositories/translations/SupabaseTranslationKeyRepository';
import {
  GetAllTranslationKeysUseCase,
  CreateTranslationKeyUseCase,
  UpdateTranslationKeyUseCase,
  DeleteTranslationKeyUseCase,
} from '@/src/core/application/use-cases/translation-keys';

const repository = new SupabaseTranslationKeyRepository();

export function useTranslationKeys() {
  const [keys, setKeys] = useState<TranslationKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const useCase = new GetAllTranslationKeysUseCase(repository);
      const data = await useCase.execute();
      
      setKeys(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar claves de traducción';
      setError(errorMessage);
      console.error('Error loading translation keys:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createKey = useCallback(async (dto: {
    namespaceSlug: string;
    keyName: string;
    categoryId?: string;
    description?: string;
    context?: string;
    defaultValue?: string;
    isSystemKey?: boolean;
  }) => {
    try {
      // Validaciones de entrada
      if (!dto.namespaceSlug || !dto.namespaceSlug.trim()) {
        throw new Error('El namespace es requerido');
      }
      if (!dto.keyName || !dto.keyName.trim()) {
        throw new Error('El nombre de la clave es requerido');
      }

      // Validar formato del keyName (solo letras, números, guiones y puntos)
      const keyNameRegex = /^[a-z0-9._-]+$/i;
      if (!keyNameRegex.test(dto.keyName)) {
        throw new Error('El nombre de la clave solo puede contener letras, números, puntos, guiones y guiones bajos');
      }

      // Validar que no exista ya
      const existingKey = keys.find(
        k => k.namespaceSlug === dto.namespaceSlug && k.keyName === dto.keyName
      );
      if (existingKey) {
        throw new Error(`La clave ${dto.namespaceSlug}.${dto.keyName} ya existe`);
      }

      const useCase = new CreateTranslationKeyUseCase(repository);
      const newKey = await useCase.execute({
        namespaceSlug: dto.namespaceSlug.trim(),
        keyName: dto.keyName.trim(),
        categoryId: dto.categoryId || undefined,
        description: dto.description?.trim() || undefined,
        context: dto.context?.trim() || undefined,
        defaultValue: dto.defaultValue?.trim() || undefined,
        isSystemKey: dto.isSystemKey || false,
      });

      setKeys(prev => [...prev, newKey]);
      return newKey;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear clave';
      console.error('Error creating translation key:', err);
      throw new Error(errorMessage);
    }
  }, [keys]);

  const updateKey = useCallback(async (id: string, dto: {
    keyName?: string;
    categoryId?: string;
    description?: string;
    context?: string;
    defaultValue?: string;
    isActive?: boolean;
  }) => {
    try {
      // Validaciones
      if (dto.keyName !== undefined) {
        if (!dto.keyName.trim()) {
          throw new Error('El nombre de la clave no puede estar vacío');
        }

        const keyNameRegex = /^[a-z0-9._-]+$/i;
        if (!keyNameRegex.test(dto.keyName)) {
          throw new Error('El nombre de la clave solo puede contener letras, números, puntos, guiones y guiones bajos');
        }

        // Validar que no exista otra clave con el mismo nombre en el mismo namespace
        const currentKey = keys.find(k => k.id === id);
        if (currentKey) {
          const duplicateKey = keys.find(
            k => k.id !== id && 
            k.namespaceSlug === currentKey.namespaceSlug && 
            k.keyName === dto.keyName
          );
          if (duplicateKey) {
            throw new Error(`Ya existe una clave con el nombre "${dto.keyName}" en el namespace "${currentKey.namespaceSlug}"`);
          }
        }
      }

      const useCase = new UpdateTranslationKeyUseCase(repository);
      const updated = await useCase.execute(id, {
        keyName: dto.keyName?.trim(),
        categoryId: dto.categoryId || undefined,
        description: dto.description?.trim() || undefined,
        context: dto.context?.trim() || undefined,
        defaultValue: dto.defaultValue?.trim() || undefined,
        isActive: dto.isActive,
      });

      setKeys(prev => prev.map(k => k.id === id ? updated : k));
      return updated;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al actualizar clave';
      console.error('Error updating translation key:', err);
      throw new Error(errorMessage);
    }
  }, [keys]);

  const deleteKey = useCallback(async (id: string) => {
    try {
      const keyToDelete = keys.find(k => k.id === id);
      if (!keyToDelete) {
        throw new Error('Clave no encontrada');
      }

      // Advertir si tiene traducciones
      if (keyToDelete.translationCount > 0) {
        const confirmMessage = `Esta clave tiene ${keyToDelete.translationCount} traducción(es) asociada(s). ¿Estás seguro de eliminarla? Esto eliminará también todas sus traducciones.`;
        if (!window.confirm(confirmMessage)) {
          throw new Error('Eliminación cancelada por el usuario');
        }
      }

      const useCase = new DeleteTranslationKeyUseCase(repository);
      await useCase.execute(id);

      setKeys(prev => prev.filter(k => k.id !== id));
    } catch (err: any) {
      const errorMessage = err.message || 'Error al eliminar clave';
      console.error('Error deleting translation key:', err);
      throw new Error(errorMessage);
    }
  }, [keys]);

  const findByNamespace = useCallback((namespaceSlug: string): TranslationKey[] => {
    return keys.filter(k => k.namespaceSlug === namespaceSlug);
  }, [keys]);

  const findByCategory = useCallback((categoryId: string): TranslationKey[] => {
    return keys.filter(k => k.categoryId === categoryId);
  }, [keys]);

  const searchKeys = useCallback((searchTerm: string): TranslationKey[] => {
    if (!searchTerm.trim()) return keys;
    
    const term = searchTerm.toLowerCase();
    return keys.filter(k => 
      k.keyName.toLowerCase().includes(term) ||
      k.namespaceSlug.toLowerCase().includes(term) ||
      (k.description && k.description.toLowerCase().includes(term)) ||
      (k.categoryName && k.categoryName.toLowerCase().includes(term))
    );
  }, [keys]);

  const refresh = useCallback(() => {
    loadKeys();
  }, [loadKeys]);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  return {
    keys,
    loading,
    error,
    createKey,
    updateKey,
    deleteKey,
    findByNamespace,
    findByCategory,
    searchKeys,
    refresh,
  };
}