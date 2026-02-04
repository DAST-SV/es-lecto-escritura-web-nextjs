// ============================================
// src/presentation/features/books-admin/hooks/useBooksAdminManager.ts
// Hook para gestión de libros (admin)
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookAdmin } from '@/src/core/domain/entities/BookAdmin';
import {
  getAllBooksAdmin,
  getBookAdminById,
  createBookAdmin,
  updateBookAdmin,
  softDeleteBookAdmin,
  restoreBookAdmin,
  hardDeleteBookAdmin,
  publishBook,
  unpublishBook,
  addBookTranslation,
  updateBookTranslation,
  deleteBookTranslation,
  setBookAuthors,
  setBookGenres,
  setBookTags,
} from '@/src/core/application/use-cases/books-admin';
import {
  CreateBookAdminDTO,
  UpdateBookAdminDTO,
  CreateBookTranslationDTO,
  UpdateBookTranslationDTO,
  BookAuthorDTO,
  BookGenreDTO,
  BookTagDTO,
} from '@/src/core/domain/repositories/IBookAdminRepository';

export function useBooksAdminManager() {
  const [books, setBooks] = useState<BookAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllBooksAdmin(true);
      setBooks(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const getById = async (id: string): Promise<BookAdmin | null> => {
    return getBookAdminById(id);
  };

  const create = async (data: CreateBookAdminDTO): Promise<BookAdmin> => {
    const book = await createBookAdmin(data);
    await loadBooks();
    return book;
  };

  const update = async (id: string, data: UpdateBookAdminDTO): Promise<BookAdmin> => {
    const book = await updateBookAdmin(id, data);
    await loadBooks();
    return book;
  };

  const softDelete = async (id: string): Promise<void> => {
    await softDeleteBookAdmin(id);
    await loadBooks();
  };

  const restore = async (id: string): Promise<void> => {
    await restoreBookAdmin(id);
    await loadBooks();
  };

  const hardDelete = async (id: string): Promise<void> => {
    await hardDeleteBookAdmin(id);
    await loadBooks();
  };

  const publish = async (id: string): Promise<BookAdmin> => {
    const book = await publishBook(id);
    await loadBooks();
    return book;
  };

  const unpublish = async (id: string): Promise<BookAdmin> => {
    const book = await unpublishBook(id);
    await loadBooks();
    return book;
  };

  // Translation operations
  const addTranslation = async (bookId: string, data: CreateBookTranslationDTO): Promise<void> => {
    await addBookTranslation(bookId, data);
    await loadBooks();
  };

  const updateTranslation = async (bookId: string, languageCode: string, data: UpdateBookTranslationDTO): Promise<void> => {
    await updateBookTranslation(bookId, languageCode, data);
    await loadBooks();
  };

  const removeTranslation = async (bookId: string, languageCode: string): Promise<void> => {
    await deleteBookTranslation(bookId, languageCode);
    await loadBooks();
  };

  // Relation operations
  const updateAuthors = async (bookId: string, authors: BookAuthorDTO[]): Promise<void> => {
    await setBookAuthors(bookId, authors);
    await loadBooks();
  };

  const updateGenres = async (bookId: string, genres: BookGenreDTO[]): Promise<void> => {
    await setBookGenres(bookId, genres);
    await loadBooks();
  };

  const updateTags = async (bookId: string, tags: BookTagDTO[]): Promise<void> => {
    await setBookTags(bookId, tags);
    await loadBooks();
  };

  return {
    books,
    loading,
    error,
    refresh: loadBooks,
    getById,
    create,
    update,
    softDelete,
    restore,
    hardDelete,
    publish,
    unpublish,
    addTranslation,
    updateTranslation,
    removeTranslation,
    updateAuthors,
    updateGenres,
    updateTags,
  };
}
