// src/presentation/features/books-catalog/hooks/useCategories.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import type { CategoryByLanguage } from '@/src/core/domain/entities/BookCategory';

export function useCategories() {
  const locale = useLocale();
  const [categories, setCategories] = useState<CategoryByLanguage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/books-catalog/categories?lang=${locale}`);
      if (!response.ok) throw new Error('Error al cargar categorías');

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories
  };
}
