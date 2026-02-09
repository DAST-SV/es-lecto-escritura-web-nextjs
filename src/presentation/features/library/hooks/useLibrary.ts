// src/presentation/features/library/hooks/useLibrary.ts
/**
 * ============================================
 * HOOK: useLibrary
 * Hook principal orquestador para la Biblioteca
 * Maneja categorias, busqueda y estado general
 * Locale-aware para traducciones por idioma
 * ============================================
 */

'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { BookLibraryRepository, CategoryWithBooks, LibraryBook } from '@/src/infrastructure/repositories/books/BookLibraryRepository';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

const SEARCH_DEBOUNCE_MS = 300;

export function useLibrary() {
  const locale = useLocale();
  const { t, loading } = useSupabaseTranslations('library');

  const [categories, setCategories] = useState<CategoryWithBooks[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<LibraryBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Cargar categorias con traducciones del locale actual
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const data = await BookLibraryRepository.getCategoriesWithBooks(locale);
        setCategories(data);
      } catch (err) {
        console.error('Error cargando categorias de biblioteca:', err);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, [locale]);

  // Busqueda con debounce
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const results = await BookLibraryRepository.searchBooks(searchTerm.trim(), locale);
        setSearchResults(results);
      } catch (err) {
        console.error('Error buscando libros:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchTerm, locale]);

  return {
    locale,
    categories,
    isLoadingCategories,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    t,
    loading,
  };
}

export default useLibrary;
