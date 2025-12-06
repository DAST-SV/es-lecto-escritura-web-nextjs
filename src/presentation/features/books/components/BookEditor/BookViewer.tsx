/**
 * UBICACIÓN: src/presentation/features/books/components/BookEditor/BookViewer.tsx
 * ✅ VERSIÓN CON BORDES PUNTIAGUDOS
 */
'use client'

import React, { useState, useEffect, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { PageRenderer } from "@/src/presentation/features/layouts/components/PageRenderer";
import { Page } from '@/src/core/domain/types';
import '@/src/presentation/features/layouts/styles/book-shared.css';
import '@/src/presentation/features/layouts/styles/book-3d-realistic.css';
import '@/src/presentation/features/layouts/styles/book-position-fix.css';

interface BookViewerProps {
  pages: Page[];
  currentPage: number;
  isFlipping: boolean;
  bookKey: number;
  bookRef: React.RefObject<any>; 
  onFlip: (e: unknown) => void;
  onPageClick: (pageIndex: number) => void;
}

export function BookViewer({
  pages,
  currentPage,
  isFlipping,
  bookKey,
  bookRef,
  onFlip,
}: BookViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bookDimensions, setBookDimensions] = useState({ width: 400, height: 480 });
  const [activePage, setActivePage] = useState(currentPage);
  const [isClient, setIsClient] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Esperar un poco más para asegurar que el contenedor tenga dimensiones
    const timer = setTimeout(() => setIsReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isClient || !containerRef.current) return;

    const calculateDimensions = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const containerWidth = rect.width;
      const containerHeight = rect.height;

      console.log('📦 Container:', { w: containerWidth, h: containerHeight });

      if (containerWidth === 0 || containerHeight === 0) {
        console.log('⏳ Esperando dimensiones...');
        return;
      }

      const PAGE_ASPECT_RATIO = 5 / 6;
      const MARGIN = 100;

      const availableWidth = containerWidth - MARGIN;
      const availableHeight = containerHeight - MARGIN;

      // Calcular desde la altura
      let pageHeight = availableHeight * 0.85;
      let pageWidth = pageHeight * PAGE_ASPECT_RATIO;

      // Verificar si caben 2 páginas horizontalmente
      const totalWidth = pageWidth * 2;
      
      if (totalWidth > availableWidth) {
        pageWidth = (availableWidth * 0.85) / 2;
        pageHeight = pageWidth / PAGE_ASPECT_RATIO;
      }

      const finalWidth = Math.round(Math.max(350, Math.min(700, pageWidth)));
      const finalHeight = Math.round(Math.max(420, Math.min(840, pageHeight)));

      console.log('📖 Libro:', {
        page: { w: finalWidth, h: finalHeight },
        total: { w: finalWidth * 2, h: finalHeight },
        uso: {
          ancho: `${((finalWidth * 2 / containerWidth) * 100).toFixed(1)}%`,
          alto: `${((finalHeight / containerHeight) * 100).toFixed(1)}%`
        }
      });

      setBookDimensions({ width: finalWidth, height: finalHeight });
    };

    calculateDimensions();
    const timers = [100, 300, 500].map(delay => setTimeout(calculateDimensions, delay));

    const resizeObserver = new ResizeObserver(calculateDimensions);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    
    window.addEventListener('resize', calculateDimensions);
    
    return () => {
      timers.forEach(clearTimeout);
      resizeObserver.disconnect();
      window.removeEventListener('resize', calculateDimensions);
    };
  }, [isClient, bookKey]);

  useEffect(() => {
    setActivePage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (bookRef.current && isReady) {
      // Forzar actualización del libro para posicionar correctamente
      setTimeout(() => {
        try {
          const pageFlip = bookRef.current?.pageFlip();
          if (pageFlip) {
            pageFlip.turnToPage(currentPage);
            // Forzar re-render
            pageFlip.update();
          }
        } catch (e) {
          console.warn('Error al cambiar página:', e);
        }
      }, 100);
    }
  }, [bookKey, isReady, currentPage]);

  if (!isClient || !isReady) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-6 py-8 shadow-lg max-w-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Cargando libro...</p>
        </div>
      </div>
    );
  }

  const flipBookProps: React.ComponentProps<typeof HTMLFlipBook> = {
    width: bookDimensions.width,
    height: bookDimensions.height,
    maxShadowOpacity: 0.8,
    drawShadow: true,
    showCover: true,
    flippingTime: 700,
    size: "fixed",
    className: "book-flipbook-container",
    onFlip: (e: unknown) => {
      const ev = e as { data: number };
      setActivePage(ev.data);
      onFlip(e);
    },
    startPage: Math.min(currentPage, pages.length - 1),
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
    children: pages.map((page, idx) => (
      <div 
        className="page w-full h-full" 
        key={`page-${idx}-${bookKey}`}
      >
        <div className="page-inner w-full h-full">
          <PageRenderer page={page} isActive={idx === activePage} />
        </div>
      </div>
    )),
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative"
    >
      {/* Patrón de fondo sutil */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Libro centrado */}
      <div className="relative z-10">
        <HTMLFlipBook {...flipBookProps} ref={bookRef} key={`viewer-${bookKey}`} />
      </div>

      {/* Info de dimensiones */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-1.5 rounded-lg font-mono backdrop-blur-md border border-white/10 shadow-lg z-20">
        📖 {bookDimensions.width} × {bookDimensions.height} px (página) | Libro: {bookDimensions.width * 2} × {bookDimensions.height} px
      </div>
    </div>
  );
}