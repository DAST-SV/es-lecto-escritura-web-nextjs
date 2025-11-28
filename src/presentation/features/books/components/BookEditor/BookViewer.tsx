/**
 * UBICACIÓN: src/presentation/features/books/components/BookEditor/BookViewer.tsx
 * ✅ SIMPLIFICADO: Usa porcentajes del viewport para cálculo confiable
 */
'use client'

import React, { useState, useEffect, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { PageRenderer } from "@/src/presentation/features/layouts/components/PageRenderer";
import { Page } from '@/src/core/domain/types';
import '@/src/presentation/features/layouts/styles/book-shared.css';

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
  const [bookDimensions, setBookDimensions] = useState({ width: 500, height: 650 });
  const [activePage, setActivePage] = useState(currentPage);
  const [isClient, setIsClient] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // ✅ CÁLCULO SIMPLIFICADO: Basado en viewport height
  useEffect(() => {
    if (!isClient) return;

    const calculateDimensions = () => {
      // ✅ Usar dimensiones del viewport directamente
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // ✅ Restar navbar (60px) y márgenes
      const availableHeight = viewportHeight - 60 - 40; // 60px navbar, 40px margen
      const availableWidth = viewportWidth - 384 - 80; // 384px sidebar, 80px margen

      // ✅ Aspect ratio 5:6
      const aspectRatio = 5 / 6;

      // ✅ Calcular por altura (más confiable)
      let bookHeight = availableHeight * 0.90; // 90% de altura disponible
      let bookWidth = bookHeight * aspectRatio;

      // Si el ancho es muy grande, ajustar por ancho
      if (bookWidth > availableWidth * 0.90) {
        bookWidth = availableWidth * 0.90;
        bookHeight = bookWidth / aspectRatio;
      }

      // ✅ Dimensiones mínimas
      bookWidth = Math.max(bookWidth, 400);
      bookHeight = Math.max(bookHeight, 480);

      // ✅ Dimensiones máximas para evitar overflow
      bookWidth = Math.min(bookWidth, 800);
      bookHeight = Math.min(bookHeight, 960);

      const finalWidth = Math.round(bookWidth);
      const finalHeight = Math.round(bookHeight);

      console.log('📖 BookViewer dimensions:', {
        viewport: { w: viewportWidth, h: viewportHeight },
        available: { w: availableWidth, h: availableHeight },
        book: { w: finalWidth, h: finalHeight }
      });

      setBookDimensions({
        width: finalWidth,
        height: finalHeight
      });
    };

    // ✅ Calcular múltiples veces para asegurar
    calculateDimensions();
    const timers = [100, 300, 500, 1000].map(delay => 
      setTimeout(calculateDimensions, delay)
    );
    
    window.addEventListener('resize', calculateDimensions);
    
    return () => {
      timers.forEach(clearTimeout);
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
    maxShadowOpacity: 0.5,
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
      className="w-full h-full relative overflow-hidden"
    >
      {/* Fondo con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50" />

      {/* ✅ Libro centrado */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="relative"
          style={{
            width: `${bookDimensions.width}px`,
            height: `${bookDimensions.height}px`,
          }}
        >
          <div className="drop-shadow-2xl">
            <HTMLFlipBook {...flipBookProps} ref={bookRef} key={`viewer-${bookKey}`} />
          </div>
        </div>
      </div>

      {/* ✅ Info de dimensiones en esquina */}
      <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded font-mono backdrop-blur-sm">
        📖 {bookDimensions.width} × {bookDimensions.height}
      </div>
    </div>
  );
}