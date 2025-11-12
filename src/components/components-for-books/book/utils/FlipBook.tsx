'use client'

import { useRef, useState, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import type { Page } from "@/src/typings/types-page-book/index";
import { PageRenderer } from "./PageRenderer";

interface Props {
  pages: Page[];
  width?: number;
  height?: number;
}

export const FlipBook: React.FC<Props> = ({ pages, width, height }) => {
  const bookRef = useRef<React.ElementRef<typeof HTMLFlipBook> | null>(null);
  const [activePage, setActivePage] = useState(0);
  const [bookDimensions, setBookDimensions] = useState({ width: 600, height: 700 });
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [bookKey, setBookKey] = useState(0);

  // Detectar dispositivo y calcular dimensiones
  useEffect(() => {
    const checkDevice = () => {
      const isMobile = window.innerWidth < 640;
      const screenHeight = window.innerHeight;
      const screenWidth = window.innerWidth;
      
      if (isMobile !== isMobileDevice) {
        setIsMobileDevice(isMobile);
        setBookKey(prev => prev + 1); // Forzar re-render
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

  // Scroll automático al centro cuando se carga el componente
  useEffect(() => {
    const scrollToCenter = () => {
      // Esperar un momento para que el DOM esté completamente renderizado
      setTimeout(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const scrollPosition = (scrollHeight - clientHeight) / 2;
        
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }, 100);
    };

    scrollToCenter();
  }, []);
  
  // Detectar dispositivo y calcular dimensiones
  useEffect(() => {
    const checkDevice = () => {
      const isMobile = window.innerWidth < 640;
      const screenHeight = window.innerHeight;
      const screenWidth = window.innerWidth;
      
      if (isMobile !== isMobileDevice) {
        setIsMobileDevice(isMobile);
        setBookKey(prev => prev + 1); // Forzar re-render
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

  if (pages.length < 2) return null;

  // Configuración para PC (con dimensiones adaptativas)
  const desktopFlipBookProps: React.ComponentProps<typeof HTMLFlipBook> = {
  width: width || bookDimensions.width, // Usar dimensiones calculadas
  height: height || bookDimensions.height, // Usar dimensiones calculadas
  maxShadowOpacity: 0.5,
  drawShadow: true,
  showCover: true,
  flippingTime: 700,
  size: "fixed",
  className: "storybook-flipbook",
  onFlip: (e: unknown) => {
    const ev = e as { data: number }; 
    setActivePage(ev.data);
  },
  onUpdate: (e: unknown) => {
    const ev = e as { data: number };
    console.log("Book updated, page:", ev.data);
  },
  startPage: 0,
  minWidth: 100,
  maxWidth: 800,
  minHeight: 100,
  maxHeight: 800,
  usePortrait: false, // FALSE para PC - esto debería mostrar dos páginas
  startZIndex: 0,
  autoSize: false, // Cambiar a false para control manual
  mobileScrollSupport: false,
  clickEventForward: true,
  useMouseEvents: true,
  swipeDistance: 10,
  showPageCorners: true,
  disableFlipByClick: false,
  style: {}, // puedes dejarlo vacío o poner estilos válidos
  children: pages.map((page, idx) => (
    <div className="page w-full h-full" key={idx}>
      <div className="page-inner w-full h-full box-border">
        <PageRenderer page={page} isActive={activePage === idx || activePage + 1 === idx}/>
      </div>
    </div>
  )),
};


  // Configuración para móvil (responsiva)
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
    },
    onUpdate: (e: unknown) => {
      const ev = e as { data: number };
      console.log("Book updated, page:", ev.data);
    },
    startPage: 0,
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
      <div className="page w-full h-full" key={idx}>
        <div className="page-inner w-full h-full box-border">
          <PageRenderer page={page} isActive={activePage === idx || activePage+1 === idx}/>
        </div>
      </div>
    )),
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Fondo infantil animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-200 via-purple-100 to-pink-200">
        {/* Nubes flotantes */}
        <div className="absolute top-10 left-10 w-20 h-12 bg-white rounded-full opacity-80 animate-float-slow"></div>
        <div className="absolute top-20 right-16 w-16 h-10 bg-white rounded-full opacity-70 animate-float-medium"></div>
        <div className="absolute top-32 left-1/3 w-12 h-8 bg-white rounded-full opacity-60 animate-float-fast"></div>
        <div className="absolute top-8 right-1/3 w-24 h-14 bg-white rounded-full opacity-75 animate-float-slow"></div>
        
        {/* Estrellas brillantes */}
        <div className="absolute top-16 left-1/4 w-3 h-3 bg-yellow-300 rounded-full animate-twinkle"></div>
        <div className="absolute top-24 right-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-twinkle-slow"></div>
        <div className="absolute top-40 left-3/4 w-4 h-4 bg-yellow-200 rounded-full animate-twinkle-fast"></div>
        <div className="absolute top-12 left-2/3 w-2.5 h-2.5 bg-yellow-300 rounded-full animate-twinkle"></div>
        
        {/* Arcoíris sutil */}
        <div className="absolute top-20 left-0 w-full h-2 bg-gradient-to-r from-red-300  via-blue-300 to-purple-300 opacity-30 rounded-full transform -skew-y-2"></div>
        
        {/* Elementos decorativos flotantes */}
        <div className="absolute bottom-20 left-8 w-8 h-8 bg-pink-300 rounded-full opacity-60 animate-bounce-slow"></div>
        <div className="absolute bottom-32 right-12 w-6 h-6 bg-purple-300 rounded-full opacity-70 animate-bounce-medium"></div>
        <div className="absolute bottom-16 left-1/3 w-5 h-5 bg-blue-300 rounded-full opacity-50 animate-bounce-fast"></div>
        
        {/* Sol sonriente */}
        <div className="absolute top-8 right-8 w-16 h-16 bg-yellow-300 rounded-full flex items-center justify-center opacity-80">
          <div className="text-orange-600 text-lg">☀️</div>
        </div>
      </div>

      {/* Contenedor del libro - altura ajustada */}
      <div className={`relative z-10 min-h-screen max-h-screen flex items-center p-4 ${
        isMobileDevice ? 'justify-center' : 'justify-center pr-16'
      } overflow-hidden`}>
        <div className="flex flex-col items-center space-y-4">

          {/* Libro con configuración específica según dispositivo */}
          <div className="drop-shadow-2xl">
            {isMobileDevice ? (
              <HTMLFlipBook {...mobileFlipBookProps} ref={bookRef} key={`mobile-${bookKey}`} />
            ) : (
              <HTMLFlipBook {...desktopFlipBookProps} ref={bookRef} key={`desktop-${bookKey}`} />
            )}
          </div>

          {/* Instrucciones para móviles */}
          {isMobileDevice && (
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg max-w-xs text-center">
              <p className="text-xs text-gray-600">
                👆 Toca las esquinas o desliza para pasar páginas
              </p>
            </div>
          )}
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
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes bounce-medium {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes bounce-fast {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
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
        
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        
        .animate-bounce-medium {
          animation: bounce-medium 3s ease-in-out infinite;
        }
        
        .animate-bounce-fast {
          animation: bounce-fast 2s ease-in-out infinite;
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

export default FlipBook;