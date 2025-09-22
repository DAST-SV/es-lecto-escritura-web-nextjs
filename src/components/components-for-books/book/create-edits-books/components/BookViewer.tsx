import React, { useState, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import type { page, Page } from '@/src/typings/types-page-book/index';
import { PageRenderer } from "@/src/components/components-for-books/book/PageRenderer";
import type { LayoutType, backgroundstype, HtmlFontFamiliestype, textColorstype } from '@/src/typings/types-page-book/index';

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
        font: oldPage.font as HtmlFontFamiliestype,
        textColor: oldPage.textColor || undefined,
        animation: undefined,
        audio: undefined,
        interactiveGame: undefined,
        items: [],
        border: undefined
    };
}

// ============= COMPONENTE RENDERIZADOR DE PÁGINA =============
const PageRendererIndex: React.FC<PageRendererIndexProps> = ({ page, pageNumber, isActive }) => {
    const Pagina = convertPage(page);
    return (
        <div className="w-full h-full relative overflow-hidden">
            {/* Overlay para mejorar legibilidad si hay imagen de fondo */}
            {page.background && page.background !== "blanco" && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "rgba(255, 255, 255, 0.1)" }}
                />
            )}

            {/* Contenido del layout */}
            <div className="relative z-10 h-full">
                <PageRenderer page={Pagina} isActive={isActive} />
            </div>

            {/* Número de página */}
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
  const [bookDimensions, setBookDimensions] = useState({ width: 600, height: 700 });
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [activePage, setActivePage] = useState(currentPage);

  // Detectar dispositivo y calcular dimensiones (similar al ejemplo)
  useEffect(() => {
    const checkDevice = () => {
      const isMobile = window.innerWidth < 640; // Mismo breakpoint que el ejemplo
      const screenHeight = window.innerHeight;
      const screenWidth = window.innerWidth;
      
      if (isMobile !== isMobileDevice) {
        setIsMobileDevice(isMobile);
      }

      // Calcular dimensiones para PC que quepan en pantalla
      if (!isMobile) {
        // Dejar espacio para padding, indicador y margen (aproximadamente 200px)
        const availableHeight = screenHeight - 200;
        const availableWidth = screenWidth - 100;
        
        // Mantener ratio deseado pero ajustar si es necesario
        let bookWidth = 600;
        let bookHeight = 700;
        
        // Si no cabe en altura, ajustar manteniendo proporciones
        if (bookHeight > availableHeight) {
          bookHeight = availableHeight;
          bookWidth = (bookHeight * 600) / 700; // Mantener ratio
        }
        
        // Si no cabe en ancho, ajustar
        if (bookWidth > availableWidth) {
          bookWidth = availableWidth;
          bookHeight = (bookWidth * 700) / 600; // Mantener ratio
        }
        
        setBookDimensions({
          width: Math.round(bookWidth),
          height: Math.round(bookHeight)
        });
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [isMobileDevice]);

  // Sincronizar activePage con currentPage
  useEffect(() => {
    setActivePage(currentPage);
  }, [currentPage]);

  // Configuración para PC (basada en el ejemplo)
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
      setActivePage(ev.data);
      onFlip(e);
    },
    startPage: Math.min(currentPage),
    minWidth: 100,
    maxWidth: 800,
    minHeight: 100,
    maxHeight: 800,
    usePortrait: false, // FALSE para PC - dos páginas
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
      <div className="page w-full h-full" key={page.id || idx}>
        <div className="page-inner w-full h-full box-border">
          <PageRendererIndex 
            page={page} 
            pageNumber={idx + 1} 
            isActive={activePage === idx || activePage + 1 === idx}
          />
        </div>
      </div>
    )),
  };

  // Configuración para móvil (basada en el ejemplo)
  const mobileFlipBookProps: React.ComponentProps<typeof HTMLFlipBook> = {
    width: Math.min(window.innerWidth * 0.85, 300),
    height: Math.min(window.innerWidth * 0.85, 300) * 1.3,
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
    startPage: Math.min(currentPage),
    minWidth: 100,
    maxWidth: 400,
    minHeight: 100,
    maxHeight: 600,
    usePortrait: true, // TRUE para móvil - una página
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
      <div className="page w-full h-full" key={page.id || idx}>
        <div className="page-inner w-full h-full box-border">
          <PageRendererIndex 
            page={page} 
            pageNumber={idx + 1} 
            isActive={activePage === idx}
          />
        </div>
      </div>
    )),
  };

  if (pages.length < 1) return null;

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Fondo infantil animado (similar al ejemplo) */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-200 via-purple-100 to-pink-200">
        {/* Nubes flotantes */}
        <div className="absolute top-10 left-10 w-20 h-12 bg-white rounded-full opacity-80 animate-float-slow"></div>
        <div className="absolute top-20 right-16 w-16 h-10 bg-white rounded-full opacity-70 animate-float-medium"></div>
        <div className="absolute top-32 left-1/3 w-12 h-8 bg-white rounded-full opacity-60 animate-float-fast"></div>
        
        {/* Estrellas brillantes */}
        <div className="absolute top-16 left-1/4 w-3 h-3 bg-yellow-300 rounded-full animate-twinkle"></div>
        <div className="absolute top-24 right-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-twinkle-slow"></div>
        <div className="absolute top-40 left-3/4 w-4 h-4 bg-yellow-200 rounded-full animate-twinkle-fast"></div>
        
        {/* Sol sonriente */}
        <div className="absolute top-8 right-8 w-16 h-16 bg-yellow-300 rounded-full flex items-center justify-center opacity-80">
          <div className="text-orange-600 text-lg">☀️</div>
        </div>
      </div>

      {/* Contenedor del libro */}
      <div className={`relative z-10 min-h-screen max-h-screen flex items-center p-4 ${
        isMobileDevice ? 'justify-center' : 'justify-center pr-16'
      } overflow-hidden`}>
        <div className="flex flex-col items-center space-y-4">
          
          {/* Indicador de página */}
          <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
            <span className="text-sm font-medium text-gray-700">
              Página {activePage + 1} de {pages.length}
            </span>
          </div>

          {/* Libro con configuración específica según dispositivo */}
          <div className="drop-shadow-2xl">
            {isMobileDevice ? (
              <HTMLFlipBook {...mobileFlipBookProps} ref={bookRef} key={`mobile-${bookKey}`} />
            ) : (
              <HTMLFlipBook {...desktopFlipBookProps} ref={bookRef} key={`desktop-${bookKey}`} />
            )}
          </div>

          {/* Indicadores de página para desktop */}
          {!isMobileDevice && (
            <div className="flex gap-2 mt-4">
              {pages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => onPageClick(index)}
                  disabled={isFlipping}
                  className={`h-3 rounded-full transition-all ${
                    activePage === index
                      ? "bg-indigo-600 w-8"
                      : "bg-white/60 hover:bg-white/80 w-3"
                  }`}
                  title={`Ir a página ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Instrucciones para móviles */}
          {isMobileDevice && (
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg max-w-xs text-center">
              <p className="text-xs text-gray-600">
                👆 Toca las esquinas o desliza para pasar páginas
              </p>
            </div>
          )}

          {/* Instrucciones para desktop */}
          {!isMobileDevice && (
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg max-w-md text-center">
              <p className="text-sm font-semibold mb-2 text-gray-700">💡 Instrucciones:</p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• Haz clic en las páginas o usa los indicadores para navegar</p>
                <p>• Edita cada página individualmente desde el panel lateral</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Estilos CSS personalizados (copiados del ejemplo) */}
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
        }

        /* Estilos específicos para PC - forzar dos páginas */
        @media (min-width: 640px) {
          .storybook-flipbook .page {
            display: inline-block !important;
            position: relative !important;
          }
          
          .storybook-flipbook[data-portrait="false"] .page:nth-child(even) {
            margin-left: 0 !important;
          }
          
          .storybook-flipbook[data-portrait="false"] .page:nth-child(odd) {
            margin-right: 0 !important;
          }
          
          /* Forzar el contenedor a mostrar páginas lado a lado */
          .storybook-flipbook[data-portrait="false"] {
            display: flex !important;
            align-items: center !important;
          }
          
          .storybook-flipbook[data-portrait="false"] .page {
            width: 50% !important;
            height: 100% !important;
            flex-shrink: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};