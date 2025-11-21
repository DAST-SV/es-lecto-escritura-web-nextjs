'use client';

import { BookEditorWithPreview } from '@/src/components/book-editor/components/BookEditorWithPreview';

// Example usage in a page component
export default function BookEditorPage({ params }: { params: { id: string } }) {
  // If you need to fetch initial data, do it here with useEffect or React Query
  // For this example, we'll use static data
  
  const initialPages = [
    {
      layout: 'TextCenterLayout',
      title: 'Página 1',
      text: '<p>Contenido inicial de la página 1</p>',
      image: null,
      background: null,
      id: 'page-1'
    }
  ];

  return (
    <BookEditorWithPreview
      initialPages={initialPages}
      bookTitle="Mi Libro Ejemplo"
      IdLibro={params.id}
      saveEndpoint="/api/libros/updatebook/" // Optional, defaults to this
    />
  );
}