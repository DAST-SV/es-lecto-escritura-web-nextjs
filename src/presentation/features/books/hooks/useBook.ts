/**
 * UBICACIÓN: src/presentation/features/books/hooks/useBook.ts
 * Hook CORREGIDO para manejar un libro individual
 */

import { useState } from 'react';
import { CreateBookUseCase } from '../../../../core/application/use-cases/books/CreateBook.usecase';
import { UpdateBookUseCase } from '../../../../core/application/use-cases/books/UpdateBook.usecase';
import { GetBookUseCase } from '../../../../core/application/use-cases/books/GetBook.usecase';

interface PageData {
  layout: string;
  title?: string;
  text?: string;
  image?: string;
  background?: string;
}

interface BookData {
  titulo: string;
  descripcion: string;
  portada?: string;
  autores: string[];
  personajes: string[];
  categorias: number[];
  generos: number[];
  etiquetas: number[];
  valores: number[];
  nivel: number;
  pages: PageData[];
}

export function useBook() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Guardar libro (crear o actualizar)
   */
  const saveBook = async (
    userId: string,
    bookData: BookData,
    bookId?: string
  ): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      if (bookId) {
        // Actualizar libro existente
        await UpdateBookUseCase.execute(bookId, bookData);
        return bookId;
      } else {
        // Crear libro nuevo
        const libroId = await CreateBookUseCase.execute(userId, bookData);
        return libroId;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar libro por ID
   */
  const loadBook = async (bookId: string) => {
    setLoading(true);
    setError(null);

    try {
      const libro = await GetBookUseCase.execute(bookId);
      return libro;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    saveBook,
    loadBook,
  };
}