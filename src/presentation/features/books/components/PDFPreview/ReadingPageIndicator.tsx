/**
 * UBICACIÓN: src/presentation/features/books/components/PDFPreview/ReadingPageIndicator.tsx
 * ✅ Indicador visual de página actual de lectura (para desktop con libro abierto)
 */

'use client';

import React from 'react';
import { BookOpen, Volume2 } from 'lucide-react';

interface ReadingPageIndicatorProps {
  /** Si está leyendo */
  isReading: boolean;
  /** Página actual de lectura (índice 0-based) */
  currentReadingPage: number;
  /** Página izquierda visible (índice 0-based) */
  leftPageIndex: number;
  /** Página derecha visible (índice 0-based) */
  rightPageIndex: number;
  /** Si está en modo móvil (una sola página) */
  isMobile: boolean;
  /** Total de páginas */
  totalPages: number;
}

export function ReadingPageIndicator({
  isReading,
  currentReadingPage,
  leftPageIndex,
  rightPageIndex,
  isMobile,
  totalPages,
}: ReadingPageIndicatorProps) {
  if (!isReading) return null;

  // Determinar si la página de lectura es la izquierda o derecha
  const isReadingLeftPage = currentReadingPage === leftPageIndex;
  const isReadingRightPage = currentReadingPage === rightPageIndex;
  const isCurrentPageVisible = isReadingLeftPage || isReadingRightPage || isMobile;

  if (!isCurrentPageVisible) {
    return (
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-amber-500/90 backdrop-blur-sm text-slate-900 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium animate-pulse">
          <BookOpen className="w-4 h-4" />
          <span>
            Leyendo página {currentReadingPage + 1}...
          </span>
        </div>
      </div>
    );
  }

  // Indicador flotante sobre la página que se está leyendo
  if (isMobile) {
    return (
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-amber-500 text-slate-900 px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 text-xs font-medium">
          <Volume2 className="w-3 h-3 animate-pulse" />
          <span>Leyendo</span>
        </div>
      </div>
    );
  }

  // Desktop: mostrar indicador en la página correcta
  return (
    <>
      {/* Indicador en página izquierda */}
      {isReadingLeftPage && (
        <div
          className="absolute z-40 pointer-events-none"
          style={{
            top: '10px',
            left: 'calc(25% - 40px)', // Centro de la página izquierda
          }}
        >
          <div className="bg-amber-500 text-slate-900 px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 text-xs font-medium animate-bounce">
            <Volume2 className="w-3 h-3" />
            <span>Leyendo</span>
          </div>
        </div>
      )}

      {/* Indicador en página derecha */}
      {isReadingRightPage && (
        <div
          className="absolute z-40 pointer-events-none"
          style={{
            top: '10px',
            left: 'calc(75% - 40px)', // Centro de la página derecha
          }}
        >
          <div className="bg-amber-500 text-slate-900 px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 text-xs font-medium animate-bounce">
            <Volume2 className="w-3 h-3" />
            <span>Leyendo</span>
          </div>
        </div>
      )}
    </>
  );
}
