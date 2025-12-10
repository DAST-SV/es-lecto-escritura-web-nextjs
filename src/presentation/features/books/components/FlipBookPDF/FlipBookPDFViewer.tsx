/**
 * UBICACIÓN: src/presentation/features/books/components/FlipBookPDF/FlipBookPDFViewer.tsx
 * ✅ Visualizador de PDFs con FlipBook + Analytics
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as pdfjs from 'pdfjs-dist';
import HTMLFlipBook from 'react-pageflip';
import { BookAnalyticsService } from '@/src/infrastructure/services/BookAnalyticsService';
import { Loader2 } from 'lucide-react';

// Configurar worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface FlipBookPDFViewerProps {
  pdfUrl: string;
  bookId: string;
  bookTitle?: string;
  userId?: string | null;
}

export function FlipBookPDFViewer({
  pdfUrl,
  bookId,
  bookTitle = 'Libro',
  userId = null
}: FlipBookPDFViewerProps) {
  const [pages, setPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  const bookRef = useRef<any>(null);
  const sessionIdRef = useRef<string | null>(null);
  const pageStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar PDF y convertir a imágenes
  useEffect(() => {
    async function loadPDF() {
      try {
        setIsLoading(true);
        setError(null);

        console.log('📖 Cargando PDF:', pdfUrl);

        const loadingTask = pdfjs.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        console.log(`✅ PDF cargado: ${pdf.numPages} páginas`);

        const pageImages: string[] = [];

        // Renderizar cada página como imagen
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d')!;
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;

          const imageUrl = canvas.toDataURL('image/png');
          pageImages.push(imageUrl);

          console.log(`✅ Página ${i}/${pdf.numPages} renderizada`);
        }

        setPages(pageImages);
        setIsLoading(false);

        // Iniciar sesión de analytics
        if (sessionIdRef.current === null) {
          const sessionId = BookAnalyticsService.startReadingSession(
            bookId,
            pageImages.length,
            userId
          );
          sessionIdRef.current = sessionId;
        }

      } catch (err: any) {
        console.error('❌ Error cargando PDF:', err);
        setError(err.message || 'Error al cargar el PDF');
        setIsLoading(false);
      }
    }

    if (pdfUrl) {
      loadPDF();
    }

    // Cleanup al desmontar
    return () => {
      if (sessionIdRef.current) {
        BookAnalyticsService.endReadingSession(bookId, sessionIdRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [pdfUrl, bookId, userId]);

  // Timer de lectura
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setReadingTime(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Tracking al cambiar de página
  const handlePageChange = (e: any) => {
    const newPage = e.data;
    
    if (sessionIdRef.current && currentPage !== newPage) {
      // Guardar tiempo en página anterior
      const now = Date.now();
      const duration = Math.floor((now - pageStartTimeRef.current) / 1000);
      
      if (duration > 0) {
        BookAnalyticsService.trackPageDuration(
          bookId,
          sessionIdRef.current,
          currentPage + 1,
          duration
        );
      }

      // Registrar vista de nueva página
      BookAnalyticsService.trackPageView(
        bookId,
        sessionIdRef.current,
        newPage + 1
      );

      pageStartTimeRef.current = now;
      setCurrentPage(newPage);
    }
  };

  // Formatear tiempo de lectura
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Cargando libro...</p>
          <p className="text-sm text-gray-500 mt-2">Preparando páginas del PDF</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Error al cargar el libro
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">No se encontraron páginas en el PDF</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header con info */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-900">{bookTitle}</h1>
            <p className="text-sm text-gray-600">
              Página {currentPage + 1} de {pages.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">
              ⏱️ {formatTime(readingTime)}
            </p>
            <p className="text-xs text-gray-500">Tiempo de lectura</p>
          </div>
        </div>
      </div>

      {/* FlipBook */}
      <div className="flex-1 flex items-center justify-center p-6">
        <HTMLFlipBook
          ref={bookRef}
          width={400}
          height={600}
          size="fixed"
          minWidth={300}
          maxWidth={600}
          minHeight={400}
          maxHeight={800}
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={false}
          onFlip={handlePageChange}
          className="shadow-2xl"
        >
          {pages.map((pageUrl, index) => (
            <div key={index} className="bg-white">
              <img
                src={pageUrl}
                alt={`Página ${index + 1}`}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </HTMLFlipBook>
      </div>
    </div>
  );
}