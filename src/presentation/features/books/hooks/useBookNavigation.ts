/**
 * UBICACIÓN: src/presentation/features/books/hooks/useBookNavigation.ts
 * ✅ CORREGIDO: Usar Page en vez de page
 */

import { useCallback } from 'react';
import { Page } from '@/src/core/domain/types'; // ✅ Import correcto

interface UseBookNavigationProps {
  pages: Page[];
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

  const nextPage = useCallback(() => {
    if (!isFlipping && currentPage < pages.length - 1) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, pages.length, isFlipping, goToPage]);

  const prevPage = useCallback(() => {
    if (!isFlipping && currentPage > 0) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, isFlipping, goToPage]);

  const onFlip = useCallback((e: unknown) => {
    const ev = e as { data: number };
    if (ev.data >= 0 && ev.data < pages.length) {
      setCurrentPage(ev.data);
      if (setEditingField) {
        setEditingField(null);
      }
    }
  }, [pages.length, setCurrentPage, setEditingField]);

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