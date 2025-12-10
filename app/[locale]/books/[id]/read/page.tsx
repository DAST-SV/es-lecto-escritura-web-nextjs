/**
 * UBICACIÓN: app/[locale]/books/[id]/read/page.tsx
 * ✅ CORREGIDO: Sin UnifiedLayout para control total de la pantalla
 */

import { BookRepository } from '@/src/infrastructure/repositories/books/BookRepository';
import { FlipBookPDFViewer } from '@/src/presentation/features/books/components/FlipBookPDF/FlipBookPDFViewer';
import { redirect } from 'next/navigation';
import { createClient } from '@/src/utils/supabase/server';

interface ReadBookPageProps {
  params: {
    id: string;
  };
}

export default async function ReadBookPage({ params }: ReadBookPageProps) {
  const { id: bookId } = params;

  // Obtener usuario
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Cargar libro
  const book = await BookRepository.getComplete(bookId);

  if (!book) {
    redirect('/books');
  }

  // Validar que tenga PDF
  if (!book.pdfUrl) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <div className="text-orange-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Libro sin PDF
          </h2>
          <p className="text-gray-600 mb-4">
            Este libro no tiene un archivo PDF asociado
          </p>
          
            href="/books"
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Volver a Mis Libros
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <FlipBookPDFViewer
        pdfUrl={book.pdfUrl}
        bookId={bookId}
        bookTitle={book.titulo}
        userId={user?.id || null}
      />
    </div>
  );
}