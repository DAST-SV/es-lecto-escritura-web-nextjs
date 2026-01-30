// src/presentation/features/books-catalog/hooks/useBookSearch.ts
'use client';

import { useState, useCallback } from 'react';
import { useLocale } from 'next-intl';
import type { BookSearchResult } from '@/src/core/domain/entities/BookWithTranslations';

interface UseBookSearchOptions {
  limit?: number;
}

export function useBookSearch({ limit = 20 }: UseBookSearchOptions = {}) {
  const locale = useLocale();
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const search = useCallback(async (
    searchQuery: string,
    categorySlug?: string,
    difficulty?: string
  ) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);
    setQuery(searchQuery);

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        lang: locale,
        limit: limit.toString()
      });

      if (categorySlug) params.append('category', categorySlug);
      if (difficulty) params.append('difficulty', difficulty);

      const response = await fetch(`/api/books-catalog/search?${params}`);
      if (!response.ok) throw new Error('Error en la búsqueda');

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsSearching(false);
    }
  }, [locale, limit]);

  const clearSearch = () => {
    setResults([]);
    setQuery('');
    setError(null);
  };

  return {
    results,
    isSearching,
    error,
    query,
    search,
    clearSearch
  };
}
