'use client';

import React from 'react';
import BookEditorWithPreview from '@/src/components/book-editor/components/BookEditorWithPreview';

interface Page {
  id: string;
  content: string;
  image?: string | null;
  background?: string | null;
}

interface CreateBookPageWrapperProps {
  bookTitle?: string;
  initialPages?: Page[];
}

export default function CreateBookPageWrapper({ 
  bookTitle = 'Mi Libro',
  initialPages = []
}: CreateBookPageWrapperProps) {
  
  const handleSave = async (pages: Page[]) => {
    try {
      console.log('Guardando páginas:', pages);
      
      // Aquí implementa tu lógica de guardado
      // Por ejemplo, llamar a tu API:
      /*
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: bookTitle,
          pages: pages
        })
      });
      
      if (!response.ok) throw new Error('Error al guardar');
      
      const data = await response.json();
      console.log('Libro guardado:', data);
      */
      
    } catch (error) {
      console.error('Error al guardar el libro:', error);
      throw error;
    }
  };

  return (
    <BookEditorWithPreview
      bookTitle={bookTitle}
      initialPages={initialPages}
      onSave={handleSave}
    />
  );
}