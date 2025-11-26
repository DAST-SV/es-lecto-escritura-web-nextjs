/**
 * UBICACIÓN: src/presentation/features/books/components/BookEditor/BookViewer.tsx
 * ✅ CORREGIDO: Pasar page completo en vez de props individuales
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
  onPageClick
}: BookViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bookDimensions, setBookDimensions] = useState({ width: 400, height: 520 });
  const [activePage, setActivePage] = useState(currentPage);
  const [isClient, setIsClient] = useState(false);

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

      const reservedHeight = 80;
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
    const timer1 = setTimeout(calculateDimensions, 100);
    const timer2 = setTimeout(calculateDimensions, 300);
    
    window.addEventListener('resize', calculateDimensions);
    
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(calculateDimensions);
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', calculateDimensions);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [isClient]);

  useEffect(() => {
    setActivePage(currentPage);
  }, [currentPage]);

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center">
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
        <div className="page w-full h-full" key={idx}>
          <div className="page-inner w-full h-full">
            {/* ✅ CORREGIDO: Pasar page completo */}
            <PageRenderer
              page={page}
              isActive={isActive}
            />
          </div>
        </div>
      );
    }),
  };

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50" />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div 
          className="flex-shrink-0 z-10"
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
    </div>
  );
}