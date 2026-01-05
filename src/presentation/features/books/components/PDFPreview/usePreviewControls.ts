/**
 * UBICACIÓN: src/presentation/features/books/components/PDFPreview/usePreviewControls.ts
 * Hook para preview - Auto-ocultar controles
 */

import { useState, useEffect, useRef } from 'react';
import type { Page } from '@/src/core/domain/types';

interface UsePreviewControlsProps {
  pages: Page[];
  onClose: () => void;
}

export function usePreviewControls({ pages, onClose }: UsePreviewControlsProps) {
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [activePage, setActivePage] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Detectar móvil
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-ocultar controles después de 2 segundos
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const resetTimer = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    };

    resetTimer();
    
    // Solo en desktop
    if (!isMobile) {
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('click', resetTimer);
    }

    return () => {
      clearTimeout(timeout);
      if (!isMobile) {
        window.removeEventListener('mousemove', resetTimer);
        window.removeEventListener('click', resetTimer);
      }
    };
  }, [isMobile]);

  // Navegación con teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNextPage();
      if (e.key === 'ArrowLeft') goToPrevPage();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, pages.length]);

  const goToNextPage = () => {
    if (currentPage < pages.length - 1) {
      bookRef.current?.pageFlip().flipNext();
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      bookRef.current?.pageFlip().flipPrev();
    }
  };

  const handleFlip = (e: any) => {
    setCurrentPage(e.data);
    setActivePage(e.data);
  };

  return {
    bookRef,
    currentPage,
    activePage,
    showControls,
    isClient,
    isMobile,
    goToNextPage,
    goToPrevPage,
    handleFlip,
  };
}