/**
 * ============================================
 * HOOK: useBookExplore
 * Hook principal para exploración de libros
 * Maneja filtros, búsqueda, paginación y estado
 * ============================================
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BookExploreRepository, BookExploreResult } from '@/src/infrastructure/repositories/books/BookExploreRepository';
import { BookExtended } from '@/src/core/domain/entities/BookExtended';
import {
  BookExploreFilters,
  CatalogItemTranslated,
  LevelItemTranslated,
  BookSortOption,
  AccessType,
} from '@/src/core/domain/types';

// ============================================
// TIPOS
// ============================================

export interface UseBookExploreReturn {
  // Datos
  books: BookExtended[];
  featuredBooks: BookExtended[];
  totalResults: number;
  hasMore: boolean;

  // Estado
  isLoading: boolean;
  isLoadingMore: boolean;
  isLoadingCatalogs: boolean;
  error: string | null;

  // Filtros
  filters: BookExploreFilters;
  setFilters: (filters: BookExploreFilters) => void;
  updateFilter: <K extends keyof BookExploreFilters>(key: K, value: BookExploreFilters[K]) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;

  // Búsqueda
  searchTerm: string;
  setSearchTerm: (term: string) => void;

  // Catálogos (para UI de filtros)
  categories: CatalogItemTranslated[];
  genres: CatalogItemTranslated[];
  levels: LevelItemTranslated[];

  // Paginación
  loadMore: () => void;
  refresh: () => void;
}

// ============================================
// CONSTANTES
// ============================================

const DEFAULT_LIMIT = 12;
const DEBOUNCE_MS = 300;

const INITIAL_FILTERS: BookExploreFilters = {
  categories: [],
  genres: [],
  levels: [],
  accessTypes: [],
  sortBy: 'recent',
  limit: DEFAULT_LIMIT,
  offset: 0,
};

// ============================================
// HOOK
// ============================================

export function useBookExplore(): UseBookExploreReturn {
  // Estado de datos
  const [books, setBooks] = useState<BookExtended[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<BookExtended[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Estado de UI
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros y búsqueda
  const [filters, setFiltersState] = useState<BookExploreFilters>(INITIAL_FILTERS);
  const [searchTerm, setSearchTermState] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Catálogos
  const [categories, setCategories] = useState<CatalogItemTranslated[]>([]);
  const [genres, setGenres] = useState<CatalogItemTranslated[]>([]);
  const [levels, setLevels] = useState<LevelItemTranslated[]>([]);

  // ============================================
  // DEBOUNCE PARA BÚSQUEDA
  // ============================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ============================================
  // CARGAR CATÁLOGOS
  // ============================================

  useEffect(() => {
    const loadCatalogs = async () => {
      setIsLoadingCatalogs(true);
      try {
        const [categoriesData, genresData, levelsData] = await Promise.all([
          BookExploreRepository.getCategories(),
          BookExploreRepository.getGenres(),
          BookExploreRepository.getLevels(),
        ]);

        setCategories(categoriesData);
        setGenres(genresData);
        setLevels(levelsData);
      } catch (err) {
        console.error('Error cargando catálogos:', err);
      } finally {
        setIsLoadingCatalogs(false);
      }
    };

    loadCatalogs();
  }, []);

  // ============================================
  // CARGAR LIBROS DESTACADOS
  // ============================================

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const featured = await BookExploreRepository.getFeaturedBooks(6);
        setFeaturedBooks(featured);
      } catch (err) {
        console.error('Error cargando destacados:', err);
      }
    };

    loadFeatured();
  }, []);

  // ============================================
  // CARGAR LIBROS (EXPLORACIÓN)
  // ============================================

  const loadBooks = useCallback(async (append: boolean = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const currentFilters: BookExploreFilters = {
        ...filters,
        searchTerm: debouncedSearchTerm || undefined,
        offset: append ? books.length : 0,
      };

      const result: BookExploreResult = await BookExploreRepository.explore(currentFilters);

      if (append) {
        setBooks(prev => [...prev, ...result.books]);
      } else {
        setBooks(result.books);
      }

      setTotalResults(result.total);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Error cargando libros:', err);
      setError('Error al cargar los libros. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [filters, debouncedSearchTerm, books.length]);

  // Efecto para cargar libros cuando cambian filtros o búsqueda
  useEffect(() => {
    loadBooks(false);
  }, [filters, debouncedSearchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================
  // MÉTODOS DE FILTROS
  // ============================================

  const setFilters = useCallback((newFilters: BookExploreFilters) => {
    setFiltersState({
      ...newFilters,
      offset: 0, // Resetear paginación al cambiar filtros
    });
  }, []);

  const updateFilter = useCallback(<K extends keyof BookExploreFilters>(
    key: K,
    value: BookExploreFilters[K]
  ) => {
    setFiltersState(prev => ({
      ...prev,
      [key]: value,
      offset: 0,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(INITIAL_FILTERS);
    setSearchTermState('');
  }, []);

  // ============================================
  // BÚSQUEDA
  // ============================================

  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
  }, []);

  // ============================================
  // PAGINACIÓN
  // ============================================

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      loadBooks(true);
    }
  }, [isLoadingMore, hasMore, loadBooks]);

  const refresh = useCallback(() => {
    loadBooks(false);
  }, [loadBooks]);

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const hasActiveFilters = useMemo(() => {
    return (
      (filters.categories && filters.categories.length > 0) ||
      (filters.genres && filters.genres.length > 0) ||
      (filters.levels && filters.levels.length > 0) ||
      (filters.accessTypes && filters.accessTypes.length > 0) ||
      (filters.sortBy && filters.sortBy !== 'recent') ||
      searchTerm.trim().length > 0
    );
  }, [filters, searchTerm]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Datos
    books,
    featuredBooks,
    totalResults,
    hasMore,

    // Estado
    isLoading,
    isLoadingMore,
    isLoadingCatalogs,
    error,

    // Filtros
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,

    // Búsqueda
    searchTerm,
    setSearchTerm,

    // Catálogos
    categories,
    genres,
    levels,

    // Paginación
    loadMore,
    refresh,
  };
}

export default useBookExplore;
