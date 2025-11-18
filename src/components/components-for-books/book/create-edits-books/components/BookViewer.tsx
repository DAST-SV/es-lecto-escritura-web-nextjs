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

// Conversor de `page` a `Page`
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

export const BookViewer: React.FC<BookViewerProps> = ({
  pages,
  currentPage,
  isFlipping,
  bookKey,
  bookRef,
  onFlip,
  onPageClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [bookDimensions, setBookDimensions] = useState({ width: 300, height: 375 });
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [activePage, setActivePage] = useState(currentPage);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const checkDevice = () => {
      const isMobile = window.innerWidth < 640;
      
      if (isMobile !== isMobileDevice) {
        setIsMobileDevice(isMobile);
      }

      if (!isMobile && containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const containerWidth = containerRef.current.clientWidth;

        if (containerHeight <= 0 || containerWidth <= 0) {
          return;
        }

        const reservedHeight = 160;
        const availableHeight = containerHeight - reservedHeight;
        const availableWidth = containerWidth - 60;

        const aspectRatio = 5 / 6;

        let bookWidth = 300;
        let bookHeight = 375;

        if (availableHeight > 0 && availableWidth > 0) {
          bookHeight = Math.min(availableHeight, 500);
          bookWidth = bookHeight * aspectRatio;

          if (bookWidth > availableWidth / 2) {
            bookWidth = availableWidth / 2;
            bookHeight = bookWidth / aspectRatio;
          }
        }

        setBookDimensions({
          width: Math.max(Math.round(bookWidth), 250),
          height: Math.max(Math.round(bookHeight), 300)
        });
      }
    };

    checkDevice();
    const timer1 = setTimeout(checkDevice, 100);
    const timer2 = setTimeout(checkDevice, 300);
    
    window.addEventListener('resize', checkDevice);
    
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        checkDevice();
      });
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', checkDevice);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [isMobileDevice, isClient]);

  // 🔥 FIX: Sincronizar activePage con currentPage desde las props
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

  // 🔥 FIX: Función mejorada para determinar si una página está activa
  const isPageActive = (pageIndex: number): boolean => {
    if (isMobileDevice) {
      // En móvil, solo la página actual está activa
      return pageIndex === activePage;
    } else {
      // En desktop: el libro muestra DOS páginas a la vez
      // La lógica correcta es:
      // - Si activePage = 0 (portada), mostrar SOLO página 0
      // - Si activePage = 1, mostrar páginas 0 y 1
      // - Si activePage = 2, mostrar páginas 2 y 3
      // - Si activePage = 3, mostrar páginas 2 y 3
      // etc.
      
      // Calcular el "spread" (par de páginas visible)
      const spreadStart = Math.floor(activePage / 2) * 2;
      const spreadEnd = spreadStart + 1;
      
      return pageIndex === spreadStart || pageIndex === spreadEnd;
    }
  };

  const desktopFlipBookProps: React.ComponentProps<typeof HTMLFlipBook> = {
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
      console.log('🔄 onFlip triggered, new page:', ev.data); // Debug
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
      const active = isPageActive(idx);
      console.log(`📄 Page ${idx + 1}: isActive=${active}, activePage=${activePage}`); // Debug
      
      return (
        <div className="page w-full h-full" key={page.id || idx} style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="page-inner w-full h-full box-border" style={{ position: 'relative', width: '100%', height: '100%' }}>
            <PageRendererIndex
              page={page}
              pageNumber={idx + 1}
              isActive={active}
            />
          </div>
        </div>
      );
    }),
  };

  const mobileFlipBookProps: React.ComponentProps<typeof HTMLFlipBook> = {
    width: Math.min((typeof window !== 'undefined' ? window.innerWidth : 400) * 0.85, 300),
    height: Math.min((typeof window !== 'undefined' ? window.innerWidth : 400) * 0.85, 300) * 1.3,
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
    minWidth: 100,
    maxWidth: 400,
    minHeight: 100,
    maxHeight: 600,
    usePortrait: true,
    startZIndex: 0,
    autoSize: false,
    mobileScrollSupport: true,
    clickEventForward: true,
    useMouseEvents: true,
    swipeDistance: 15,
    showPageCorners: true,
    disableFlipByClick: false,
    style: {},
    children: pages.map((page, idx) => (
      <div className="page w-full h-full" key={page.id || idx} style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="page-inner w-full h-full box-border" style={{ position: 'relative', width: '100%', height: '100%' }}>
          <PageRendererIndex
            page={page}
            pageNumber={idx + 1}
            isActive={isPageActive(idx)}
          />
        </div>
      </div>
    )),
  };

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      {/* Fondo infantil animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-200 via-purple-100 to-pink-200">
        <div className="absolute top-10 left-10 w-20 h-12 bg-white rounded-full opacity-80 animate-float-slow"></div>
        <div className="absolute top-20 right-16 w-16 h-10 bg-white rounded-full opacity-70 animate-float-medium"></div>
        <div className="absolute top-32 left-1/3 w-12 h-8 bg-white rounded-full opacity-60 animate-float-fast"></div>

        <div className="absolute top-16 left-1/4 w-3 h-3 bg-yellow-300 rounded-full animate-twinkle"></div>
        <div className="absolute top-24 right-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-twinkle-slow"></div>
        <div className="absolute top-40 left-3/4 w-4 h-4 bg-yellow-200 rounded-full animate-twinkle-fast"></div>

        <div className="absolute top-8 right-8 w-12 h-12 bg-yellow-300 rounded-full flex items-center justify-center opacity-80">
          <div className="text-orange-600 text-base">☀️</div>
        </div>
      </div>

      {/* Contenedor ABSOLUTO que ocupa todo el espacio */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4"
        style={{ 
          width: '100%', 
          height: '100%',
          overflow: 'hidden'
        }}
      >
        {/* Indicador de página */}
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-lg flex-shrink-0 z-20">
          <span className="text-xs font-medium text-gray-700">
            Página {activePage + 1} de {pages.length}
          </span>
        </div>

        {/* Wrapper del libro con posición y tamaño FIJOS */}
        <div 
          ref={wrapperRef}
          className="flex-shrink-0 z-10"
          style={{
            width: isMobileDevice ? 'auto' : `${bookDimensions.width * 2}px`,
            height: `${bookDimensions.height}px`,
            minWidth: isMobileDevice ? 'auto' : `${bookDimensions.width * 2}px`,
            minHeight: `${bookDimensions.height}px`,
            maxWidth: isMobileDevice ? 'auto' : `${bookDimensions.width * 2}px`,
            maxHeight: `${bookDimensions.height}px`,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible'
          }}
        >
          {/* Libro centrado ABSOLUTAMENTE dentro del wrapper */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div className="drop-shadow-2xl">
              {isMobileDevice ? (
                <HTMLFlipBook {...mobileFlipBookProps} ref={bookRef} key={`mobile-${bookKey}`} />
              ) : (
                <HTMLFlipBook {...desktopFlipBookProps} ref={bookRef} key={`desktop-${bookKey}`} />
              )}
            </div>
          </div>
        </div>

        {/* Indicadores de página para desktop */}
        {!isMobileDevice && (
          <div className="flex gap-1.5 flex-wrap justify-center max-w-xl flex-shrink-0 z-20">
            {pages.map((_, index) => (
              <button
                key={index}
                onClick={() => onPageClick(index)}
                disabled={isFlipping}
                className={`h-2 rounded-full transition-all ${
                  activePage === index
                    ? 'bg-indigo-600 w-6'
                    : 'bg-white/60 hover:bg-white/80 w-2'
                }`}
                title={`Ir a página ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Instrucciones */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 shadow-lg max-w-md text-center flex-shrink-0 z-20">
          <p className="text-xs text-gray-600">
            {isMobileDevice 
              ? '👆 Toca las esquinas o desliza'
              : '🖱️ Clic en las páginas'
            }
          </p>
        </div>
      </div>

      {/* Estilos CSS personalizados */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-1deg); }
        }
        
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes twinkle-slow {
          0%, 100% { opacity: 0.2; transform: scale(0.7); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        
        @keyframes twinkle-fast {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        
        .animate-float-medium {
          animation: float-medium 4s ease-in-out infinite;
        }
        
        .animate-float-fast {
          animation: float-fast 3s ease-in-out infinite;
        }
        
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        
        .animate-twinkle-slow {
          animation: twinkle-slow 3s ease-in-out infinite;
        }
        
        .animate-twinkle-fast {
          animation: twinkle-fast 1.5s ease-in-out infinite;
        }
        
        .storybook-flipbook {
          border-radius: 8px;
          overflow: hidden;
          margin: 0 !important;
          padding: 0 !important;
        }

        @media (min-width: 640px) {
          .storybook-flipbook .page {
            display: inline-block !important;
            position: relative !important;
          }
          
          .flipbook-container {
            overflow: hidden;
          }

          .flipbook-page {
            overflow: hidden;
            padding: 1rem;
            box-sizing: border-box;
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .flipbook-page-content {
            overflow-y: auto;
            overflow-x: hidden;
            height: 100%;
            padding-right: 0.5rem;
          }

          .flipbook-page-content::-webkit-scrollbar {
            width: 4px;
          }

          .flipbook-page-content::-webkit-scrollbar-track {
            background: transparent;
          }

          .flipbook-page-content::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 2px;
          }

          .flipbook-page-content::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.3);
          }
        }
      `}</style>
    </div>
  );
};