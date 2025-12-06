/**
 * UBICACIÓN: src/presentation/features/books/components/BookEditor/BookViewer.tsx
 * ✅ ARREGLADO: Usa getBoundingClientRect del contenedor REAL para calcular dimensiones
 */
'use client'

import React, { useState, useEffect, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { PageRenderer } from "@/src/presentation/features/layouts/components/PageRenderer";
import { Page } from '@/src/core/domain/types';
import '@/src/presentation/features/layouts/styles/book-shared.css';
import '@/src/presentation/features/layouts/styles/book-3d-realistic.css';

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
  const [bookDimensions, setBookDimensions] = useState({ width: 600, height: 720 }); // Valores más grandes iniciales
  const [activePage, setActivePage] = useState(currentPage);
  const [isClient, setIsClient] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // ✅ CÁLCULO DE DIMENSIONES: Usar getBoundingClientRect del contenedor real
  useEffect(() => {
    if (!isClient || !containerRef.current) return;

    const calculateDimensions = () => {
      if (!containerRef.current) return;

      // Obtener dimensiones REALES del contenedor
      const rect = containerRef.current.getBoundingClientRect();
      const containerWidth = rect.width;
      const containerHeight = rect.height;

      console.log('📦 Container real:', { w: containerWidth, h: containerHeight });

      // Si el contenedor no tiene dimensiones aún, esperar
      if (containerWidth === 0 || containerHeight === 0) {
        console.log('⏳ Contenedor sin dimensiones, esperando...');
        return;
      }

      // ✅ Aspect ratio 5:6 (ancho:alto)
      const aspectRatio = 5 / 6;

      // Márgenes de seguridad - AUMENTADOS para mejor visualización
      const widthMargin = 80; // Aumentado de 40 a 80
      const heightMargin = 80; // Aumentado de 40 a 80

      const availableWidth = containerWidth - widthMargin;
      const availableHeight = containerHeight - heightMargin;

      // ✅ IMPORTANTE: HTMLFlipBook usa el DOBLE del ancho (2 páginas lado a lado)
      // Por lo tanto, necesitamos dividir el ancho disponible entre 2
      const singlePageWidth = availableWidth / 2;

      // Calcular dimensiones respetando aspect ratio
      let bookWidth = singlePageWidth;
      let bookHeight = bookWidth / aspectRatio;

      // Si la altura excede, ajustar por altura
      if (bookHeight > availableHeight) {
        bookHeight = availableHeight;
        bookWidth = bookHeight * aspectRatio;
      }

      // Dimensiones finales
      const finalWidth = Math.round(Math.max(bookWidth, 400));
      const finalHeight = Math.round(Math.max(bookHeight, 480));

      console.log('📖 BookViewer dimensions:', {
        container: { w: containerWidth, h: containerHeight },
        available: { w: availableWidth, h: availableHeight },
        singlePageWidth: singlePageWidth,
        totalBookWidth: finalWidth * 2, // El libro completo (2 páginas)
        book: { w: finalWidth, h: finalHeight }
      });

      setBookDimensions({
        width: finalWidth,
        height: finalHeight
      });
    };

    // Calcular inmediatamente
    calculateDimensions();

    // Recalcular múltiples veces con tiempos MÁS LARGOS (asegurar que el layout esté listo)
    const timers = [100, 250, 500, 1000, 1500].map(delay => 
      setTimeout(calculateDimensions, delay)
    );

    // ResizeObserver para adaptación automática
    const resizeObserver = new ResizeObserver(() => {
      calculateDimensions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    // Listener de resize de ventana
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
      setTimeout(() => {
        if (bookRef.current?.pageFlip) {
          try {
            bookRef.current.pageFlip().turnToPage(currentPage);
          } catch (e) {
            console.warn('Error al cambiar página:', e);
          }
        }
      }, 50);
    }
  }, [bookKey, isReady]);

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
    maxShadowOpacity: 0.8, // Aumentado de 0.5 a 0.8 para sombras más visibles
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
    children: pages.map((page, idx) => {
      const isActive = idx === activePage;
      
      return (
        <div className="page w-full h-full" key={`page-${idx}-${bookKey}`}>
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
      className="w-full h-full relative overflow-hidden book-viewer-container"
      style={{ height: '100%', minHeight: '100%' }}
    >
      {/* Fondo con gradiente mejorado */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {/* Patrón de textura sutil */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* ✅ Libro centrado con mejor presentación */}
      <div className="absolute inset-0 flex items-center justify-center">
        <HTMLFlipBook {...flipBookProps} ref={bookRef} key={`viewer-${bookKey}`} />
      </div>

      {/* ✅ Info de dimensiones - Estilo mejorado */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-1.5 rounded-lg font-mono backdrop-blur-md border border-white/10 shadow-lg">
        📖 {bookDimensions.width} × {bookDimensions.height} (página) | {bookDimensions.width * 2} × {bookDimensions.height} (libro completo)
      </div>
    </div>
  );
}