/**
 * UBICACIÓN: src/presentation/features/books/components/BookReader/BookReader.tsx
 * ✅ LIMPIO: Usa Page directamente
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { 
  X, ChevronLeft, ChevronRight, Maximize, Minimize, 
  BookOpen, FileText
} from 'lucide-react';
import { PageRenderer } from '@/src/presentation/features/layouts/components/PageRenderer';
import { Page } from '@/src/core/domain/types';
import '@/src/presentation/features/layouts/styles/book-shared.css';

interface BookReaderProps {
  pages: Page[];
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
            <PageRenderer page={page} isActive={isActive} />
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
            {currentPage + 1} / {pages.length}
          </div>

          <button
            onClick={goToNextPage}
            disabled={currentPage === pages.length - 1}
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
            {/* ... resto del modal ... */}
          </div>
        </div>
      )}
    </div>
  );
}

export default BookReader;