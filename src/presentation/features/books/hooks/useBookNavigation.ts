/**
 * UBICACIÓN: src/presentation/features/book/hooks/useBookNavigation.ts
 * 
 * Hook para manejar la navegación entre páginas del libro
 */

import { useCallback } from 'react';
import type { page } from '@/src/core/domain/types';

interface UseBookNavigationProps {
  pages: page[];
  currentPage: number;
  isFlipping: boolean;
  setCurrentPage: (page: number) => void;
  setIsFlipping: (flipping: boolean) => void;
  setEditingField?: (field: 'title' | 'text' | null) => void;
  bookRef: React.RefObject<any>;
}

export interface UseBookNavigationReturn {
  goToPage: (pageIndex: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  onFlip: (e: unknown) => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

export const useBookNavigation = ({
  pages,
  currentPage,
  isFlipping,
  setCurrentPage,
  setIsFlipping,
  setEditingField,
  bookRef
}: UseBookNavigationProps): UseBookNavigationReturn => {

  // Navegación a página específica
  const goToPage = useCallback((pageIndex: number) => {
    if (!isFlipping && bookRef.current && pageIndex >= 0 && pageIndex < pages.length) {
      setIsFlipping(true);
      try {
        bookRef.current.pageFlip().flip(pageIndex);
        setCurrentPage(pageIndex);
      } catch (error) {
        console.error("Error al cambiar de página:", error);
        setIsFlipping(false);
      }
      setTimeout(() => setIsFlipping(false), 1000);
    }
  }, [pages.length, isFlipping, bookRef, setCurrentPage, setIsFlipping]);

  // Ir a página siguiente
  const nextPage = useCallback(() => {
    if (!isFlipping && currentPage < pages.length - 1) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, pages.length, isFlipping, goToPage]);

  // Ir a página anterior
  const prevPage = useCallback(() => {
    if (!isFlipping && currentPage > 0) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, isFlipping, goToPage]);

  // Handler para el evento onFlip del flipbook
  const onFlip = useCallback((e: unknown) => {
    const ev = e as { data: number };
    // Validar que el índice está dentro del rango válido
    if (ev.data >= 0 && ev.data < pages.length) {
      setCurrentPage(ev.data);
      // Limpiar estado de edición al cambiar página
      if (setEditingField) {
        setEditingField(null);
      }
    }
  }, [pages.length, setCurrentPage, setEditingField]);

  // Computed properties para habilitar/deshabilitar navegación
  const canGoNext = !isFlipping && currentPage < pages.length - 1;
  const canGoPrev = !isFlipping && currentPage > 0;

  return {
    goToPage,
    nextPage,
    prevPage,
    onFlip,
    canGoNext,
    canGoPrev
  };
};