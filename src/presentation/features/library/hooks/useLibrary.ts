/**
 * ============================================
 * HOOK: useLibrary
 * Hook principal orquestador para la Biblioteca
 * Maneja categorias, busqueda y estado general
 * ============================================
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { BookLibraryRepository, CategoryWithBooks } from '@/src/infrastructure/repositories/books/BookLibraryRepository';
import { BookExtended } from '@/src/core/domain/entities/BookExtended';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

// ============================================
// CONSTANTES
// ============================================

const SEARCH_DEBOUNCE_MS = 300;

// ============================================
// HOOK
// ============================================

export function useLibrary() {
  const locale = useLocale();
  const { t, loading } = useSupabaseTranslations('library');

  // Estado de categorias
  const [categories, setCategories] = useState<CategoryWithBooks[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Estado de seleccion
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Estado de busqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<BookExtended[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // ============================================
  // CARGAR CATEGORIAS
  // ============================================

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const data = await BookLibraryRepository.getCategoriesWithBooks();
        setCategories(data);
      } catch (err) {
        console.error('Error cargando categorias de biblioteca:', err);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // ============================================
  // BUSQUEDA CON DEBOUNCE
  // ============================================

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const results = await BookLibraryRepository.searchBooks(searchTerm.trim());
        setSearchResults(results);
      } catch (err) {
        console.error('Error buscando libros:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Categorias
    categories,
    isLoadingCategories,

    // Seleccion
    selectedCategory,
    setSelectedCategory,

    // Busqueda
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,

    // Traducciones
    t,
    loading,
  };
}

export default useLibrary;
