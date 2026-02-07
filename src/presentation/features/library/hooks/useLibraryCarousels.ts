/**
 * ============================================
 * HOOK: useLibraryCarousels
 * Carga datos para cada fila de carrusel
 * Estilo Netflix: destacados, populares, nuevos, etc.
 * ============================================
 */

'use client';

import { useState, useEffect } from 'react';
import { BookLibraryRepository } from '@/src/infrastructure/repositories/books/BookLibraryRepository';
import { CategoryWithBooks } from '@/src/infrastructure/repositories/books/BookLibraryRepository';
import { BookExtended } from '@/src/core/domain/entities/BookExtended';

// ============================================
// CONSTANTES
// ============================================

const MAX_CATEGORY_CAROUSELS = 5;

// ============================================
// HOOK
// ============================================

export function useLibraryCarousels(categories: CategoryWithBooks[]) {
  // Estado de filas principales
  const [featuredBooks, setFeaturedBooks] = useState<BookExtended[]>([]);
  const [topBooks, setTopBooks] = useState<BookExtended[]>([]);
  const [newBooks, setNewBooks] = useState<BookExtended[]>([]);
  const [topRatedBooks, setTopRatedBooks] = useState<BookExtended[]>([]);

  // Estado de filas por categoria
  const [categoryBooks, setCategoryBooks] = useState<Map<string, BookExtended[]>>(new Map());

  // Estado de carga
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  // ============================================
  // CARGAR FILAS PRINCIPALES (en paralelo)
  // ============================================

  useEffect(() => {
    const loadMainCarousels = async () => {
      setIsLoading(true);
      try {
        const [featured, top, recent, rated] = await Promise.all([
          BookLibraryRepository.getFeaturedBooks(10),
          BookLibraryRepository.getTopBooks(10),
          BookLibraryRepository.getNewBooks(15),
          BookLibraryRepository.getTopRated(15),
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
  }, []);

  // ============================================
  // CARGAR LIBROS POR CATEGORIA (despues de datos iniciales)
  // ============================================

  useEffect(() => {
    if (isLoading || categories.length === 0) return;

    const loadCategoryBooks = async () => {
      setIsCategoryLoading(true);
      try {
        const categoriesToLoad = categories.slice(0, MAX_CATEGORY_CAROUSELS);

        const results = await Promise.all(
          categoriesToLoad.map((cat) =>
            BookLibraryRepository.getBooksByCategory(cat.id, 15)
          )
        );

        const newCategoryBooks = new Map<string, BookExtended[]>();
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
  }, [categories, isLoading]);

  // ============================================
  // RETURN
  // ============================================

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
