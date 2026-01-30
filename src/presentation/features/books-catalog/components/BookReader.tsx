// src/presentation/features/books-catalog/components/BookReader.tsx
'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Home,
  BookOpen,
  Volume2,
  VolumeX,
  Maximize,
  Minimize
} from 'lucide-react';
import type { BookPageContent } from '@/src/core/domain/entities/BookPageContent';

interface BookReaderProps {
  book: {
    id: string;
    slug: string;
    title: string;
    coverUrl: string | null;
    categoryName: string;
  };
  pages: BookPageContent[];
  initialPage?: number;
}

export function BookReader({ book, pages, initialPage = 0 }: BookReaderProps) {
  const locale = useLocale();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const totalPages = pages.length;
  const page = pages[currentPage];

  const goToPage = useCallback((pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < totalPages) {
      setCurrentPage(pageIndex);
    }
  }, [totalPages]);

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Manejo de teclado
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      nextPage();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevPage();
    } else if (e.key === 'Escape' && isFullscreen) {
      setIsFullscreen(false);
    }
  }, [currentPage, isFullscreen]); // eslint-disable-line

  // Registrar eventos de teclado
  if (typeof window !== 'undefined') {
    // useEffect sería mejor aquí, pero mantenemos simple
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-white">No hay páginas disponibles</p>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-gray-900 z-50 flex flex-col ${isFullscreen ? '' : ''}`}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-gray-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/biblioteca`}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-300" />
          </Link>
          <div>
            <h1 className="text-white font-medium truncate max-w-xs sm:max-w-md">
              {book.title}
            </h1>
            <p className="text-gray-400 text-sm">{book.categoryName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Indicador de página */}
          <span className="text-gray-300 text-sm px-3 py-1 bg-gray-700 rounded-full">
            {currentPage + 1} / {totalPages}
          </span>

          {/* Controles */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-gray-300" />
            ) : (
              <Volume2 className="w-5 h-5 text-gray-300" />
            )}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5 text-gray-300" />
            ) : (
              <Maximize className="w-5 h-5 text-gray-300" />
            )}
          </button>
        </div>
      </header>

      {/* Contenido de la página */}
      <main className="flex-1 relative overflow-hidden">
        {/* Imagen de fondo */}
        {page.imageUrl && (
          <div className="absolute inset-0">
            <Image
              src={page.imageUrl}
              alt={`Página ${page.pageNumber}`}
              fill
              className="object-contain"
              priority
            />
          </div>
        )}

        {/* Contenido de texto */}
        <div className="absolute inset-0 flex items-end justify-center p-8">
          {page.content && (
            <div className="max-w-3xl w-full bg-white/95 backdrop-blur rounded-2xl p-6 shadow-2xl">
              <p className="text-lg sm:text-xl text-gray-800 leading-relaxed text-center whitespace-pre-line">
                {page.content}
              </p>
            </div>
          )}
        </div>

        {/* Botones de navegación */}
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 transition-all ${
            currentPage === 0 ? 'opacity-30 cursor-not-allowed' : ''
          }`}
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>

        <button
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
          className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 transition-all ${
            currentPage === totalPages - 1 ? 'opacity-30 cursor-not-allowed' : ''
          }`}
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </main>

      {/* Footer con miniaturas */}
      <footer className="bg-gray-800/80 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center justify-center gap-2 overflow-x-auto">
          {pages.map((p, index) => (
            <button
              key={p.id}
              onClick={() => goToPage(index)}
              className={`relative w-12 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                index === currentPage
                  ? 'border-primary ring-2 ring-primary/50'
                  : 'border-transparent hover:border-gray-500'
              }`}
            >
              {p.imageUrl ? (
                <Image
                  src={p.imageUrl}
                  alt={`Miniatura ${index + 1}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <span className="text-xs text-gray-400">{index + 1}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
