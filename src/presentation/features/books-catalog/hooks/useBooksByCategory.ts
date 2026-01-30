// src/presentation/features/books-catalog/hooks/useBooksByCategory.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import type { BookListItem } from '@/src/core/domain/entities/BookWithTranslations';

interface UseBooksByCategoryOptions {
  categorySlug: string;
  limit?: number;
}

export function useBooksByCategory({ categorySlug, limit = 20 }: UseBooksByCategoryOptions) {
  const locale = useLocale();
  const [books, setBooks] = useState<BookListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchBooks = useCallback(async (reset = false) => {
    setIsLoading(true);
    setError(null);

    const currentOffset = reset ? 0 : offset;

    try {
      const params = new URLSearchParams({
        lang: locale,
        limit: limit.toString(),
        offset: currentOffset.toString()
      });

      const response = await fetch(`/api/books-catalog/categories/${categorySlug}/books?${params}`);
      if (!response.ok) throw new Error('Error al cargar libros');

      const data = await response.json();

      if (reset) {
        setBooks(data);
        setOffset(limit);
      } else {
        setBooks(prev => [...prev, ...data]);
        setOffset(prev => prev + limit);
      }

      setHasMore(data.length === limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [categorySlug, locale, limit, offset]);

  useEffect(() => {
    fetchBooks(true);
  }, [categorySlug, locale]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchBooks(false);
    }
  };

  return {
    books,
    isLoading,
    error,
    hasMore,
    loadMore,
    refetch: () => fetchBooks(true)
  };
}
