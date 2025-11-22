/**
 * UBICACIÓN: src/presentation/features/books/hooks/useBooks.ts
 * 
 * Hook para listar y gestionar múltiples libros
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Book } from '../../../../core/domain/entities/Book.entity';

export interface UseBooksOptions {
  userId: string;
  autoLoad?: boolean;
}

export interface UseBooksReturn {
  // Estado
  books: Book[];
  isLoading: boolean;
  error: string | null;
  
  // Filtros y ordenamiento
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  
  // Acciones
  loadBooks: () => Promise<void>;
  refreshBooks: () => Promise<void>;
  clearError: () => void;
  
  // Estadísticas
  totalBooks: number;
  completedBooks: number;
}

export function useBooks({ userId, autoLoad = true }: UseBooksOptions): UseBooksReturn {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Carga los libros del usuario
   */
  const loadBooks = useCallback(async () => {
    if (!userId) {
      setError('Usuario no autenticado');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/libros/bookinformation/${userId}`);
      const result = await response.json();

      if (result.libros) {
        // Aquí deberías mapear los resultados a entidades Book
        // Por ahora uso los datos directamente
        setBooks(result.libros);
      } else {
        setError(result.error || 'Error al cargar los libros');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar los libros');
      console.error('Error cargando libros:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * Recarga los libros
   */
  const refreshBooks = useCallback(async () => {
    await loadBooks();
  }, [loadBooks]);

  /**
   * Limpia el error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-cargar libros al montar
  useEffect(() => {
    if (autoLoad && userId) {
      loadBooks();
    }
  }, [autoLoad, userId, loadBooks]);

  // Filtrar libros por término de búsqueda
  const filteredBooks = searchTerm
    ? books.filter(book => {
        const term = searchTerm.toLowerCase();
        // Aquí asumimos que books tiene la estructura correcta
        // En producción, deberías usar las entidades de dominio
        return (
          (book as any).titulo?.toLowerCase().includes(term) ||
          (book as any).descripcion?.toLowerCase().includes(term) ||
          (book as any).autores?.some((a: string) => a.toLowerCase().includes(term))
        );
      })
    : books;

  // Estadísticas
  const totalBooks = filteredBooks.length;
  const completedBooks = filteredBooks.filter(book => {
    // Aquí deberías usar book.isComplete() si fuera una entidad Book
    return true; // Placeholder
  }).length;

  return {
    books: filteredBooks,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    loadBooks,
    refreshBooks,
    clearError,
    totalBooks,
    completedBooks
  };
}