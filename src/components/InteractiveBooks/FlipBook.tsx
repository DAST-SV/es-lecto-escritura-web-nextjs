'use client';
import React, { forwardRef, ReactNode, CSSProperties, useState, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';

// Tipos para las configuraciones del libro
export interface FlipBookConfig {
  width?: number;
  height?: number;
  size?: "fixed" | "stretch";
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  showCover?: boolean;
  drawShadow?: boolean;
  flippingTime?: number;
  usePortrait?: boolean;
  startZIndex?: number;
  startPage?: number;
  clickEventForward?: boolean;
  useMouseEvents?: boolean;
  swipeDistance?: number;
  showPageCorners?: boolean;
  disableFlipByClick?: boolean;
  autoSize?: boolean;
  maxShadowOpacity?: number;
  mobileScrollSupport?: boolean;
  forceMobileMode?: boolean; // Nueva opción para forzar modo móvil
}

// Configuraciones predefinidas para diferentes casos de uso
export const flipBookPresets = {
  // Para libros infantiles - SIN modificar dimensiones originales
  children: {
    showCover: false,
    drawShadow: true,
    flippingTime: 800,
    showPageCorners: false,
    maxShadowOpacity: 0.5,
  } as FlipBookConfig,
  
  // Para documentos/PDFs
  document: {
    size: "fixed" as const,
    flippingTime: 500,
    showPageCorners: false,
    drawShadow: false,
    usePortrait: true,
  } as FlipBookConfig,
  
  // Para móviles - ahora sin animaciones
  mobile: {
    flippingTime: 0, // Sin animación en móvil
    mobileScrollSupport: true,
    swipeDistance: 30,
    showPageCorners: false,
    drawShadow: false,
    forceMobileMode: true,
  } as FlipBookConfig,
  
  // Para pantallas grandes
  desktop: {
    flippingTime: 800,
    maxShadowOpacity: 0.8,
    drawShadow: true,
  } as FlipBookConfig,
};

interface FlipBookProps {
  children: ReactNode[];
  
  // Dimensiones obligatorias - sin valores por defecto intrusivos
  width: number;
  height: number;
  
  // Configuración opcional
  config?: FlipBookConfig;
  preset?: keyof typeof flipBookPresets;
  
  // Styling
  className?: string;
  style?: CSSProperties;
  
  // Events
  onFlip?: (e: any) => void;
  onChangeOrientation?: (orientation: string) => void;
  onChangeState?: (state: string) => void;
  
  // Responsive siempre activado, pero se puede desactivar si es necesario
  responsive?: boolean;
  
  // Props directas de HTMLFlipBook para máximo control
  size?: "fixed" | "stretch";
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  showCover?: boolean;
  drawShadow?: boolean;
  flippingTime?: number;
  usePortrait?: boolean;
  startZIndex?: number;
  startPage?: number;
  clickEventForward?: boolean;
  useMouseEvents?: boolean;
  swipeDistance?: number;
  showPageCorners?: boolean;
  disableFlipByClick?: boolean;
  autoSize?: boolean;
  maxShadowOpacity?: number;
  mobileScrollSupport?: boolean;
}

// Función para detectar si es móvil
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const FlipBook = forwardRef<any, FlipBookProps>(({
  children,
  width,
  height,
  config = {},
  preset,
  className = '',
  style = {},
  onFlip,
  onChangeOrientation,
  onChangeState,
  responsive = true,
  // Props directas con valores por defecto que no interfieren
  size = "stretch",
  minWidth = 300,
  maxWidth = 1200,
  minHeight = 200,
  maxHeight = 800,
  showCover = false,
  drawShadow = true,
  flippingTime = 800,
  usePortrait = false,
  startZIndex = 0,
  startPage = 0,
  clickEventForward = true,
  useMouseEvents = true,
  swipeDistance = 30,
  showPageCorners = false,
  disableFlipByClick = false,
  autoSize = true,
  maxShadowOpacity = 0.5,
  mobileScrollSupport = true,
}, ref) => {
  
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Sincronizar el estado interno con cambios externos (del hook)
  useEffect(() => {
    if (onFlip) {
      // Si hay un onFlip handler, escuchar cambios externos
      const handleExternalChange = () => {
        // Este efecto se ejecutará cuando cambien las props
      };
      return handleExternalChange;
    }
  }, [onFlip]);
  
  // Detectar si es móvil al montar y en resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(isMobileDevice());
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    window.addEventListener('orientationchange', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
      window.removeEventListener('orientationchange', checkIsMobile);
    };
  }, []);

  // PRIORIDAD: Props directas > config > preset > defaults
  let finalConfig = {
    width,
    height,
    size,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    showCover,
    drawShadow,
    flippingTime,
    usePortrait,
    startZIndex,
    startPage,
    clickEventForward,
    useMouseEvents,
    swipeDistance,
    showPageCorners,
    disableFlipByClick,
    autoSize,
    maxShadowOpacity,
    mobileScrollSupport,
  };

  // Aplicar preset si se especifica
  if (preset) {
    const presetConfig = flipBookPresets[preset];
    finalConfig = { ...finalConfig, ...presetConfig };
  }

  // Aplicar config personalizado
  finalConfig = { ...finalConfig, ...config };

  // Aplicar responsive por defecto
  if (responsive && typeof window !== 'undefined') {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Móviles (hasta 768px) - configuración especial
    if (screenWidth <= 768) {
      finalConfig.width = Math.min(screenWidth * 0.95, finalConfig.width);
      finalConfig.height = Math.min(screenHeight * 0.6, finalConfig.height);
      finalConfig.minWidth = Math.min(screenWidth * 0.9, 280);
      finalConfig.maxWidth = screenWidth * 0.98;
      finalConfig.flippingTime = 0; // Sin animación en móvil
      finalConfig.drawShadow = false; // Sin sombras en móvil
      finalConfig.showPageCorners = false; // Sin corners en móvil
      finalConfig.swipeDistance = 20; // Más sensible en móvil
    }
    // Tablets (769px - 1024px)
    else if (screenWidth <= 1024) {
      finalConfig.width = Math.min(screenWidth * 0.75, finalConfig.width);
      finalConfig.height = Math.min(screenHeight * 0.65, finalConfig.height);
      finalConfig.minWidth = Math.min(screenWidth * 0.6, 450);
      finalConfig.maxWidth = screenWidth * 0.85;
    }
    // Laptops pequeños (1025px - 1366px)
    else if (screenWidth <= 1366) {
      finalConfig.width = Math.min(screenWidth * 0.65, finalConfig.width);
      finalConfig.height = Math.min(screenHeight * 0.7, finalConfig.height);
      finalConfig.minWidth = Math.min(screenWidth * 0.5, 500);
      finalConfig.maxWidth = screenWidth * 0.8;
    }
    // Pantallas grandes (1367px+)
    else {
      finalConfig.width = Math.min(screenWidth * 0.6, finalConfig.width);
      finalConfig.height = Math.min(screenHeight * 0.7, finalConfig.height);
      finalConfig.minWidth = Math.min(screenWidth * 0.4, 600);
      finalConfig.maxWidth = screenWidth * 0.75;
    }

    // Asegurar dimensiones mínimas absolutas
    finalConfig.width = Math.max(finalConfig.width, 250);
    finalConfig.height = Math.max(finalConfig.height, 200);
    finalConfig.minWidth = Math.max(finalConfig.minWidth || 200, 200);
    finalConfig.minHeight = Math.max(finalConfig.minHeight || 150, 150);
  }

  // Manejar el cambio de página personalizado para móvil
  const handleFlip = (e: any) => {
    setCurrentPage(e.data);
    if (onFlip) {
      onFlip(e);
    }
  };

  // Función para navegar en móvil
  const handleMobileNavigation = (direction: 'prev' | 'next') => {
    let newPage = currentPage;
    
    if (direction === 'prev' && currentPage > 0) {
      newPage = currentPage - 1;
    } else if (direction === 'next' && currentPage < children.length - 1) {
      newPage = currentPage + 1;
    }
    
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
      if (onFlip) {
        onFlip({ data: newPage });
      }
    }
  };

  // En móvil, renderizar vista simplificada (una página a la vez)
  if (isMobile && responsive) {
    return (
      <div 
        className={`mobile-book-container ${className}`}
        style={{ 
          width: finalConfig.width, 
          height: finalConfig.height,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          ...style 
        }}
      >
        {/* Página actual */}
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {React.Children.toArray(children)[currentPage]}
        </div>

        {/* Controles de navegación táctil */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '40%',
            height: '100%',
            backgroundColor: 'transparent',
            zIndex: 10,
            cursor: 'pointer',
          }}
          onClick={() => handleMobileNavigation('prev')}
        />
        
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '40%',
            height: '100%',
            backgroundColor: 'transparent',
            zIndex: 10,
            cursor: 'pointer',
          }}
          onClick={() => handleMobileNavigation('next')}
        />

        {/* Indicador de página */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            zIndex: 20,
          }}
        >
          {currentPage + 1} / {children.length}
        </div>
      </div>
    );
  }

  // En desktop/tablet, usar el FlipBook normal
  return (
    <HTMLFlipBook
      ref={ref}
      width={finalConfig.width}
      height={finalConfig.height}
      size={finalConfig.size}
      minWidth={finalConfig.minWidth}
      maxWidth={finalConfig.maxWidth}
      minHeight={finalConfig.minHeight}
      maxHeight={finalConfig.maxHeight}
      showCover={finalConfig.showCover}
      drawShadow={finalConfig.drawShadow}
      flippingTime={finalConfig.flippingTime}
      usePortrait={finalConfig.usePortrait}
      startZIndex={finalConfig.startZIndex}
      startPage={finalConfig.startPage}
      clickEventForward={finalConfig.clickEventForward}
      useMouseEvents={finalConfig.useMouseEvents}
      swipeDistance={finalConfig.swipeDistance}
      showPageCorners={finalConfig.showPageCorners}
      disableFlipByClick={finalConfig.disableFlipByClick}
      autoSize={finalConfig.autoSize}
      maxShadowOpacity={finalConfig.maxShadowOpacity}
      mobileScrollSupport={finalConfig.mobileScrollSupport}
      className={`flip-book ${className}`}
      style={{ ...style }}
      onFlip={handleFlip}
      onChangeOrientation={onChangeOrientation}
      onChangeState={onChangeState}
    >
      {children}
    </HTMLFlipBook>
  );
});

FlipBook.displayName = 'FlipBook';

export default FlipBook;