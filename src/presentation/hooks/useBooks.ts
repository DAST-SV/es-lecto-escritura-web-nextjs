/**
 * UBICACIÓN: src/presentation/hooks/useBooks.ts
 */

import { useState } from 'react';
import { CreateBookUseCase } from '@/src/core/application/use-cases/books/CreateBook.usecase';
import { UpdateBookUseCase } from '@/src/core/application/use-cases/books/UpdateBook.usecase';
import { GetBookUseCase } from '@/src/core/application/use-cases/books/GetBook.usecase';
import { GetBooksByUserUseCase } from '@/src/core/application/use-cases/books/GetBooksByUser.usecase';
import { DeleteBookUseCase } from '@/src/core/application/use-cases/books/DeleteBook.usecase';

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

export function useBooks() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBook = async (userId: string, bookData: BookData) => {
    setLoading(true);
    setError(null);
    try {
      const libroId = await CreateBookUseCase.execute(userId, bookData);
      return libroId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getBook = async (bookId: string) => {
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

  const getBooksByUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const books = await GetBooksByUserUseCase.execute(userId);
      return books;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBook = async (bookId: string, bookData: BookData) => {
    setLoading(true);
    setError(null);
    try {
      await UpdateBookUseCase.execute(bookId, bookData);
      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = async (bookId: string) => {
    setLoading(true);
    setError(null);
    try {
      await DeleteBookUseCase.execute(bookId);
      return true;
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
    createBook,
    getBook,
    getBooksByUser,
    updateBook,
    deleteBook,
  };
}