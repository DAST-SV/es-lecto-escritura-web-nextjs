// src/presentation/hooks/api/use-books.ts
// Hooks de TanStack Query para gestión de libros

'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { apiClient } from '@/src/infrastructure/http';
import type { BookExploreFilters } from '@/src/core/domain/types';

// ============================================
// TIPOS
// ============================================

interface Book {
  id: string;
  titulo: string;
  descripcion: string;
  portada: string | null;
  pdfUrl: string | null;
  autores: string[];
  personajes: string[];
  categorias: string[];
  generos: string[];
  etiquetas: string[];
  valores: string[];
  nivel: any;
  paginas: any[];
  fecha_creacion: string;
  is_published: boolean;
}

interface BookListItem {
  id_libro: string;
  titulo: string;
  descripcion: string;
  portada: string | null;
  pdfUrl: string | null;
  autores: string[];
  fecha_creacion: string;
}

interface BooksResponse {
  books: BookListItem[];
  total: number;
}

interface ExploreResponse {
  books: any[];
  total: number;
  hasMore: boolean;
  filters: BookExploreFilters;
}

interface CreateBookData {
  titulo: string;
  descripcion?: string;
  portada?: string | null;
  pdfUrl?: string | null;
  autores?: string[];
  personajes?: string[];
  categorias?: number[];
  generos?: number[];
  etiquetas?: number[];
  valores?: number[];
  nivel?: number | null;
  pages?: any[];
}

interface UpdateBookData extends CreateBookData {
  id: string;
}

// ============================================
// QUERY KEYS
// ============================================

export const bookKeys = {
  all: ['books'] as const,
  lists: () => [...bookKeys.all, 'list'] as const,
  list: (filters?: string) => [...bookKeys.lists(), filters] as const,
  details: () => [...bookKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookKeys.details(), id] as const,
  explore: () => [...bookKeys.all, 'explore'] as const,
  exploreFiltered: (filters: BookExploreFilters) => [...bookKeys.explore(), filters] as const,
  featured: () => [...bookKeys.all, 'featured'] as const,
  popular: () => [...bookKeys.all, 'popular'] as const,
};

// ============================================
// HOOKS DE QUERY
// ============================================

/**
 * Obtiene los libros del usuario autenticado
 */
export function useMyBooks(options?: Omit<UseQueryOptions<BooksResponse>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: bookKeys.lists(),
    queryFn: () => apiClient.get<BooksResponse>('/api/v1/books'),
    ...options,
  });
}

/**
 * Obtiene un libro por su ID
 */
export function useBook(
  id: string,
  options?: Omit<UseQueryOptions<Book>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: bookKeys.detail(id),
    queryFn: () => apiClient.get<Book>(`/api/v1/books/${id}`),
    enabled: !!id,
    ...options,
  });
}

/**
 * Explora libros con filtros
 */
export function useExploreBooks(
  filters: BookExploreFilters = {},
  options?: Omit<UseQueryOptions<ExploreResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: bookKeys.exploreFiltered(filters),
    queryFn: () => apiClient.post<ExploreResponse>('/api/v1/books/explore', filters),
    ...options,
  });
}

/**
 * Explora libros con paginación infinita
 */
export function useInfiniteExploreBooks(
  filters: Omit<BookExploreFilters, 'offset'> = {}
) {
  const limit = filters.limit || 12;

  return useInfiniteQuery({
    queryKey: [...bookKeys.explore(), 'infinite', filters],
    queryFn: ({ pageParam = 0 }) =>
      apiClient.post<ExploreResponse>('/api/v1/books/explore', {
        ...filters,
        limit,
        offset: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (!lastPage.hasMore) return undefined;
      return lastPageParam + limit;
    },
  });
}

/**
 * Obtiene libros destacados
 */
export function useFeaturedBooks(
  limit: number = 6,
  options?: Omit<UseQueryOptions<{ books: any[]; total: number }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...bookKeys.featured(), limit],
    queryFn: () =>
      apiClient.get<{ books: any[]; total: number }>('/api/v1/books/explore/featured', {
        params: { limit },
      }),
    staleTime: 5 * 60 * 1000, // 5 minutos
    ...options,
  });
}

/**
 * Obtiene libros populares
 */
export function usePopularBooks(
  limit: number = 6,
  options?: Omit<UseQueryOptions<{ books: any[]; total: number }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...bookKeys.popular(), limit],
    queryFn: () =>
      apiClient.get<{ books: any[]; total: number }>('/api/v1/books/explore/popular', {
        params: { limit },
      }),
    staleTime: 5 * 60 * 1000, // 5 minutos
    ...options,
  });
}

// ============================================
// HOOKS DE MUTACIÓN
// ============================================

/**
 * Crea un nuevo libro
 */
export function useCreateBook(
  options?: UseMutationOptions<{ id: string; message: string }, Error, CreateBookData>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookData) =>
      apiClient.post<{ id: string; message: string }>('/api/v1/books', data),
    onSuccess: () => {
      // Invalidar lista de libros del usuario
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
    },
    ...options,
  });
}

/**
 * Actualiza un libro existente
 */
export function useUpdateBook(
  options?: UseMutationOptions<{ message: string }, Error, UpdateBookData>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateBookData) =>
      apiClient.put<{ message: string }>(`/api/v1/books/${id}`, data),
    onSuccess: (_data, variables) => {
      // Invalidar el libro específico y la lista
      queryClient.invalidateQueries({ queryKey: bookKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
    },
    ...options,
  });
}

/**
 * Elimina un libro
 */
export function useDeleteBook(
  options?: UseMutationOptions<{ message: string }, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<{ message: string }>(`/api/v1/books/${id}`),
    onSuccess: (_data, id) => {
      // Eliminar del caché y invalidar lista
      queryClient.removeQueries({ queryKey: bookKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
    },
    ...options,
  });
}
