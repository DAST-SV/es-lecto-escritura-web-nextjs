// src/presentation/hooks/api/use-catalog.ts
// Hooks de TanStack Query para catálogos (categorías, géneros, niveles)

'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/src/infrastructure/http';
import type { CatalogItemTranslated, LevelItemTranslated } from '@/src/core/domain/types';

// ============================================
// TIPOS
// ============================================

interface CategoriesResponse {
  categories: CatalogItemTranslated[];
  counts?: Record<number, number>;
}

interface GenresResponse {
  genres: CatalogItemTranslated[];
}

interface LevelsResponse {
  levels: LevelItemTranslated[];
}

// ============================================
// QUERY KEYS
// ============================================

export const catalogKeys = {
  all: ['catalog'] as const,
  categories: () => [...catalogKeys.all, 'categories'] as const,
  categoriesWithCounts: () => [...catalogKeys.categories(), 'with-counts'] as const,
  genres: () => [...catalogKeys.all, 'genres'] as const,
  levels: () => [...catalogKeys.all, 'levels'] as const,
};

// ============================================
// HOOKS
// ============================================

/**
 * Obtiene todas las categorías
 */
export function useCategories(
  options?: { includeCounts?: boolean } & Omit<UseQueryOptions<CategoriesResponse>, 'queryKey' | 'queryFn'>
) {
  const { includeCounts = false, ...queryOptions } = options || {};

  return useQuery({
    queryKey: includeCounts ? catalogKeys.categoriesWithCounts() : catalogKeys.categories(),
    queryFn: () =>
      apiClient.get<CategoriesResponse>('/api/v1/catalog/categories', {
        params: includeCounts ? { includeCounts: true } : undefined,
      }),
    staleTime: 10 * 60 * 1000, // 10 minutos - los catálogos cambian poco
    ...queryOptions,
  });
}

/**
 * Obtiene todos los géneros
 */
export function useGenres(
  options?: Omit<UseQueryOptions<GenresResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: catalogKeys.genres(),
    queryFn: () => apiClient.get<GenresResponse>('/api/v1/catalog/genres'),
    staleTime: 10 * 60 * 1000, // 10 minutos
    ...options,
  });
}

/**
 * Obtiene todos los niveles de lectura
 */
export function useLevels(
  options?: Omit<UseQueryOptions<LevelsResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: catalogKeys.levels(),
    queryFn: () => apiClient.get<LevelsResponse>('/api/v1/catalog/levels'),
    staleTime: 10 * 60 * 1000, // 10 minutos
    ...options,
  });
}

/**
 * Obtiene todos los catálogos en paralelo
 */
export function useCatalogs(
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  const categoriesQuery = useCategories(options);
  const genresQuery = useGenres(options);
  const levelsQuery = useLevels(options);

  return {
    categories: categoriesQuery.data?.categories || [],
    genres: genresQuery.data?.genres || [],
    levels: levelsQuery.data?.levels || [],
    isLoading: categoriesQuery.isLoading || genresQuery.isLoading || levelsQuery.isLoading,
    isError: categoriesQuery.isError || genresQuery.isError || levelsQuery.isError,
    error: categoriesQuery.error || genresQuery.error || levelsQuery.error,
  };
}
