/**
 * UBICACIÓN: app/[locale]/books/preview-pdf/page.tsx
 * Preview de PDF como libro SIN guardar en base de datos
 */

'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import HTMLFlipBook from 'react-pageflip';
import { 
  Upload, Loader2, AlertCircle, X, ChevronLeft, 
  ChevronRight, Maximize, Minimize, ArrowLeft, BookOpen 
} from 'lucide-react';
import { PDFExtractorService } from '@/src/infrastructure/services/PDFExtractorService';
import type { Page } from '@/src/core/domain/types';
import '@/src/presentation/features/layouts/styles/book-shared.css';
import { PageRenderer } from '@/src/presentation/features/layouts/components/PageRenderer';

type Status = 'idle' | 'extracting' | 'preview' | 'error';

export default function PreviewPDFPage() {
  const router = useRouter();
  const locale = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Estados
  const [status, setStatus] = useState<Status>('idle');
  const [extractedPages, setExtractedPages] = useState<Page[]>([]);
  const [pdfTitle, setPdfTitle] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Estados del visor
  const [currentPage, setCurrentPage] = useState(0);
  const [bookDimensions, setBookDimensions] = useState({ width: 400, height: 520 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => setIsReady(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Calcular dimensiones del libro
  useEffect(() => {
    if (!isClient || status !== 'preview') return;

    const calculateDimensions = () => {
      if (!containerRef.current) return;

      const containerHeight = containerRef.current.clientHeight;
      const containerWidth = containerRef.current.clientWidth;

      if (containerHeight <= 0 || containerWidth <= 0) return;

      const reservedHeight = 160;
      const availableHeight = containerHeight - reservedHeight;
      const availableWidth = containerWidth - 100;
      const aspectRatio = 5 / 6;

      let bookWidth = 400;
      let bookHeight = 520;

      if (availableHeight > 0 && availableWidth > 0) {
        bookHeight = Math.min(availableHeight, 700);
        bookWidth = bookHeight * aspectRatio;

        if (bookWidth > availableWidth) {
          bookWidth = availableWidth;
          bookHeight = bookWidth / aspectRatio;
        }
      }

      setBookDimensions({
        width: Math.max(Math.round(bookWidth), 300),
        height: Math.max(Math.round(bookHeight), 390)
      });
    };

    calculateDimensions();
    const timer = setTimeout(calculateDimensions, 100);
    const timer2 = setTimeout(calculateDimensions, 300);
    
    window.addEventListener('resize', calculateDimensions);
    
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(calculateDimensions);
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      window.removeEventListener('resize', calculateDimensions);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [isClient, isFullscreen, status]);

  // Manejar selección de archivo
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setErrorMessage('Por favor selecciona un archivo PDF válido');
      setStatus('error');
      return;
    }

    setStatus('extracting');
    setErrorMessage('');
    setProgress({ current: 0, total: 0 });

    try {
      console.log('📄 Extrayendo páginas del PDF...');
      const result = await PDFExtractorService.extractPagesFromPDF(file);
      
      setExtractedPages(result.pages);
      setPdfTitle(result.pdfTitle || file.name.replace('.pdf', ''));
      setProgress({ current: result.pages.length, total: result.pages.length });
      
      console.log(`✅ ${result.pages.length} páginas extraídas`);
      setStatus('preview');

    } catch (error: any) {
      console.error('❌ Error procesando PDF:', error);
      setErrorMessage(error.message || 'Error al procesar el PDF');
      setStatus('error');
    }
  };

  // Controles del libro
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const goToNextPage = () => {
    if (currentPage < extractedPages.length - 1) {
      bookRef.current?.pageFlip().flipNext();
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      bookRef.current?.pageFlip().flipPrev();
    }
  };

  const handleClose = () => {
    // Limpiar URLs de blobs antes de salir
    PDFExtractorService.cleanupBlobUrls(extractedPages);
    router.push(`/${locale}/books`);
  };

  const handleReset = () => {
    PDFExtractorService.cleanupBlobUrls(extractedPages);
    setExtractedPages([]);
    setPdfTitle('');
    setStatus('idle');
    setErrorMessage('');
    setCurrentPage(0);
    setActivePage(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (status !== 'preview') return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNextPage();
      if (e.key === 'ArrowLeft') goToPrevPage();
      if (e.key === 'Escape') handleClose();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, extractedPages.length, status]);

  // Memoizar páginas
  const memoizedPages = useMemo(() => {
    return extractedPages.map((page, idx) => ({
      ...page,
      key: `page-${page.id}-${idx}`,
    }));
  }, [extractedPages]);

  // Configuración del flipbook
  const flipBookProps = useMemo(() => {
    if (!isClient || !isReady || status !== 'preview') return null;

    return {
      width: bookDimensions.width,
      height: bookDimensions.height,
      maxShadowOpacity: 0.5,
      drawShadow: true,
      showCover: true,
      flippingTime: 700,
      size: "fixed" as const,
      className: "book-flipbook-container",
      onFlip: (e: any) => {
        setCurrentPage(e.data);
        setActivePage(e.data);
      },
      startPage: 0,
      minWidth: bookDimensions.width,
      maxWidth: bookDimensions.width,
      minHeight: bookDimensions.height,
      maxHeight: bookDimensions.height,
      usePortrait: false,
      startZIndex: 0,
      autoSize: false,
      mobileScrollSupport: false,
      clickEventForward: true,
      useMouseEvents: true,
      swipeDistance: 10,
      showPageCorners: true,
      disableFlipByClick: false,
      style: {},
      children: memoizedPages.map((page, idx) => {
        const isActive = idx === activePage;
        
        return (
          <div className="page w-full h-full" key={page.key}>
            <div className="page-inner w-full h-full">
              <PageRenderer page={page} isActive={isActive} />
            </div>
          </div>
        );
      }),
    };
  }, [isClient, isReady, status, bookDimensions, memoizedPages, activePage]);

  // ========== RENDER ESTADOS ==========

  // Estado: IDLE (esperando PDF)
  if (status === 'idle') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="mb-8">
            <button
              onClick={() => router.push(`/${locale}/books`)}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              Volver a biblioteca
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Previsualizar PDF como Libro
            </h1>
            <p className="text-gray-600 mt-2">
              Sube un PDF y visualízalo como un libro interactivo
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                📚 Visor de PDF
              </h2>
              <p className="text-indigo-100 text-sm mt-2">
                Sin guardar - Solo preview temporal
              </p>
            </div>

            <div className="p-8">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-3 border-dashed border-indigo-300 rounded-2xl bg-indigo-50 hover:bg-indigo-100 transition-all duration-200 p-16 group"
              >
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-indigo-200 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Upload size={48} className="text-indigo-600" />
                  </div>
                  <p className="text-xl font-semibold text-gray-900 mb-2">
                    Selecciona un archivo PDF
                  </p>
                  <p className="text-sm text-gray-600">
                    Haz clic aquí para seleccionar tu PDF
                  </p>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <BookOpen size={18} />
                  Características
                </h3>
                <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
                  <li>Preview temporal - No se guarda en base de datos</li>
                  <li>Efecto de libro con páginas pasables</li>
                  <li>Navegación con teclado (← →) y ratón</li>
                  <li>Modo pantalla completa disponible</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado: EXTRACTING (procesando PDF)
  if (status === 'extracting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={64} className="animate-spin text-indigo-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Extrayendo páginas del PDF...
          </h2>
          {progress.total > 0 && (
            <div className="mt-6 max-w-xs mx-auto">
              <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
              <p className="text-slate-300 text-sm mt-2">
                {progress.current} / {progress.total} páginas
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Estado: ERROR
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error al procesar PDF
          </h2>
          
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
            >
              Intentar de nuevo
            </button>
            <button
              onClick={() => router.push(`/${locale}/books`)}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            >
              Volver a biblioteca
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Estado: PREVIEW (mostrando libro)
  if (status === 'preview' && extractedPages.length > 0 && isClient && isReady) {
    return (
      <div 
        ref={containerRef}
        className="w-full h-screen relative bg-gradient-to-br from-slate-900 to-slate-800"
        style={{ zIndex: 9999 }}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-[10000] bg-gradient-to-b from-black/60 to-transparent px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="text-white" size={24} />
              <div>
                <h1 className="text-white font-bold text-lg">{pdfTitle}</h1>
                <p className="text-white/70 text-sm">
                  Preview temporal • {extractedPages.length} páginas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all"
                title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>

              <button
                onClick={handleClose}
                className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all"
                title="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Libro */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 9998 }}>
          <div 
            className="relative"
            style={{
              width: `${bookDimensions.width}px`,
              height: `${bookDimensions.height}px`,
            }}
          >
            <div className="drop-shadow-2xl">
              {flipBookProps && (
                <HTMLFlipBook {...flipBookProps} ref={bookRef} />
              )}
            </div>
          </div>
        </div>

        {/* Footer con controles */}
        <div className="absolute bottom-0 left-0 right-0 z-[10000] bg-gradient-to-t from-black/60 to-transparent px-6 py-6">
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 0}
              className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full transition-all disabled:opacity-30"
              title="Página anterior"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-full font-medium">
              {currentPage + 1} / {extractedPages.length}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === extractedPages.length - 1}
              className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full transition-all disabled:opacity-30"
              title="Página siguiente"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <p className="text-center text-white/60 text-xs mt-3">
            Usa las flechas ← → para navegar | ESC para salir
          </p>
        </div>
      </div>
    );
  }

  // Loading estado del visor
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-white text-center">
        <BookOpen size={48} className="mx-auto mb-4 animate-pulse" />
        <p>Cargando visor...</p>
      </div>
    </div>
  );
}