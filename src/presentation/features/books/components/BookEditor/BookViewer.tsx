'use client'

import React, { useState, useEffect, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import type { page, Page } from '@/src/typings/types-page-book/index';
import { PageRenderer } from "@/src/presentation/features/layouts/components/PageRenderer";
import type { LayoutType, backgroundstype } from '@/src/typings/types-page-book/index';

interface PageRendererIndexProps {
  page: page;
  pageNumber: number;
  isActive?: boolean;
  isEvenPage?: boolean; // ✅ Para aplicar degradado según posición
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

const PageRendererIndex: React.FC<PageRendererIndexProps> = ({ 
  page, 
  pageNumber, 
  isActive,
  isEvenPage = false 
}) => {
  const Pagina = convertPage(page);
  const isCover = page.layout === 'CoverLayout';

  return (
    <div 
      className="w-full h-full relative overflow-hidden" 
      style={{ 
        position: 'relative',
        margin: 0,
        padding: 0
      }}
    >
      {/* ✅ Degradado blanco SOLO si NO es portada */}
      {!isCover && (
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: isEvenPage 
              ? 'linear-gradient(to right, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.3))' 
              : 'linear-gradient(to left, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.3))'
          }}
        />
      )}

      {/* Contenido de la página - SIN padding en portada */}
      <div 
        className="relative z-10 w-full h-full" 
        style={{ 
          position: 'relative', 
          width: '100%', 
          height: '100%',
          margin: 0,
          padding: 0
        }}
      >
        <PageRenderer page={Pagina} isActive={isActive} />
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
      // ✅ Determinar si es página par (derecha) o impar (izquierda)
      const isEvenPage = idx % 2 === 0;
      
      return (
        <div className="page w-full h-full" key={page.id || idx} style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="page-inner w-full h-full box-border" style={{ position: 'relative', width: '100%', height: '100%' }}>
            <PageRendererIndex
              page={page}
              pageNumber={idx + 1}
              isActive={isActive}
              isEvenPage={isEvenPage}
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

        {/* ✅ Indicador de página actual - ARRIBA de los puntos */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0 z-20">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-800">
              Página {activePage + 1} / {pages.length}
              {activePage === 0 && ' 📖'}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap justify-center max-w-2xl">
            {pages.map((_, index) => {
              const isActive = activePage === index;
              const isCover = index === 0;
              
              return (
                <button
                  key={index}
                  onClick={() => onPageClick(index)}
                  disabled={isFlipping}
                  className={`
                    h-2.5 rounded-full transition-all
                    ${isActive
                      ? 'bg-indigo-600 w-8'
                      : 'bg-gray-300 hover:bg-gray-400 w-2.5'
                    }
                    ${isCover ? 'ring-2 ring-amber-400' : ''}
                  `}
                  title={`Ir a página ${index + 1}${isCover ? ' (Portada)' : ''}`}
                />
              );
            })}
          </div>
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