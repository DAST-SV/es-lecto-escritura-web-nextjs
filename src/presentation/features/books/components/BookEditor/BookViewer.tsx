'use client'

import React, { useState, useEffect, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import type { page, Page } from '@/src/typings/types-page-book/index';
import { PageRenderer } from "@/src/components/components-for-books/book/utils/PageRenderer";
import type { LayoutType, backgroundstype } from '@/src/typings/types-page-book/index';

interface PageRendererIndexProps {
  page: page;
  pageNumber: number;
  isActive?: boolean;
}

// Conversor de page a Page
function convertPage(oldPage: page): Page {
  return {
    layout: oldPage.layout as LayoutType,
    title: oldPage.title,
    text: oldPage.text,
    image: oldPage.image ?? undefined,
    background: oldPage.background as backgroundstype,
    animation: undefined,
    audio: undefined,
    interactiveGame: undefined,
    items: [],
    border: undefined
  };
}

const PageRendererIndex: React.FC<PageRendererIndexProps> = ({ page, pageNumber, isActive }) => {
  const Pagina = convertPage(page);

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ position: 'relative' }}>
      {page.background && page.background !== "blanco" && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "rgba(255, 255, 255, 0.1)" }}
        />
      )}

      <div className="relative z-10 w-full h-full" style={{ position: 'relative', width: '100%', height: '100%' }}>
        <PageRenderer page={Pagina} isActive={isActive} />
      </div>

      <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-bold bg-black bg-opacity-70 text-white z-50">
        {pageNumber}
      </div>
    </div>
  );
};

interface BookViewerProps {
  pages: page[];
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

      const reservedHeight = 120;
      const availableHeight = containerHeight - reservedHeight;
      const availableWidth = containerWidth - 100;

      const aspectRatio = 5 / 6;

      let bookWidth = 400;
      let bookHeight = 520;

      if (availableHeight > 0 && availableWidth > 0) {
        bookHeight = Math.min(availableHeight, 600);
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
    className: "storybook-flipbook",
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
        <div className="page w-full h-full" key={page.id || idx} style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="page-inner w-full h-full box-border" style={{ position: 'relative', width: '100%', height: '100%' }}>
            <PageRendererIndex
              page={page}
              pageNumber={idx + 1}
              isActive={isActive}
            />
          </div>
        </div>
      );
    }),
  };

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50" />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4">
        <div 
          className="flex-shrink-0 z-10"
          style={{
            width: `${bookDimensions.width}px`,
            height: `${bookDimensions.height}px`,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div className="drop-shadow-2xl">
            <HTMLFlipBook {...flipBookProps} ref={bookRef} key={`single-${bookKey}`} />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap justify-center max-w-2xl flex-shrink-0 z-20">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => onPageClick(index)}
              disabled={isFlipping}
              className={`h-2.5 rounded-full transition-all ${
                activePage === index
                  ? 'bg-indigo-600 w-8'
                  : 'bg-gray-300 hover:bg-gray-400 w-2.5'
              }`}
              title={`Ir a página ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .storybook-flipbook {
          border-radius: 12px;
          overflow: hidden;
          margin: 0 !important;
          padding: 0 !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .storybook-flipbook .page {
          display: inline-block !important;
          position: relative !important;
          background: white;
        }
      `}</style>
    </div>
  );
}