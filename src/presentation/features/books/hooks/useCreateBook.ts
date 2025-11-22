/**
 * UBICACIÓN: src/presentation/features/books/hooks/useCreateBook.ts
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CreateBookData {
  title: string;
  content: string;
}

export function useCreateBook() {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const createBook = async (data: CreateBookData) => {
    setIsCreating(true);

    try {
      // Aquí llamarías a tu API o Use Case
      const response = await fetch('/api/libros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al crear libro');
      }

      const book = await response.json();

      // Redirigir al libro creado
      router.push(`/libros/${book.id}`);

      return { success: true, book };
    } catch (error) {
      console.error('Error:', error);
      return { success: false, error };
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createBook,
    isCreating,
  };
}