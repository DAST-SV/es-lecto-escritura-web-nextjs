// useFlipBook.ts - Hook para controlar el FlipBook con soporte móvil
import React, { useRef, useCallback, useState, useEffect } from 'react';

export interface UseFlipBookReturn {
  bookRef: React.RefObject<any>;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (pageIndex: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  onFlip: (e: any) => void;
  isFirstPage: boolean;
  isLastPage: boolean;
  canFlipNext: boolean;
  canFlipPrev: boolean;
  isMobile: boolean;
}

interface UseFlipBookProps {
  totalPages: number;
  onPageChange?: (page: number) => void;
  enableKeyboardNavigation?: boolean;
}

// Función para detectar si es móvil
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const useFlipBook = ({ 
  totalPages, 
  onPageChange,
  enableKeyboardNavigation = true 
}: UseFlipBookProps): UseFlipBookReturn => {
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPageState] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
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

  const setCurrentPage = useCallback((page: number) => {
    const safePage = Math.max(0, Math.min(page, totalPages - 1));
    setCurrentPageState(safePage);
    if (onPageChange) {
      onPageChange(safePage);
    }
  }, [totalPages, onPageChange]);

  const nextPage = useCallback(() => {
    try {
      if (bookRef.current?.nextPage) {
        // Usar el método específico del FlipBook que maneja móvil/desktop
        bookRef.current.nextPage();
      } else if (bookRef.current?.pageFlip) {
        // Fallback para el método original
        bookRef.current.pageFlip().flipNext();
      } else if (isMobile) {
        // Fallback directo para móvil
        if (currentPage < totalPages - 1) {
          const newPage = currentPage + 1;
          setCurrentPage(newPage);
        }
      }
    } catch (error) {
      console.warn('Could not flip to next page:', error);
    }
  }, [bookRef, currentPage, totalPages, setCurrentPage, isMobile]);

  const prevPage = useCallback(() => {
    try {
      if (bookRef.current?.prevPage) {
        // Usar el método específico del FlipBook que maneja móvil/desktop
        bookRef.current.prevPage();
      } else if (bookRef.current?.pageFlip) {
        // Fallback para el método original
        bookRef.current.pageFlip().flipPrev();
      } else if (isMobile) {
        // Fallback directo para móvil
        if (currentPage > 0) {
          const newPage = currentPage - 1;
          setCurrentPage(newPage);
        }
      }
    } catch (error) {
      console.warn('Could not flip to previous page:', error);
    }
  }, [bookRef, currentPage, setCurrentPage, isMobile]);

  const goToPage = useCallback((pageIndex: number) => {
    const safePage = Math.max(0, Math.min(pageIndex, totalPages - 1));
    
    try {
      if (bookRef.current?.goToPage) {
        // Usar el método específico del FlipBook que maneja móvil/desktop
        bookRef.current.goToPage(safePage);
      } else if (bookRef.current?.pageFlip) {
        // Fallback para el método original
        bookRef.current.pageFlip().flip(safePage);
      } else {
        // Fallback directo
        setCurrentPage(safePage);
      }
    } catch (error) {
      console.warn('Could not go to page:', error);
      setCurrentPage(safePage);
    }
  }, [totalPages, setCurrentPage, bookRef]);

  const goToFirstPage = useCallback(() => {
    goToPage(0);
  }, [goToPage]);

  const goToLastPage = useCallback(() => {
    goToPage(totalPages - 1);
  }, [goToPage, totalPages]);

  const onFlip = useCallback((e: any) => {
    const newPage = typeof e.data === 'number' ? e.data : e.data || 0;
    setCurrentPageState(newPage);
    if (onPageChange) {
      onPageChange(newPage);
    }
  }, [onPageChange]);

  // Estados derivados
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage >= totalPages - 1;
  const canFlipNext = !isLastPage;
  const canFlipPrev = !isFirstPage;

  // Navegación por teclado (opcional y adaptada para móvil)
  useEffect(() => {
    if (!enableKeyboardNavigation) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // En móvil, ser más selectivo con las teclas
      if (isMobile && !['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prevPage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextPage();
          break;
        case 'Home':
          if (!isMobile) {
            e.preventDefault();
            goToFirstPage();
          }
          break;
        case 'End':
          if (!isMobile) {
            e.preventDefault();
            goToLastPage();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [enableKeyboardNavigation, nextPage, prevPage, goToFirstPage, goToLastPage, isMobile]);

  return {
    bookRef,
    currentPage,
    setCurrentPage,
    nextPage,
    prevPage,
    goToPage,
    goToFirstPage,
    goToLastPage,
    onFlip,
    isFirstPage,
    isLastPage,
    canFlipNext,
    canFlipPrev,
    isMobile,
  };
};

// Hook mejorado para responsive design
export const useResponsiveFlipBook = () => {
  const [screenSize, setScreenSize] = useState<'mobile' | 'mobile-large' | 'tablet' | 'laptop' | 'desktop'>('desktop');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');

  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Determinar tamaño de pantalla
      if (width <= 480) {
        setScreenSize('mobile');
      } else if (width <= 768) {
        setScreenSize('mobile-large');
      } else if (width <= 1024) {
        setScreenSize('tablet');
      } else if (width <= 1366) {
        setScreenSize('laptop');
      } else {
        setScreenSize('desktop');
      }

      // Determinar orientación
      setOrientation(width > height ? 'landscape' : 'portrait');
    };

    updateScreenInfo();
    window.addEventListener('resize', updateScreenInfo);
    window.addEventListener('orientationchange', updateScreenInfo);
    
    return () => {
      window.removeEventListener('resize', updateScreenInfo);
      window.removeEventListener('orientationchange', updateScreenInfo);
    };
  }, []);

  const getPreset = () => {
    switch (screenSize) {
      case 'mobile':
      case 'mobile-large':
        return 'mobile';
      case 'tablet':
        return 'children';
      case 'laptop':
        return 'desktop';
      default:
        return 'desktop';
    }
  };

  const isMobile = screenSize === 'mobile' || screenSize === 'mobile-large';
  const isTablet = screenSize === 'tablet';
  const isDesktop = screenSize === 'laptop' || screenSize === 'desktop';

  return {
    screenSize,
    orientation,
    preset: getPreset() as keyof typeof import('./FlipBook').flipBookPresets,
    isMobile,
    isTablet,
    isDesktop,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1200,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 800,
  };
};