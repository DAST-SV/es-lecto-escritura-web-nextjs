/**
 * UBICACIÓN: app/[locale]/books/[id]/read/page.tsx
 * ✅ USA BookReader (componente reutilizable)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { createClient } from '@/src/utils/supabase/client';
import { GetBookUseCase } from '@/src/core/application/use-cases/books/GetBook.usecase';
import { PDFExtractorService } from '@/src/infrastructure/services/PDFExtractorService';
import { BookReader } from '@/src/presentation/features/books/components/BookReader/BookReader';
import type { Page } from '@/src/core/domain/types';

export default function ReadBookPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();
  const bookId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [extractedPages, setExtractedPages] = useState<Page[]>([]);
  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number } | null>(null);
  const [bookTitle, setBookTitle] = useState('');

  useEffect(() => {
    async function loadBook() {
      if (!bookId) {
        setError('ID de libro no válido');
        setIsLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError('Debes iniciar sesión para leer libros');
          setIsLoading(false);
          return;
        }

        const libro = await GetBookUseCase.execute(bookId);

        if (!libro) {
          setError('Libro no encontrado');
          setIsLoading(false);
          return;
        }

        if (!libro.pdfUrl) {
          setError('Este libro no tiene un archivo PDF asociado');
          setIsLoading(false);
          return;
        }

        setBookTitle(libro.titulo || 'Libro');

        console.log('📖 Descargando PDF:', libro.pdfUrl);
        
        const response = await fetch(libro.pdfUrl);
        const blob = await response.blob();
        const file = new File([blob], 'libro.pdf', { type: 'application/pdf' });

        console.log('📄 Extrayendo páginas...');
        const result = await PDFExtractorService.extractPagesFromPDF(file);
        
        setExtractedPages(result.pages);
        
        if (result.pageWidth && result.pageHeight) {
          setPdfDimensions({ 
            width: result.pageWidth, 
            height: result.pageHeight 
          });
        }

        console.log(`✅ ${result.pages.length} páginas extraídas`);
        setIsLoading(false);

      } catch (err: any) {
        console.error('❌ Error cargando libro:', err);
        setError(err.message || 'Error al cargar el libro');
        setIsLoading(false);
      }
    }

    loadBook();

    return () => {
      if (extractedPages.length > 0) {
        PDFExtractorService.cleanupBlobUrls(extractedPages);
      }
    };
  }, [bookId, supabase]);

  const handleClose = () => {
    if (extractedPages.length > 0) {
      PDFExtractorService.cleanupBlobUrls(extractedPages);
    }
    router.push(`/${locale}/books`);
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-indigo-400 mx-auto mb-4" />
          <p className="text-white font-medium">Cargando libro...</p>
          <p className="text-white/60 text-sm mt-2">Preparando páginas del PDF</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No se puede leer el libro
          </h2>
          
          <p className="text-gray-600 mb-6">{error}</p>
          
          <button
            onClick={() => router.push(`/${locale}/books`)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors w-full"
          >
            <ArrowLeft size={20} />
            Volver a biblioteca
          </button>
        </div>
      </div>
    );
  }

  if (extractedPages.length > 0 && pdfDimensions) {
    return (
      <BookReader 
        pages={extractedPages}
        title={bookTitle}
        pdfDimensions={pdfDimensions}
        onClose={handleClose}
      />
    );
  }

  return null;
}