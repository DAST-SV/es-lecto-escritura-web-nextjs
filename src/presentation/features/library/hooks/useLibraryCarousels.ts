// src/presentation/features/library/hooks/useLibraryCarousels.ts
/**
 * ============================================
 * HOOK: useLibraryCarousels
 * Carga datos para cada fila de carrusel
 * Estilo Netflix: destacados, populares, nuevos, etc.
 * Locale-aware para traducciones por idioma
 * ============================================
 */

'use client';

import { useState, useEffect } from 'react';
import { BookLibraryRepository, CategoryWithBooks, LibraryBook } from '@/src/infrastructure/repositories/books/BookLibraryRepository';

const MAX_CATEGORY_CAROUSELS = 5;

export function useLibraryCarousels(categories: CategoryWithBooks[], locale: string) {
  const [featuredBooks, setFeaturedBooks] = useState<LibraryBook[]>([]);
  const [topBooks, setTopBooks] = useState<LibraryBook[]>([]);
  const [newBooks, setNewBooks] = useState<LibraryBook[]>([]);
  const [topRatedBooks, setTopRatedBooks] = useState<LibraryBook[]>([]);
  const [categoryBooks, setCategoryBooks] = useState<Map<string, LibraryBook[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  // Cargar filas principales en paralelo
  useEffect(() => {
    const loadMainCarousels = async () => {
      setIsLoading(true);
      try {
        const [featured, top, recent, rated] = await Promise.all([
          BookLibraryRepository.getFeaturedBooks(locale, 10),
          BookLibraryRepository.getTopBooks(locale, 10),
          BookLibraryRepository.getNewBooks(locale, 15),
          BookLibraryRepository.getTopRated(locale, 15),
        ]);

        setFeaturedBooks(featured);
        setTopBooks(top);
        setNewBooks(recent);
        setTopRatedBooks(rated);
      } catch (err) {
        console.error('Error cargando carruseles principales:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMainCarousels();
  }, [locale]);

  // Cargar libros por categoria despues de datos iniciales
  useEffect(() => {
    if (isLoading || categories.length === 0) return;

    const loadCategoryBooks = async () => {
      setIsCategoryLoading(true);
      try {
        const categoriesToLoad = categories.slice(0, MAX_CATEGORY_CAROUSELS);
        const results = await Promise.all(
          categoriesToLoad.map((cat) =>
            BookLibraryRepository.getBooksByCategory(cat.id, locale, 15)
          )
        );

        const newCategoryBooks = new Map<string, LibraryBook[]>();
        categoriesToLoad.forEach((cat, index) => {
          if (results[index] && results[index].length > 0) {
            newCategoryBooks.set(cat.id, results[index]);
          }
        });

        setCategoryBooks(newCategoryBooks);
      } catch (err) {
        console.error('Error cargando libros por categoria:', err);
      } finally {
        setIsCategoryLoading(false);
      }
    };

    loadCategoryBooks();
  }, [categories, isLoading, locale]);

  return {
    featuredBooks,
    topBooks,
    newBooks,
    topRatedBooks,
    categoryBooks,
    isLoading: isLoading || isCategoryLoading,
  };
}

export default useLibraryCarousels;
