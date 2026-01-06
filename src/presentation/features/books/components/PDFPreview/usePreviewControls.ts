/**
 * UBICACIÓN: src/presentation/features/books/components/PDFPreview/usePreviewControls.ts
 * ✅ CORREGIDO: Evita loops de efectos
 */

import { useState, useEffect, useRef, useCallback } from 'react';
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
  
  // ✅ Refs para evitar recrear funciones
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Inicializar cliente y detectar móvil una sola vez
  useEffect(() => {
    setIsClient(true);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ✅ Auto-ocultar controles (solo en desktop)
  useEffect(() => {
    // Limpiar timeout anterior
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    // Si es móvil, siempre mostrar controles
    if (isMobile) {
      setShowControls(true);
      return;
    }

    // En desktop, ocultar después de 2 segundos
    const resetTimer = () => {
      setShowControls(true);
      
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      
      hideTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    };

    // Eventos para mostrar controles
    const handleInteraction = () => {
      resetTimer();
    };

    resetTimer();
    
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('click', handleInteraction);

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('click', handleInteraction);
    };
  }, [isMobile]); // ✅ Solo depende de isMobile

  // ✅ Navegación con teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft') {
        goToPrevPage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, pages.length, onClose]);

  // ✅ Funciones de navegación estables
  const goToNextPage = useCallback(() => {
    if (currentPage < pages.length - 1 && bookRef.current) {
      bookRef.current.pageFlip().flipNext();
    }
  }, [currentPage, pages.length]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 0 && bookRef.current) {
      bookRef.current.pageFlip().flipPrev();
    }
  }, [currentPage]);

  const handleFlip = useCallback((e: any) => {
    setCurrentPage(e.data);
    setActivePage(e.data);
  }, []);

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