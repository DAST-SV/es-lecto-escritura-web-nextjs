/**
 * UBICACIÓN: src/presentation/features/books/hooks/useBook.ts
 * 
 * Hook principal para gestionar libros desde la UI
 */

'use client';

import { useState, useCallback } from 'react';
import { useSaveBook, useLoadBook } from '../../../../infrastructure/di/providers';
import type { SaveBookDTO } from '../../../../core/application/use-cases/book/SaveBook.usecase';
import type { LoadBookDTO } from '../../../../core/application/use-cases/book/LoadBook.usecase';
import { Book } from '../../../../core/domain/entities/Book.entity';

export interface UseBookReturn {
  // Estado
  book: Book | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Acciones
  loadBook: (bookId: string, userId: string) => Promise<void>;
  saveBook: (dto: SaveBookDTO) => Promise<string | null>;
  clearError: () => void;
  clearBook: () => void;
}

export function useBook(): UseBookReturn {
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveBookUseCase = useSaveBook();
  const loadBookUseCase = useLoadBook();

  /**
   * Carga un libro
   */
  const loadBook = useCallback(async (bookId: string, userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const dto: LoadBookDTO = { bookId, userId };
      const result = await loadBookUseCase.execute(dto);

      if (result.success && result.book) {
        setBook(result.book);
      } else {
        setError(result.message || 'No se pudo cargar el libro');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar el libro');
      console.error('Error cargando libro:', err);
    } finally {
      setIsLoading(false);
    }
  }, [loadBookUseCase]);

  /**
   * Guarda un libro
   */
  const saveBook = useCallback(async (dto: SaveBookDTO): Promise<string | null> => {
    setIsSaving(true);
    setError(null);

    try {
      const result = await saveBookUseCase.execute(dto);

      if (result.success) {
        return result.bookId;
      } else {
        setError(result.message);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar el libro');
      console.error('Error guardando libro:', err);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [saveBookUseCase]);

  /**
   * Limpia el error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Limpia el libro cargado
   */
  const clearBook = useCallback(() => {
    setBook(null);
  }, []);

  return {
    book,
    isLoading,
    isSaving,
    error,
    loadBook,
    saveBook,
    clearError,
    clearBook
  };
}