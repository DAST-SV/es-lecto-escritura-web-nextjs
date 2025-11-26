/**
 * UBICACIÓN: src/presentation/features/books/components/BookReader/BookReader.tsx
 * ✅ CORREGIDO: Props tipadas correctamente
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { 
  X, ChevronLeft, ChevronRight, Maximize, Minimize, 
  BookOpen, FileText
} from 'lucide-react';
import { PageRenderer } from '@/src/presentation/features/layouts/components/PageRenderer';
import '@/src/presentation/features/layouts/styles/book-shared.css';
import { PageEditor } from '@/src/core/domain/types';

interface BookReaderProps {
  pages: PageEditor[];
  title?: string;
  author?: string;
  authors?: string[];
  description?: string;
  characters?: string[];
  categories?: string[];
  genres?: string[];
  values?: string[];
  coverImage?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function BookReader({ 
  pages, 
  title = 'Libro', 
  author,
  authors = [],
  description,
  characters = [],
  categories = [],
  genres = [],
  values = [],
  coverImage,
  onClose,
  showCloseButton = true 
}: BookReaderProps) {
  const bookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [bookDimensions, setBookDimensions] = useState({ width: 400, height: 520 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [showLiteraryCard, setShowLiteraryCard] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cálculo de dimensiones
  useEffect(() => {
    if (!isClient) return;

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
  }, [isClient, isFullscreen]);

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
    if (currentPage < pages.length - 1) {
      bookRef.current?.pageFlip().flipNext();
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      bookRef.current?.pageFlip().flipPrev();
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNextPage();
      if (e.key === 'ArrowLeft') goToPrevPage();
      if (e.key === 'Escape') {
        if (showLiteraryCard) {
          setShowLiteraryCard(false);
        } else if (onClose) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, pages.length, showLiteraryCard]);

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white text-center">
          <BookOpen size={48} className="mx-auto mb-4 animate-pulse" />
          <p>Cargando libro...</p>
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
    children: pages.map((page, idx) => {
      const isActive = idx === activePage;
      
      return (
        <div className="page w-full h-full" key={page.id || idx}>
          <div className="page-inner w-full h-full">
            {/* ✅ CORREGIDO: Pasar props individuales */}
            <PageRenderer
              layout={page.layout}
              title={page.title}
              text={page.text}
              image={page.image ?? undefined}
              background={page.background ?? undefined}
              animation={page.animation}
              border={page.border}
              pageNumber={idx + 1}
              isEditor={false}
              isActive={isActive}
            />
          </div>
        </div>
      );
    }),
  };

  const displayAuthors = authors.length > 0 ? authors : (author ? [author] : []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative bg-gradient-to-br from-slate-900 to-slate-800"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="text-white" size={24} />
            <div>
              <h1 className="text-white font-bold text-lg">{title}</h1>
              {displayAuthors.length > 0 && (
                <p className="text-white/70 text-sm">
                  por {displayAuthors.join(', ')}
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

            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all"
                title="Cerrar"
              >
                <X size={20} />
              </button>
            )}
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

      {/* Footer con controles */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/60 to-transparent px-6 py-6">
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Página anterior (←)"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-full font-medium">
            {currentPage + 1} / {pages.length}
          </div>

          <button
            onClick={goToNextPage}
            disabled={currentPage === pages.length - 1}
            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Página siguiente (→)"
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

      {/* Modal de Ficha Literaria */}
      {showLiteraryCard && (
        <div 
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowLiteraryCard(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{title}</h2>
                  {displayAuthors.length > 0 && (
                    <p className="text-white/90">
                      por {displayAuthors.join(', ')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowLiteraryCard(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Portada y descripción */}
              <div className="flex gap-6">
                {coverImage && (
                  <img 
                    src={coverImage} 
                    alt={title}
                    className="w-32 h-40 object-cover rounded-lg shadow-lg flex-shrink-0"
                  />
                )}
                {description && (
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 text-gray-800">Descripción</h3>
                    <p className="text-gray-600 leading-relaxed">{description}</p>
                  </div>
                )}
              </div>

              {/* Personajes */}
              {characters.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-3 text-gray-800">Personajes</h3>
                  <div className="flex flex-wrap gap-2">
                    {characters.map((character, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                      >
                        {character}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Categorías */}
              {categories.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-3 text-gray-800">Categorías</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Géneros */}
              {genres.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-3 text-gray-800">Géneros</h3>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Valores */}
              {values.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-3 text-gray-800">Valores</h3>
                  <div className="flex flex-wrap gap-2">
                    {values.map((value, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium"
                      >
                        {value}
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

export default BookReader;