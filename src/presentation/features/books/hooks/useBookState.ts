/**
 * UBICACIÓN: src/presentation/features/books/hooks/useBookState.ts
 */

import { useState, useCallback, useEffect } from 'react';
import type { page } from '@/src/typings/types-page-book/index';

interface UseBookStateProps {
  initialPages?: page[];
  title?: string;
}

interface UseBookStateReturn {
  pages: page[];
  currentPage: number;
  isFlipping: boolean;
  bookKey: number;
  setPages: React.Dispatch<React.SetStateAction<page[]>>;
  setCurrentPage: (page: number) => void;
  setIsFlipping: (flipping: boolean) => void;
  addPage: () => void;
  deletePage: () => void;
  handleLayoutChange: (layout: string) => void;
  handleBackgroundChange: (value: string) => void;
  forceRerender: () => void;
}

const createDefaultPages = (title?: string): page[] => [
  { id: 'page-1', layout: 'CoverLayout', title: title || "", text: "", image: null, background: null },
  { id: 'page-2', layout: 'TextCenterLayout', title: "", text: "", image: null, background: null },
  { id: 'page-3', layout: 'TextCenterLayout', title: "", text: "", image: null, background: null },
];

export const useBookState = ({ initialPages, title }: UseBookStateProps = {}): UseBookStateReturn => {
  const [pages, setPages] = useState<page[]>(() => {
    if (initialPages && initialPages.length > 0) return initialPages;
    return createDefaultPages(title);
  });

  const [currentPage, setCurrentPageState] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [bookKey, setBookKey] = useState(0);

  const setCurrentPage = useCallback((pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      setCurrentPageState(pageIndex);
    }
  }, [pages.length]);

  const forceRerender = useCallback(() => {
    setBookKey(prev => prev + 1);
  }, []);

  const addPage = useCallback(() => {
    const newPageId = `page-${Date.now()}`;
    setPages(prev => [...prev, {
      id: newPageId,
      layout: 'TextCenterLayout',
      title: `Página ${prev.length + 1}`,
      text: `Continúa tu historia aquí...`,
      image: null,
      background: null
    }]);
  }, []);

  const deletePage = useCallback(() => {
    if (pages.length > 2) {
      setPages(prev => prev.filter((_, index) => index !== currentPage));
      if (currentPage > 0) setCurrentPage(currentPage - 1);
      forceRerender();
    }
  }, [pages.length, currentPage, setCurrentPage, forceRerender]);

  const handleLayoutChange = useCallback((layout: string) => {
    setPages(prev => {
      const updated = [...prev];
      updated[currentPage] = { ...updated[currentPage], layout };
      return updated;
    });
    forceRerender();
  }, [currentPage, forceRerender]);

  const handleBackgroundChange = useCallback((value: string) => {
    setPages(prev => {
      const updated = [...prev];
      updated[currentPage] = { ...updated[currentPage], background: value || null };
      return updated;
    });
    setTimeout(() => forceRerender(), 50);
  }, [currentPage, forceRerender]);

  return {
    pages, currentPage, isFlipping, bookKey,
    setPages, setCurrentPage, setIsFlipping,
    addPage, deletePage,
    handleLayoutChange, handleBackgroundChange,
    forceRerender
  };
};