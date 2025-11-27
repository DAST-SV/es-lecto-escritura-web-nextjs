/**
 * UBICACIÓN: app/[locale]/books/[id]/read/page.tsx
 * ✅ ACTUALIZADO: Carga libro desde la BD y lo muestra
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import HTMLFlipBook from 'react-pageflip';
import { 
  X, ChevronLeft, ChevronRight, Maximize, Minimize, 
  BookOpen, FileText, Loader2, AlertCircle, ArrowLeft
} from 'lucide-react';
import { Page, LayoutType } from '@/src/core/domain/types';
import { PageRenderer } from '@/src/presentation/features/layouts/components/PageRenderer';
import { GetBookUseCase } from '@/src/core/application/use-cases/books/GetBook.usecase';
import '@/src/presentation/features/layouts/styles/book-shared.css';

export default function ReadBookPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params?.id as string;

  const bookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Estados de carga
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Datos del libro
  const [bookData, setBookData] = useState<{
    pages: Page[];
    title: string;
    authors: string[];
    description: string;
    characters: string[];
    categories: string[];
    genres: string[];
    values: string[];
    coverImage: string | null;
  } | null>(null);

  // Estados del visor
  const [currentPage, setCurrentPage] = useState(0);
  const [bookDimensions, setBookDimensions] = useState({ width: 400, height: 520 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [showLiteraryCard, setShowLiteraryCard] = useState(false);

  // Cargar libro
  useEffect(() => {
    async function loadBook() {
      if (!bookId) {
        setError('ID de libro no válido');
        setIsLoading(false);
        return;
      }

      try {
        console.log('📖 Cargando libro:', bookId);
        const libro = await GetBookUseCase.execute(bookId);

        if (!libro) {
          setError('Libro no encontrado');
          setIsLoading(false);
          return;
        }

        console.log('✅ Libro cargado:', libro);

        // Transformar páginas al formato esperado
        const pages: Page[] = (libro.paginas || []).map((p: any, idx: number) => ({
          id: p.id || `page-${idx}`,
          layout: (p.layout || 'TextCenterLayout') as LayoutType,
          title: p.title || '',
          text: p.text || p.content || '',
          image: p.image || p.image_url || null,
          background: p.background || p.background_url || p.background_color || 'blanco',
        }));

        setBookData({
          pages,
          title: libro.titulo || 'Sin título',
          authors: libro.autores || [],
          description: libro.descripcion || '',
          characters: libro.personajes || [],
          categories: libro.categorias || [],
          genres: libro.generos || [],
          values: libro.valores || [],
          coverImage: libro.portada || null,
        });

        setIsLoading(false);
      } catch (err: any) {
        console.error('❌ Error cargando libro:', err);
        setError(err.message || 'Error al cargar el libro');
        setIsLoading(false);
      }
    }

    loadBook();
  }, [bookId]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calcular dimensiones
  useEffect(() => {
    if (!isClient || !bookData) return;

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
    
    window.addEventListener('resize', calculateDimensions);
    
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(calculateDimensions);
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateDimensions);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [isClient, isFullscreen, bookData]);

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
    if (bookData && currentPage < bookData.pages.length - 1) {
      bookRef.current?.pageFlip().flipNext();
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      bookRef.current?.pageFlip().flipPrev();
    }
  };

  const handleClose = () => {
    router.back();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNextPage();
      if (e.key === 'ArrowLeft') goToPrevPage();
      if (e.key === 'Escape') {
        if (showLiteraryCard) {
          setShowLiteraryCard(false);
        } else {
          handleClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, bookData?.pages.length, showLiteraryCard]);

  // Estado de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={64} className="animate-spin text-indigo-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Cargando libro...</h2>
          <p className="text-slate-400">Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No se pudo cargar el libro
          </h2>
          
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Sin datos
  if (!bookData || bookData.pages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen size={40} className="text-amber-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Libro sin contenido
          </h2>
          
          <p className="text-gray-600 mb-6">
            Este libro no tiene páginas disponibles para mostrar.
          </p>
          
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors w-full"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white text-center">
          <BookOpen size={48} className="mx-auto mb-4 animate-pulse" />
          <p>Cargando visor...</p>
        </div>
      </div>
    );
  }

  const flipBookProps: React.ComponentProps<typeof HTMLFlipBook> = {
    width: bookDimensions.width,
    height: bookDimensions.height,
    maxShadowOpacity: 0.5,
    drawShadow: true,
    showCover: true,
    flippingTime: 700,
    size: "fixed",
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
    children: bookData.pages.map((page, idx) => {
      const isActive = idx === activePage;
      
      return (
        <div className="page w-full h-full" key={page.id || idx}>
          <div className="page-inner w-full h-full">
            <PageRenderer page={page} isActive={isActive} />
          </div>
        </div>
      );
    }),
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-screen relative bg-gradient-to-br from-slate-900 to-slate-800"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="text-white" size={24} />
            <div>
              <h1 className="text-white font-bold text-lg">{bookData.title}</h1>
              {bookData.authors.length > 0 && (
                <p className="text-white/70 text-sm">
                  por {bookData.authors.join(', ')}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLiteraryCard(true)}
              className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all"
              title="Ver ficha literaria"
            >
              <FileText size={20} />
            </button>

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

      {/* Libro centrado */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="flex-shrink-0 z-10"
          style={{
            width: `${bookDimensions.width}px`,
            height: `${bookDimensions.height}px`,
          }}
        >
          <div className="drop-shadow-2xl">
            <HTMLFlipBook {...flipBookProps} ref={bookRef} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/60 to-transparent px-6 py-6">
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full transition-all disabled:opacity-30"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-full font-medium">
            {currentPage + 1} / {bookData.pages.length}
          </div>

          <button
            onClick={goToNextPage}
            disabled={currentPage === bookData.pages.length - 1}
            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full transition-all disabled:opacity-30"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="text-center mt-3">
          <p className="text-white/60 text-xs">
            Usa las flechas ← → para navegar | ESC para salir
          </p>
        </div>
      </div>

      {/* Modal Ficha Literaria */}
      {showLiteraryCard && (
        <div 
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowLiteraryCard(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText size={24} />
                  Ficha Literaria
                </h2>
                <button
                  onClick={() => setShowLiteraryCard(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-4">
              {/* Portada e info básica */}
              <div className="flex gap-6">
                {bookData.coverImage && (
                  <div className="flex-shrink-0">
                    <img
                      src={bookData.coverImage}
                      alt={bookData.title}
                      className="w-32 h-44 object-cover rounded-lg shadow-md"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{bookData.title}</h3>
                  {bookData.authors.length > 0 && (
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Autor(es):</span> {bookData.authors.join(', ')}
                    </p>
                  )}
                  {bookData.description && (
                    <p className="text-gray-700 text-sm leading-relaxed">{bookData.description}</p>
                  )}
                </div>
              </div>

              {/* Personajes */}
              {bookData.characters.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Personajes</h4>
                  <div className="flex flex-wrap gap-2">
                    {bookData.characters.map((char, idx) => (
                      <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Categorías y Géneros */}
              <div className="grid grid-cols-2 gap-4">
                {bookData.categories.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Categorías</h4>
                    <div className="flex flex-wrap gap-2">
                      {bookData.categories.map((cat, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {bookData.genres.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Géneros</h4>
                    <div className="flex flex-wrap gap-2">
                      {bookData.genres.map((genre, idx) => (
                        <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Valores */}
              {bookData.values.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Valores que transmite</h4>
                  <div className="flex flex-wrap gap-2">
                    {bookData.values.map((val, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {val}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}